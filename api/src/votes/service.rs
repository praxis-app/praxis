use axum::http::StatusCode;
use chrono::Utc;
use entity::{
    calls, channels as channel_entities,
    enums::{
        ForumPostStatus, NotificationKind, PollDecisionMakingModel, PollStage,
        PollType, VoteType,
    },
    forum_posts, notifications, poll_actions as poll_action_entities,
    poll_configs, poll_option_selections, poll_options, polls, users,
    votes as vote_entities,
};
use sea_orm::{
    prelude::Uuid, sea_query::LockType, ActiveModelTrait, ColumnTrait,
    ConnectionTrait, DatabaseConnection, DatabaseTransaction, EntityTrait,
    IntoActiveModel, PaginatorTrait, QueryFilter, QuerySelect, Set,
    TransactionTrait,
};
use std::collections::{HashMap, HashSet};
use uuid::Uuid as NativeUuid;

use super::types::{
    CreateVoteResponse, PollOptionVoterResponse, UpdateVoteResponse,
    VoteRequest, VoteResponse,
};
use crate::{
    authz::{self, PermissionScope},
    channels,
    common::{request::parse_uuid, ApiError, AppResult},
    forum, invites,
    notifications::{self as notifications_service, WithNotifications},
    polls::{service as polls_service, PROPOSAL_BLOCK_SUBJECT},
    users as users_service,
};

#[cfg(test)]
mod tests;

pub(super) async fn create_vote(
    database: &DatabaseConnection,
    server_id: Uuid,
    poll: polls::Model,
    user_id: Uuid,
    request: VoteRequest,
) -> AppResult<WithNotifications<CreateVoteResponse>> {
    let transaction = database.begin().await.map_err(internal_error)?;
    let (poll, config) =
        lock_poll_for_vote_mutation(&transaction, poll.id).await?;
    lock_voter_membership(&transaction, &poll, user_id).await?;
    validate_vote_request(
        &transaction,
        server_id,
        user_id,
        &poll,
        &config,
        &request,
    )
    .await?;

    if vote_entities::Entity::find()
        .filter(vote_entities::Column::PollId.eq(poll.id))
        .filter(vote_entities::Column::UserId.eq(user_id))
        .one(&transaction)
        .await
        .map_err(internal_error)?
        .is_some()
    {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "You have already voted on this poll.",
        ));
    }

    let poll_option_ids = parse_poll_option_ids(&request)?;
    validate_poll_option_ids(&transaction, poll.id, &poll_option_ids).await?;
    let vote = vote_entities::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        poll_id: Set(poll.id),
        user_id: Set(user_id),
        vote_type: Set(parse_vote_type_value(request.vote_type.as_deref())?),
        ..Default::default()
    }
    .insert(&transaction)
    .await
    .map_err(internal_error)?;

    save_poll_option_selections(&transaction, vote.id, &poll_option_ids)
        .await?;
    let mut notifications =
        notify_proposal_vote(&transaction, &poll, &vote).await?;
    let finalization =
        synchronize_ratification_after_vote(&transaction, &poll).await?;
    forum::service::touch_forum_post_activity_for_poll(
        &transaction,
        poll.id,
        vote.updated_at,
    )
    .await?;

    transaction.commit().await.map_err(internal_error)?;
    let is_ratifying_vote = matches!(
        finalization.as_ref().map(|outcome| outcome.value),
        Some(polls_service::ProposalFinalization::Ratified)
    );
    let closed_reason = match finalization.as_ref().map(|o| o.value) {
        Some(polls_service::ProposalFinalization::Closed(reason)) => {
            Some(reason.to_string())
        }
        _ => None,
    };
    if let Some(outcome) = finalization {
        notifications.extend(outcome.notifications);
    }

    Ok(WithNotifications::new(
        CreateVoteResponse {
            id: vote.id.to_string(),
            poll_id: vote.poll_id.to_string(),
            user_id: vote.user_id.to_string(),
            vote_type: vote.vote_type.map(|value| value.to_string()),
            poll_option_ids: (!poll_option_ids.is_empty()).then(|| {
                poll_option_ids.iter().map(ToString::to_string).collect()
            }),
            is_ratifying_vote,
            closed_reason,
        },
        notifications,
    ))
}

async fn notify_proposal_vote(
    database: &DatabaseTransaction,
    poll: &polls::Model,
    vote: &vote_entities::Model,
) -> AppResult<Vec<notifications::Model>> {
    if poll.poll_type != PollType::Proposal {
        return Ok(Vec::new());
    }
    let Some(channel) = channel_entities::Entity::find_by_id(poll.channel_id)
        .one(database)
        .await
        .map_err(internal_error)?
    else {
        return Ok(Vec::new());
    };

    notifications_service::create_notifications(
        database,
        notifications_service::CreateNotificationsRequest {
            kind: NotificationKind::ProposalVote,
            server_id: channel.server_id,
            channel_id: Some(poll.channel_id),
            actor_user_id: Some(vote.user_id),
            target: notifications_service::NotificationTarget::Poll(poll.id),
            vote_type: vote.vote_type,
            recipient_ids: vec![poll.user_id],
        },
    )
    .await
}

pub(super) async fn update_vote(
    database: &DatabaseConnection,
    server_id: Uuid,
    poll: polls::Model,
    vote_id: Uuid,
    user_id: Uuid,
    request: VoteRequest,
) -> AppResult<WithNotifications<UpdateVoteResponse>> {
    let transaction = database.begin().await.map_err(internal_error)?;

    let (poll, config) =
        lock_poll_for_vote_mutation(&transaction, poll.id).await?;
    lock_voter_membership(&transaction, &poll, user_id).await?;
    validate_vote_request(
        &transaction,
        server_id,
        user_id,
        &poll,
        &config,
        &request,
    )
    .await?;

    let vote = vote_entities::Entity::find_by_id(vote_id)
        .filter(vote_entities::Column::PollId.eq(poll.id))
        .one(&transaction)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Vote not found.")
        })?;
    if vote.user_id != user_id {
        return Err(ApiError::new(StatusCode::FORBIDDEN, "Forbidden."));
    }

    let poll_option_ids = parse_poll_option_ids(&request)?;
    validate_poll_option_ids(&transaction, poll.id, &poll_option_ids).await?;
    let mut active = vote.into_active_model();
    active.vote_type =
        Set(parse_vote_type_value(request.vote_type.as_deref())?);
    active.updated_at = Set(Utc::now().fixed_offset());
    let vote = active.update(&transaction).await.map_err(internal_error)?;

    poll_option_selections::Entity::delete_many()
        .filter(poll_option_selections::Column::VoteId.eq(vote_id))
        .exec(&transaction)
        .await
        .map_err(internal_error)?;
    save_poll_option_selections(&transaction, vote_id, &poll_option_ids)
        .await?;

    let mut notifications =
        notify_proposal_vote(&transaction, &poll, &vote).await?;
    let finalization =
        synchronize_ratification_after_vote(&transaction, &poll).await?;
    forum::service::touch_forum_post_activity_for_poll(
        &transaction,
        poll.id,
        vote.updated_at,
    )
    .await?;
    transaction.commit().await.map_err(internal_error)?;

    let is_ratifying_vote = matches!(
        finalization.as_ref().map(|outcome| outcome.value),
        Some(polls_service::ProposalFinalization::Ratified)
    );
    let closed_reason = match finalization.as_ref().map(|outcome| outcome.value)
    {
        Some(polls_service::ProposalFinalization::Closed(reason)) => {
            Some(reason.to_string())
        }
        _ => None,
    };

    if let Some(outcome) = finalization {
        notifications.extend(outcome.notifications);
    }

    Ok(WithNotifications::new(
        UpdateVoteResponse {
            is_ratifying_vote,
            closed_reason,
        },
        notifications,
    ))
}

pub(super) async fn delete_vote(
    database: &DatabaseConnection,
    poll: &polls::Model,
    vote_id: Uuid,
    user_id: Uuid,
) -> AppResult<Vec<notifications::Model>> {
    let transaction = database.begin().await.map_err(internal_error)?;
    let (poll, _) = lock_poll_for_vote_mutation(&transaction, poll.id).await?;
    let vote = vote_entities::Entity::find_by_id(vote_id)
        .filter(vote_entities::Column::PollId.eq(poll.id))
        .one(&transaction)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Vote not found.")
        })?;
    if vote.user_id != user_id {
        return Err(ApiError::new(StatusCode::FORBIDDEN, "Forbidden."));
    }
    vote_entities::Entity::delete_by_id(vote_id)
        .exec(&transaction)
        .await
        .map_err(internal_error)?;
    forum::service::refresh_forum_post_activity_for_poll(&transaction, poll.id)
        .await?;
    let removed_notifications =
        notifications_service::delete_proposal_vote_notifications(
            &transaction,
            poll.id,
            vote.user_id,
        )
        .await?;
    transaction.commit().await.map_err(internal_error)?;

    Ok(removed_notifications)
}

pub(super) async fn get_voters_by_poll_option(
    database: &DatabaseConnection,
    poll_id: Uuid,
    poll_option_id: Uuid,
) -> AppResult<Vec<PollOptionVoterResponse>> {
    ensure_poll_option_exists(database, poll_id, poll_option_id).await?;

    let selections = poll_option_selections::Entity::find()
        .filter(poll_option_selections::Column::PollOptionId.eq(poll_option_id))
        .all(database)
        .await
        .map_err(internal_error)?;
    let vote_ids: Vec<Uuid> = selections
        .iter()
        .map(|selection| selection.vote_id)
        .collect();
    if vote_ids.is_empty() {
        return Ok(vec![]);
    }

    let votes = vote_entities::Entity::find()
        .filter(vote_entities::Column::Id.is_in(vote_ids))
        .all(database)
        .await
        .map_err(internal_error)?;
    let user_ids: Vec<Uuid> = votes.iter().map(|vote| vote.user_id).collect();
    let users = users::Entity::find()
        .filter(users::Column::Id.is_in(user_ids.clone()))
        .all(database)
        .await
        .map_err(internal_error)?;
    let profile_pictures =
        users_service::get_user_profile_pictures_map(database, &user_ids)
            .await?;

    Ok(users
        .into_iter()
        .map(|user| PollOptionVoterResponse {
            id: user.id.to_string(),
            name: user.name,
            display_name: user.display_name,
            profile_picture: profile_pictures.get(&user.id).cloned(),
        })
        .collect())
}

pub(super) async fn can_read_poll_option(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    poll_id: Uuid,
    current_user_id: Option<Uuid>,
    invite_token: Option<&str>,
) -> AppResult<()> {
    if let Some(user_id) = current_user_id {
        if channels::is_channel_member(database, channel_id, user_id).await? {
            return Ok(());
        }
    }

    if polls_service::is_public_channel_poll(
        database, server_id, channel_id, poll_id,
    )
    .await?
    {
        return Ok(());
    }

    if let Some(invite_token) = invite_token {
        if invites::service::is_valid_invite_for_server(
            database,
            invite_token,
            server_id,
        )
        .await?
        {
            return Ok(());
        }
    }

    Err(ApiError::new(StatusCode::FORBIDDEN, "Forbidden."))
}

pub(super) async fn ensure_poll_option_exists(
    database: &DatabaseConnection,
    poll_id: Uuid,
    poll_option_id: Uuid,
) -> AppResult<()> {
    poll_options::Entity::find_by_id(poll_option_id)
        .filter(poll_options::Column::PollId.eq(poll_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Poll option not found.")
        })?;

    Ok(())
}

pub(crate) fn shape_vote(
    vote: &vote_entities::Model,
    option_ids_by_vote: &HashMap<Uuid, Vec<Uuid>>,
    ignored_block_vote_ids: &HashSet<Uuid>,
) -> VoteResponse {
    let poll_option_ids = option_ids_by_vote
        .get(&vote.id)
        .map(|option_ids| {
            option_ids
                .iter()
                .map(ToString::to_string)
                .collect::<Vec<_>>()
        })
        .filter(|option_ids| !option_ids.is_empty());
    VoteResponse {
        id: vote.id.to_string(),
        vote_type: vote.vote_type.map(|value| value.to_string()),
        poll_option_ids,
        block_ignored: ignored_block_vote_ids.contains(&vote.id),
    }
}

async fn validate_vote_request<C>(
    database: &C,
    server_id: Uuid,
    user_id: Uuid,
    poll: &polls::Model,
    config: &poll_configs::Model,
    request: &VoteRequest,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    if poll.poll_type == "proposal" {
        validate_vote_type(request.vote_type.as_deref())?;
        if parse_vote_type_value(request.vote_type.as_deref())?
            == Some(VoteType::Block)
        {
            ensure_can_block(database, server_id, user_id, config).await?;
        }
    } else if request
        .poll_option_ids
        .as_ref()
        .map(Vec::is_empty)
        .unwrap_or(true)
    {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "At least one poll option must be selected.",
        ));
    }
    Ok(())
}

/// Blocking is unrestricted unless the proposal was opened under a server
/// that restricts it. Role membership is evaluated live, not snapshotted
async fn ensure_can_block<C>(
    database: &C,
    server_id: Uuid,
    user_id: Uuid,
    config: &poll_configs::Model,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    if config.decision_making_model
        == Some(PollDecisionMakingModel::MajorityVote)
    {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Blocking is not available for majority vote proposals.",
        ));
    }

    if config.blocks_open_to_all != Some(false) {
        return Ok(());
    }

    authz::can(
        database,
        user_id,
        "create",
        PROPOSAL_BLOCK_SUBJECT,
        PermissionScope::Server(server_id),
    )
    .await
}

pub(super) async fn can_vote_anonymously_on_poll(
    database: &DatabaseConnection,
    user_id: Uuid,
    poll: &polls::Model,
) -> AppResult<()> {
    if poll.poll_type != "proposal" {
        return Ok(());
    }

    if !users_service::is_anonymous_user(database, user_id).await? {
        return Ok(());
    }

    let action = poll_action_entities::Entity::find()
        .filter(poll_action_entities::Column::PollId.eq(poll.id))
        .one(database)
        .await
        .map_err(internal_error)?;
    if action.as_ref().map(|action| action.action_type.as_str()) == Some("test")
    {
        return Ok(());
    }

    Err(ApiError::new(
        StatusCode::FORBIDDEN,
        "Only registered users can vote on non-test proposals.",
    ))
}

async fn lock_poll_for_vote_mutation<C>(
    database: &C,
    poll_id: Uuid,
) -> AppResult<(polls::Model, poll_configs::Model)>
where
    C: ConnectionTrait,
{
    let poll = polls::Entity::find_by_id(poll_id)
        .lock(LockType::Update)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Poll not found.")
        })?;

    if poll.stage != PollStage::Voting {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Poll is no longer accepting votes.",
        ));
    }

    let config = ensure_poll_accepts_vote_mutations(database, &poll).await?;
    Ok((poll, config))
}

async fn lock_voter_membership<C>(
    database: &C,
    poll: &polls::Model,
    user_id: Uuid,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    channels::lock_channel_electorate(database, poll.channel_id).await?;
    channels::ensure_channel_member(database, poll.channel_id, user_id).await
}

async fn ensure_poll_accepts_vote_mutations<C>(
    database: &C,
    poll: &polls::Model,
) -> AppResult<poll_configs::Model>
where
    C: ConnectionTrait,
{
    if forum_posts::Entity::find()
        .filter(forum_posts::Column::PollId.eq(poll.id))
        .filter(forum_posts::Column::Status.eq(ForumPostStatus::Closed))
        .one(database)
        .await
        .map_err(internal_error)?
        .is_some()
    {
        return Err(ApiError::new(
            StatusCode::CONFLICT,
            "Votes on proposals attached to closed forum posts cannot be changed.",
        ));
    }

    let config = poll_configs::Entity::find()
        .filter(poll_configs::Column::PollId.eq(poll.id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Poll config not found.")
        })?;
    ensure_before_voting_deadline(
        config.closing_at,
        Utc::now().fixed_offset(),
    )?;

    let Some(call_id) = poll.call_id else {
        return Ok(config);
    };

    let call = calls::Entity::find_by_id(call_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Call not found.")
        })?;

    // TODO: Revisit whether a proposal created in a call should keep accepting
    // votes after that call ends, rather than staying bound to its lifetime
    if crate::calls::service::is_active_status(&call.status) {
        return Ok(config);
    }

    Err(ApiError::new(
        StatusCode::UNPROCESSABLE_ENTITY,
        "Call has ended. Votes can no longer be changed.",
    ))
}

fn ensure_before_voting_deadline(
    closing_at: Option<chrono::DateTime<chrono::FixedOffset>>,
    now: chrono::DateTime<chrono::FixedOffset>,
) -> AppResult<()> {
    // The deadline is exclusive: vote mutations are rejected when now >= closing_at
    if closing_at.is_some_and(|closing_at| now >= closing_at) {
        return Err(ApiError::new(
            StatusCode::CONFLICT,
            "Voting deadline has passed.",
        ));
    }

    Ok(())
}

async fn save_poll_option_selections<C>(
    database: &C,
    vote_id: Uuid,
    poll_option_ids: &[Uuid],
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    for poll_option_id in poll_option_ids {
        poll_option_selections::ActiveModel {
            id: Set(NativeUuid::new_v4()),
            vote_id: Set(vote_id),
            poll_option_id: Set(*poll_option_id),
            ..Default::default()
        }
        .insert(database)
        .await
        .map_err(internal_error)?;
    }
    Ok(())
}

async fn synchronize_ratification_after_vote(
    database: &DatabaseTransaction,
    poll: &polls::Model,
) -> AppResult<Option<WithNotifications<polls_service::ProposalFinalization>>> {
    let now = Utc::now().fixed_offset();
    if poll.poll_type != "proposal"
        || !polls_service::is_poll_ratifiable(database, poll.id, now).await?
    {
        return Ok(None);
    }
    polls_service::finalize_ratifiable_proposal(database, poll.id, now)
        .await
        .map(Some)
}

fn validate_vote_type(vote_type: Option<&str>) -> AppResult<()> {
    parse_vote_type_value(vote_type).and_then(|value| {
        value.map(|_| ()).ok_or_else(|| {
            ApiError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "Invalid vote type.",
            )
        })
    })
}

fn parse_vote_type_value(
    vote_type: Option<&str>,
) -> AppResult<Option<VoteType>> {
    vote_type
        .map(|value| {
            value.parse().map_err(|_| {
                ApiError::new(
                    StatusCode::UNPROCESSABLE_ENTITY,
                    "Invalid vote type.",
                )
            })
        })
        .transpose()
}

fn parse_poll_option_ids(request: &VoteRequest) -> AppResult<Vec<Uuid>> {
    request
        .poll_option_ids
        .as_deref()
        .unwrap_or(&[])
        .iter()
        .map(|id| parse_uuid(id, "pollOptionId"))
        .collect()
}

async fn validate_poll_option_ids<C>(
    database: &C,
    poll_id: Uuid,
    poll_option_ids: &[Uuid],
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    if poll_option_ids.is_empty() {
        return Ok(());
    }

    let count = poll_options::Entity::find()
        .filter(poll_options::Column::PollId.eq(poll_id))
        .filter(poll_options::Column::Id.is_in(poll_option_ids.to_vec()))
        .count(database)
        .await
        .map_err(internal_error)?;

    if count as usize == poll_option_ids.len() {
        Ok(())
    } else {
        Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Poll option is invalid.",
        ))
    }
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("vote request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
