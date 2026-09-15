//! Owns decision-model evaluation and final poll outcomes, including
//! ratification and closure. Periodic discovery remains in `sync.rs`

use axum::http::StatusCode;
use chrono::{DateTime, FixedOffset};
use entity::{
    channel_members, channels,
    enums::{
        NotificationKind, PollClosedReason, PollDecisionMakingModel, PollStage,
        VoteType,
    },
    notifications, poll_configs, polls, votes,
};
use sea_orm::{
    prelude::Uuid, sea_query::Query, ActiveModelTrait, ColumnTrait,
    ConnectionTrait, EntityTrait, IntoActiveModel, PaginatorTrait, QueryFilter,
    Set,
};
use std::collections::HashSet;

use crate::{
    authz,
    common::{ApiError, AppResult},
    notifications::{self as notifications_service, WithNotifications},
    poll_actions,
};

/// Server-role subject that gates blocking when a server restricts it
pub(crate) const PROPOSAL_BLOCK_SUBJECT: &str = "ProposalBlock";

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(crate) enum ProposalFinalization {
    Ratified,
    Closed(PollClosedReason),
}

pub(crate) async fn is_poll_ratifiable<C>(
    database: &C,
    poll_id: Uuid,
    now: DateTime<FixedOffset>,
) -> AppResult<bool>
where
    C: ConnectionTrait,
{
    let poll = polls::Entity::find_by_id(poll_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Poll not found.")
        })?;
    if poll.stage != "voting" {
        return Ok(false);
    }
    let config = poll_configs::Entity::find()
        .filter(poll_configs::Column::PollId.eq(poll_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Poll config not found.",
            )
        })?;

    is_poll_ratifiable_with_context(database, &poll, &config, now).await
}

pub(super) async fn is_poll_ratifiable_with_context<C>(
    database: &C,
    poll: &polls::Model,
    config: &poll_configs::Model,
    now: DateTime<FixedOffset>,
) -> AppResult<bool>
where
    C: ConnectionTrait,
{
    if poll.stage != PollStage::Voting {
        return Ok(false);
    }
    let current_channel_member_ids = Query::select()
        .column(channel_members::Column::UserId)
        .from(channel_members::Entity)
        .and_where(channel_members::Column::ChannelId.eq(poll.channel_id))
        .to_owned();
    let votes = votes::Entity::find()
        .filter(votes::Column::PollId.eq(poll.id))
        .filter(votes::Column::UserId.in_subquery(current_channel_member_ids))
        .all(database)
        .await
        .map_err(internal_error)?;

    let ignored_blockers =
        get_ineligible_block_voters(database, poll, config, &votes).await?;
    let votes = drop_ignored_blocks(votes, &ignored_blockers);

    match config.decision_making_model {
        Some(PollDecisionMakingModel::Consensus) => {
            let member_count =
                get_channel_member_count(database, poll.channel_id).await?;
            has_consensus(&votes, config, member_count, now)
        }
        Some(PollDecisionMakingModel::Consent) => {
            has_consent(&votes, config, now)
        }
        Some(PollDecisionMakingModel::MajorityVote) => {
            let member_count =
                get_channel_member_count(database, poll.channel_id).await?;
            has_majority_vote(&votes, config, member_count, now)
        }
        None => Ok(false),
    }
}

/// Blocks cast by members who no longer hold `ProposalBlock` are kept as vote
/// rows but stop carrying veto weight. Resolved once per evaluation over the
/// distinct block voters rather than per vote
async fn get_ineligible_block_voters<C>(
    database: &C,
    poll: &polls::Model,
    config: &poll_configs::Model,
    votes: &[votes::Model],
) -> AppResult<HashSet<Uuid>>
where
    C: ConnectionTrait,
{
    if config.blocks_open_to_all != Some(false) {
        return Ok(HashSet::new());
    }

    let block_voters: HashSet<Uuid> = votes
        .iter()
        .filter(|vote| vote.vote_type == Some(VoteType::Block))
        .map(|vote| vote.user_id)
        .collect();
    if block_voters.is_empty() {
        return Ok(HashSet::new());
    }

    let server_id = get_server_id_by_channel(database, poll.channel_id).await?;
    let eligible = authz::filter_users_who_can(
        database,
        &block_voters,
        "create",
        PROPOSAL_BLOCK_SUBJECT,
        server_id,
    )
    .await?;
    Ok(block_voters.difference(&eligible).copied().collect())
}

/// Removes blocks cast by voters the server no longer counts
fn drop_ignored_blocks(
    votes: Vec<votes::Model>,
    ignored_blockers: &HashSet<Uuid>,
) -> Vec<votes::Model> {
    votes
        .into_iter()
        .filter(|vote| {
            vote.vote_type != Some(VoteType::Block)
                || !ignored_blockers.contains(&vote.user_id)
        })
        .collect()
}

async fn get_server_id_by_channel<C>(
    database: &C,
    channel_id: Uuid,
) -> AppResult<Uuid>
where
    C: ConnectionTrait,
{
    channels::Entity::find_by_id(channel_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .map(|channel| channel.server_id)
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Channel not found.")
        })
}

async fn ratify_poll<C>(database: &C, poll_id: Uuid) -> AppResult<()>
where
    C: ConnectionTrait,
{
    let poll = polls::Entity::find_by_id(poll_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Poll not found.")
        })?;
    let mut active = poll.into_active_model();
    active.stage = Set(PollStage::Ratified);
    active.closed_reason = Set(None);
    active.update(database).await.map_err(internal_error)?;
    Ok(())
}

pub(crate) async fn finalize_ratifiable_proposal(
    transaction: &sea_orm::DatabaseTransaction,
    poll_id: Uuid,
    now: DateTime<FixedOffset>,
) -> AppResult<WithNotifications<ProposalFinalization>> {
    if let Some(reason) = poll_actions::service::plan_event_closed_reason(
        transaction,
        poll_id,
        now,
    )
    .await?
    {
        close_poll_with_reason(transaction, poll_id, Some(reason)).await?;
        let notifications = notify_proposal_outcome(
            transaction,
            poll_id,
            NotificationKind::ProposalClosed,
        )
        .await?;
        return Ok(WithNotifications::new(
            ProposalFinalization::Closed(reason),
            notifications,
        ));
    }

    let action_notifications =
        poll_actions::service::implement_poll_action_in_transaction(
            transaction,
            poll_id,
        )
        .await?;
    ratify_poll(transaction, poll_id).await?;
    let mut notifications = notify_proposal_outcome(
        transaction,
        poll_id,
        NotificationKind::ProposalRatified,
    )
    .await?;
    notifications.extend(action_notifications);

    Ok(WithNotifications::new(
        ProposalFinalization::Ratified,
        notifications,
    ))
}

pub(super) async fn notify_proposal_outcome<C>(
    database: &C,
    poll_id: Uuid,
    kind: NotificationKind,
) -> AppResult<Vec<notifications::Model>>
where
    C: ConnectionTrait,
{
    let Some(poll) = polls::Entity::find_by_id(poll_id)
        .one(database)
        .await
        .map_err(internal_error)?
    else {
        return Ok(Vec::new());
    };
    let Some(channel) = channels::Entity::find_by_id(poll.channel_id)
        .one(database)
        .await
        .map_err(internal_error)?
    else {
        return Ok(Vec::new());
    };

    let mut recipient_ids = vec![poll.user_id];
    recipient_ids.extend(
        votes::Entity::find()
            .filter(votes::Column::PollId.eq(poll_id))
            .all(database)
            .await
            .map_err(internal_error)?
            .into_iter()
            .map(|vote| vote.user_id),
    );

    notifications_service::create_notifications(
        database,
        notifications_service::CreateNotificationsRequest {
            kind,
            server_id: channel.server_id,
            channel_id: Some(poll.channel_id),
            actor_user_id: None,
            target: notifications_service::NotificationTarget::Poll(poll_id),
            vote_type: None,
            recipient_ids,
        },
    )
    .await
}

async fn get_channel_member_count<C>(
    database: &C,
    channel_id: Uuid,
) -> AppResult<usize>
where
    C: ConnectionTrait,
{
    channel_members::Entity::find()
        .filter(channel_members::Column::ChannelId.eq(channel_id))
        .count(database)
        .await
        .map(|count| count as usize)
        .map_err(internal_error)
}

fn has_consensus(
    votes: &[votes::Model],
    config: &poll_configs::Model,
    member_count: usize,
    now: DateTime<FixedOffset>,
) -> AppResult<bool> {
    if config
        .closing_at
        .map(|closing_at| now < closing_at)
        .unwrap_or(false)
    {
        return Ok(false);
    }
    if quorum_missing(votes, config, member_count)? {
        return Ok(false);
    }
    let (agreements, disagreements, abstains, blocks) = count_votes(votes);
    let participants = agreements + disagreements;
    Ok(participants > 0
        && agreements
            >= get_required_count(
                participants,
                required(config.agreement_threshold)?,
            )
        && disagreements <= required(config.disagreements_limit)? as usize
        && abstains <= required(config.abstains_limit)? as usize
        && blocks == 0)
}

fn has_majority_vote(
    votes: &[votes::Model],
    config: &poll_configs::Model,
    member_count: usize,
    now: DateTime<FixedOffset>,
) -> AppResult<bool> {
    if config
        .closing_at
        .map(|closing_at| now < closing_at)
        .unwrap_or(false)
    {
        return Ok(false);
    }
    if quorum_missing(votes, config, member_count)? {
        return Ok(false);
    }
    let (agreements, disagreements, _, _) = count_votes(votes);
    let participants = agreements + disagreements;
    Ok(participants > 0
        && agreements
            >= get_required_count(
                participants,
                required(config.agreement_threshold)?,
            ))
}

/// Consent evaluates only at a finite deadline, so a missing `closing_at`
/// is never ratifiable
fn has_consent(
    votes: &[votes::Model],
    config: &poll_configs::Model,
    now: DateTime<FixedOffset>,
) -> AppResult<bool> {
    let Some(closing_at) = config.closing_at else {
        return Ok(false);
    };
    if now < closing_at {
        return Ok(false);
    }
    let (_, disagreements, abstains, blocks) = count_votes(votes);
    Ok(
        disagreements <= required(config.disagreements_limit)? as usize
            && abstains <= required(config.abstains_limit)? as usize
            && blocks == 0,
    )
}

fn quorum_missing(
    votes: &[votes::Model],
    config: &poll_configs::Model,
    member_count: usize,
) -> AppResult<bool> {
    if config.quorum_enabled.unwrap_or(false) {
        let threshold = required(config.quorum_threshold)?;
        return Ok(votes.len() < get_required_count(member_count, threshold));
    }
    Ok(false)
}

fn count_votes(votes: &[votes::Model]) -> (usize, usize, usize, usize) {
    let mut agreements = 0;
    let mut disagreements = 0;
    let mut abstains = 0;
    let mut blocks = 0;
    for vote in votes {
        match vote.vote_type {
            Some(VoteType::Agree) => agreements += 1,
            Some(VoteType::Disagree) => disagreements += 1,
            Some(VoteType::Abstain) => abstains += 1,
            Some(VoteType::Block) => blocks += 1,
            _ => {}
        }
    }
    (agreements, disagreements, abstains, blocks)
}

fn required(value: Option<i32>) -> AppResult<i32> {
    value.ok_or_else(|| {
        ApiError::new(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Missing poll configuration.",
        )
    })
}

fn get_required_count(member_count: usize, threshold: i32) -> usize {
    ((member_count as f64) * (threshold as f64 * 0.01)).ceil() as usize
}

pub(super) async fn close_poll<C>(database: &C, poll_id: Uuid) -> AppResult<()>
where
    C: ConnectionTrait,
{
    close_poll_with_reason(database, poll_id, None).await
}

pub(super) async fn close_poll_with_reason<C>(
    database: &C,
    poll_id: Uuid,
    reason: Option<PollClosedReason>,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    let poll = polls::Entity::find_by_id(poll_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Poll not found.")
        })?;
    let mut active = poll.into_active_model();
    active.stage = Set(PollStage::Closed);
    active.closed_reason = Set(reason);
    active.update(database).await.map_err(internal_error)?;
    Ok(())
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("poll outcome processing failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}

#[cfg(test)]
mod tests {
    use chrono::{Duration, FixedOffset, TimeZone};

    use super::*;

    fn timestamp() -> DateTime<FixedOffset> {
        FixedOffset::east_opt(0)
            .expect("UTC offset should be valid")
            .with_ymd_and_hms(2026, 9, 3, 12, 0, 0)
            .single()
            .expect("timestamp should be valid")
    }

    fn config() -> poll_configs::Model {
        let now = timestamp();
        poll_configs::Model {
            id: Uuid::new_v4(),
            poll_id: Uuid::new_v4(),
            decision_making_model: None,
            disagreements_limit: Some(1),
            abstains_limit: Some(1),
            agreement_threshold: Some(51),
            quorum_enabled: Some(false),
            quorum_threshold: Some(50),
            blocks_open_to_all: Some(true),
            multiple_choice: None,
            closing_at: None,
            created_at: now,
            updated_at: now,
        }
    }

    fn vote(vote_type: VoteType) -> votes::Model {
        let now = timestamp();
        votes::Model {
            id: Uuid::new_v4(),
            poll_id: Uuid::new_v4(),
            user_id: Uuid::new_v4(),
            vote_type: Some(vote_type),
            created_at: now,
            updated_at: now,
        }
    }

    fn votes(vote_types: &[VoteType]) -> Vec<votes::Model> {
        vote_types.iter().copied().map(vote).collect()
    }

    #[test]
    fn has_consensus_enforces_deadline_quorum_threshold_and_limits() {
        let now = timestamp();
        let mut config = config();
        config.quorum_enabled = Some(true);

        assert!(!has_consensus(&votes(&[VoteType::Agree]), &config, 4, now,)
            .expect("consensus evaluation should succeed"));
        assert!(!has_consensus(
            &votes(&[VoteType::Agree, VoteType::Disagree]),
            &config,
            4,
            now,
        )
        .expect("consensus evaluation should succeed"));
        assert!(has_consensus(
            &votes(&[VoteType::Agree, VoteType::Agree, VoteType::Disagree,]),
            &config,
            4,
            now,
        )
        .expect("consensus evaluation should succeed"));
        assert!(!has_consensus(
            &votes(&[VoteType::Agree, VoteType::Agree, VoteType::Block,]),
            &config,
            4,
            now,
        )
        .expect("consensus evaluation should succeed"));
        assert!(!has_consensus(
            &votes(&[
                VoteType::Agree,
                VoteType::Agree,
                VoteType::Agree,
                VoteType::Disagree,
                VoteType::Disagree,
            ]),
            &config,
            4,
            now,
        )
        .expect("consensus evaluation should succeed"));
        assert!(!has_consensus(
            &votes(&[
                VoteType::Agree,
                VoteType::Agree,
                VoteType::Abstain,
                VoteType::Abstain,
            ]),
            &config,
            4,
            now,
        )
        .expect("consensus evaluation should succeed"));

        config.closing_at = Some(now + Duration::minutes(1));
        assert!(!has_consensus(
            &votes(&[VoteType::Agree, VoteType::Agree]),
            &config,
            4,
            now,
        )
        .expect("consensus evaluation should succeed"));
        assert!(has_consensus(
            &votes(&[VoteType::Agree, VoteType::Agree]),
            &config,
            4,
            now + Duration::minutes(1),
        )
        .expect("consensus evaluation should succeed"));
    }

    #[test]
    fn has_consent_requires_deadline_and_enforces_limits_at_boundary() {
        let now = timestamp();
        let mut config = config();

        assert!(!has_consent(&[], &config, now)
            .expect("consent evaluation should succeed"));

        config.closing_at = Some(now + Duration::minutes(1));
        assert!(!has_consent(&[], &config, now)
            .expect("consent evaluation should succeed"));
        assert!(has_consent(&[], &config, now + Duration::minutes(1))
            .expect("consent evaluation should succeed"));
        assert!(has_consent(
            &votes(&[VoteType::Disagree, VoteType::Abstain]),
            &config,
            now + Duration::minutes(1),
        )
        .expect("consent evaluation should succeed"));
        assert!(!has_consent(
            &votes(&[VoteType::Disagree, VoteType::Disagree]),
            &config,
            now + Duration::minutes(1),
        )
        .expect("consent evaluation should succeed"));
        assert!(!has_consent(
            &votes(&[VoteType::Abstain, VoteType::Abstain]),
            &config,
            now + Duration::minutes(1),
        )
        .expect("consent evaluation should succeed"));
        assert!(!has_consent(
            &votes(&[VoteType::Block]),
            &config,
            now + Duration::minutes(1),
        )
        .expect("consent evaluation should succeed"));
    }

    #[test]
    fn has_majority_vote_uses_non_abstaining_participants_and_quorum() {
        let now = timestamp();
        let mut config = config();
        config.quorum_enabled = Some(true);

        assert!(!has_majority_vote(
            &votes(&[VoteType::Agree]),
            &config,
            4,
            now,
        )
        .expect("majority evaluation should succeed"));
        assert!(!has_majority_vote(
            &votes(&[VoteType::Agree, VoteType::Disagree]),
            &config,
            4,
            now,
        )
        .expect("majority evaluation should succeed"));
        assert!(has_majority_vote(
            &votes(&[VoteType::Agree, VoteType::Agree, VoteType::Disagree,]),
            &config,
            4,
            now,
        )
        .expect("majority evaluation should succeed"));
        assert!(has_majority_vote(
            &votes(&[VoteType::Agree, VoteType::Abstain]),
            &config,
            4,
            now,
        )
        .expect("abstentions should count for quorum but not the majority"));

        config.closing_at = Some(now + Duration::minutes(1));
        assert!(!has_majority_vote(
            &votes(&[VoteType::Agree, VoteType::Agree]),
            &config,
            4,
            now,
        )
        .expect("majority evaluation should succeed"));
        assert!(has_majority_vote(
            &votes(&[VoteType::Agree, VoteType::Agree]),
            &config,
            4,
            now + Duration::minutes(1),
        )
        .expect("majority evaluation should succeed"));
    }
}
