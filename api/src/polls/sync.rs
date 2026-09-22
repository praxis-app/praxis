//! Owns periodic discovery and processing of polls that need deadline or event
//! lifecycle updates. Outcome evaluation and final state transitions remain in outcome

use axum::http::StatusCode;
use chrono::Utc;
use entity::{
    channels,
    enums::{NotificationKind, PollActionType, PollStage, PollType},
    notifications, poll_action_event_hosts, poll_action_events,
    poll_actions as poll_action_entities, poll_configs, polls, server_members,
};
use sea_orm::{
    prelude::Uuid,
    sea_query::{Condition, Expr, JoinType, LockType, Query},
    ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, QueryOrder,
    QuerySelect, RelationTrait, TransactionTrait,
};
use tokio::time::{self, MissedTickBehavior};

use super::{
    outcome::{
        close_poll, close_poll_with_reason, finalize_ratifiable_proposal,
        is_poll_ratifiable_with_context, notify_proposal_outcome,
        ProposalFinalization,
    },
    service::broadcast_stored_poll_update,
};
use crate::{
    channels as channels_service,
    common::{ApiError, AppResult},
    notifications as notifications_service, poll_actions,
    pub_sub::PubSubService,
};

const PROPOSAL_SYNC_BATCH_SIZE: usize = 20;
const PROPOSAL_SYNC_INTERVAL_SECONDS: u64 = 60 * 5;
const POLL_CLOSURE_BATCH_SIZE: usize = 20;
const POLL_CLOSURE_INTERVAL_SECONDS: u64 = 60 * 5;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
struct ProposalSyncSummary {
    processed: usize,
    ratified: usize,
    closed: usize,
    failed: usize,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum ProposalSyncAction {
    None,
    Ratify,
    Close,
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
struct ExpiredPollClosureSummary {
    processed: usize,
    closed: usize,
    failed: usize,
}

pub(crate) fn spawn_proposal_synchronizer(
    database: DatabaseConnection,
    pub_sub_service: PubSubService,
) {
    tokio::spawn(async move {
        let mut interval = time::interval(std::time::Duration::from_secs(
            configured_interval_seconds(
                "PROPOSAL_SYNC_INTERVAL_SECONDS",
                PROPOSAL_SYNC_INTERVAL_SECONDS,
            ),
        ));
        interval.set_missed_tick_behavior(MissedTickBehavior::Skip);

        loop {
            interval.tick().await;

            match synchronize_proposals(&database, &pub_sub_service).await {
                Ok(summary) if summary.ratified > 0 || summary.closed > 0 => {
                    tracing::info!(
                        checked = summary.processed,
                        ratified = summary.ratified,
                        closed = summary.closed,
                        failed = summary.failed,
                        "Synchronized proposals"
                    );
                }
                Ok(_) => {}
                Err(error) => {
                    tracing::warn!("Failed to synchronize proposals: {error}");
                }
            }
        }
    });
}

pub(crate) fn spawn_expired_poll_closer(
    database: DatabaseConnection,
    pub_sub_service: PubSubService,
) {
    tokio::spawn(async move {
        let mut interval = time::interval(std::time::Duration::from_secs(
            configured_interval_seconds(
                "POLL_CLOSURE_INTERVAL_SECONDS",
                POLL_CLOSURE_INTERVAL_SECONDS,
            ),
        ));
        interval.set_missed_tick_behavior(MissedTickBehavior::Skip);

        loop {
            interval.tick().await;

            match close_expired_polls(&database, &pub_sub_service).await {
                Ok(summary) if summary.processed > 0 => {
                    tracing::info!(
                        processed = summary.processed,
                        closed = summary.closed,
                        failed = summary.failed,
                        "Closed expired polls."
                    );
                }
                Ok(_) => {}
                Err(error) => {
                    tracing::warn!("Failed to close expired polls: {error}");
                }
            }
        }
    });
}

async fn synchronize_proposals(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
) -> AppResult<ProposalSyncSummary> {
    let mut summary = ProposalSyncSummary::default();
    expire_stale_event_proposals(database, pub_sub_service, &mut summary)
        .await?;
    let now = Utc::now().fixed_offset();
    let mut cursor = None;

    loop {
        let mut query = polls::Entity::find()
            .filter(polls::Column::PollType.eq(PollType::Proposal))
            .filter(polls::Column::Stage.eq(PollStage::Voting))
            .find_also_related(poll_configs::Entity)
            .filter(poll_configs::Column::ClosingAt.lte(now));
        if let Some(cursor) = cursor {
            query = query.filter(polls::Column::Id.gt(cursor));
        }
        let proposals = query
            .order_by_asc(polls::Column::Id)
            .limit(PROPOSAL_SYNC_BATCH_SIZE as u64)
            .all(database)
            .await
            .map_err(internal_error)?;
        let Some((last_poll, _)) = proposals.last() else {
            break;
        };
        cursor = Some(last_poll.id);

        for (poll, config) in proposals {
            summary.processed += 1;

            let Some(config) = config else {
                summary.failed += 1;
                tracing::warn!(poll_id = %poll.id, "Poll config missing.");
                continue;
            };

            match synchronize_proposal(
                database,
                pub_sub_service,
                &poll,
                &config,
            )
            .await
            {
                Ok(ProposalSyncAction::Ratify) => {
                    broadcast_stored_poll_update(
                        database,
                        pub_sub_service,
                        &poll,
                        None,
                    )
                    .await?;
                    summary.ratified += 1;
                }
                Ok(ProposalSyncAction::Close) => {
                    broadcast_stored_poll_update(
                        database,
                        pub_sub_service,
                        &poll,
                        None,
                    )
                    .await?;
                    summary.closed += 1;
                }
                Ok(ProposalSyncAction::None) => {}
                Err(error) => {
                    summary.failed += 1;
                    tracing::warn!(
                        poll_id = %poll.id,
                        "Failed to synchronize proposal: {error}"
                    );
                }
            }
        }
    }

    Ok(summary)
}

async fn expire_stale_event_proposals(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    summary: &mut ProposalSyncSummary,
) -> AppResult<()> {
    let now = Utc::now().fixed_offset();
    let eligible_host = Query::select()
        .column(server_members::Column::Id)
        .from(server_members::Entity)
        .and_where(
            Expr::col((
                server_members::Entity,
                server_members::Column::ServerId,
            ))
            .equals((channels::Entity, channels::Column::ServerId)),
        )
        .and_where(
            Expr::col((server_members::Entity, server_members::Column::UserId))
                .equals((
                    poll_action_event_hosts::Entity,
                    poll_action_event_hosts::Column::UserId,
                )),
        )
        .to_owned();
    let ineligible_host = Query::select()
        .column(poll_action_event_hosts::Column::Id)
        .from(poll_action_event_hosts::Entity)
        .and_where(
            Expr::col((
                poll_action_event_hosts::Entity,
                poll_action_event_hosts::Column::PollActionEventId,
            ))
            .equals((
                poll_action_events::Entity,
                poll_action_events::Column::Id,
            )),
        )
        .cond_where(Condition::all().not().add(Expr::exists(eligible_host)))
        .to_owned();
    let mut cursor = None;

    loop {
        let mut query = polls::Entity::find()
            .join(JoinType::InnerJoin, polls::Relation::Action.def())
            .join(
                JoinType::InnerJoin,
                poll_action_entities::Relation::ProposedEvent.def(),
            )
            .join(JoinType::InnerJoin, polls::Relation::Channel.def())
            .filter(polls::Column::PollType.eq(PollType::Proposal))
            .filter(polls::Column::Stage.eq(PollStage::Voting))
            .filter(
                poll_action_entities::Column::ActionType
                    .eq(PollActionType::PlanEvent),
            )
            .filter(
                Condition::any()
                    .add(poll_action_events::Column::StartsAt.lte(now))
                    .add(Expr::exists(ineligible_host.clone())),
            );
        if let Some(cursor) = cursor {
            query = query.filter(polls::Column::Id.gt(cursor));
        }
        let proposals = query
            .order_by_asc(polls::Column::Id)
            .limit(PROPOSAL_SYNC_BATCH_SIZE as u64)
            .all(database)
            .await
            .map_err(internal_error)?;
        let Some(last_poll) = proposals.last() else {
            break;
        };
        cursor = Some(last_poll.id);

        for poll in proposals {
            summary.processed += 1;
            match expire_stale_event_proposal(database, poll.id, now).await {
                Ok(Some(created)) => {
                    broadcast_stored_poll_update(
                        database,
                        pub_sub_service,
                        &poll,
                        None,
                    )
                    .await?;
                    notifications_service::publish_notifications(
                        database,
                        pub_sub_service,
                        &created,
                    )
                    .await;
                    summary.closed += 1;
                }
                Ok(None) => {}
                Err(error) => {
                    summary.failed += 1;
                    tracing::warn!(
                        poll_id = %poll.id,
                        "Failed to expire stale event proposal: {error}"
                    );
                }
            }
        }
    }

    Ok(())
}

async fn expire_stale_event_proposal(
    database: &DatabaseConnection,
    poll_id: Uuid,
    now: chrono::DateTime<chrono::FixedOffset>,
) -> AppResult<Option<Vec<notifications::Model>>> {
    let transaction = database.begin().await.map_err(internal_error)?;
    let poll = polls::Entity::find_by_id(poll_id)
        .lock(LockType::Update)
        .one(&transaction)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Poll not found.")
        })?;

    let reason = poll_actions::service::plan_event_closed_reason(
        &transaction,
        poll_id,
        now,
    )
    .await?;
    if poll.stage != PollStage::Voting || reason.is_none() {
        transaction.commit().await.map_err(internal_error)?;
        return Ok(None);
    }

    close_poll_with_reason(&transaction, poll_id, reason).await?;
    let created = notify_proposal_outcome(
        &transaction,
        poll_id,
        NotificationKind::ProposalClosed,
    )
    .await?;
    transaction.commit().await.map_err(internal_error)?;
    Ok(Some(created))
}

async fn close_expired_polls(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
) -> AppResult<ExpiredPollClosureSummary> {
    let now = Utc::now().fixed_offset();
    let mut summary = ExpiredPollClosureSummary::default();
    let mut cursor = None;

    loop {
        let mut query = polls::Entity::find()
            .join(JoinType::InnerJoin, polls::Relation::Config.def())
            .filter(polls::Column::PollType.eq(PollType::Poll))
            .filter(polls::Column::Stage.eq(PollStage::Voting))
            .filter(poll_configs::Column::ClosingAt.lte(now));
        if let Some(cursor) = cursor {
            query = query.filter(polls::Column::Id.gt(cursor));
        }
        let expired_polls = query
            .order_by_asc(polls::Column::Id)
            .limit(POLL_CLOSURE_BATCH_SIZE as u64)
            .all(database)
            .await
            .map_err(internal_error)?;
        let Some(last_poll) = expired_polls.last() else {
            break;
        };
        cursor = Some(last_poll.id);

        for poll in expired_polls {
            summary.processed += 1;

            match close_poll(database, poll.id).await {
                Ok(()) => {
                    broadcast_stored_poll_update(
                        database,
                        pub_sub_service,
                        &poll,
                        None,
                    )
                    .await?;
                    summary.closed += 1;
                }
                Err(error) => {
                    summary.failed += 1;
                    tracing::warn!(
                        poll_id = %poll.id,
                        "Failed to close expired poll: {error}"
                    );
                }
            }
        }
    }

    Ok(summary)
}

async fn synchronize_proposal(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    poll: &polls::Model,
    config: &poll_configs::Model,
) -> AppResult<ProposalSyncAction> {
    let transaction = database.begin().await.map_err(internal_error)?;
    let locked_poll = polls::Entity::find_by_id(poll.id)
        .lock(LockType::Update)
        .one(&transaction)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Poll not found.")
        })?;

    if locked_poll.stage != PollStage::Voting {
        transaction.commit().await.map_err(internal_error)?;
        return Ok(ProposalSyncAction::None);
    }
    channels_service::lock_channel_electorate(
        &transaction,
        locked_poll.channel_id,
    )
    .await?;

    let now = Utc::now().fixed_offset();
    let action = proposal_sync_action(
        config.closing_at,
        is_poll_ratifiable_with_context(
            &transaction,
            &locked_poll,
            config,
            now,
        )
        .await?,
        now,
    );

    match action {
        ProposalSyncAction::None => {
            transaction.commit().await.map_err(internal_error)?;
        }
        ProposalSyncAction::Ratify => {
            let outcome =
                finalize_ratifiable_proposal(&transaction, poll.id, now)
                    .await?;
            transaction.commit().await.map_err(internal_error)?;
            notifications_service::publish_notifications(
                database,
                pub_sub_service,
                &outcome.notifications,
            )
            .await;
            return Ok(match outcome.value {
                ProposalFinalization::Ratified => ProposalSyncAction::Ratify,
                ProposalFinalization::Closed(_) => ProposalSyncAction::Close,
            });
        }
        ProposalSyncAction::Close => {
            close_poll(&transaction, poll.id).await?;
            let created = notify_proposal_outcome(
                &transaction,
                poll.id,
                NotificationKind::ProposalClosed,
            )
            .await?;
            transaction.commit().await.map_err(internal_error)?;
            notifications_service::publish_notifications(
                database,
                pub_sub_service,
                &created,
            )
            .await;
        }
    }

    Ok(action)
}

fn proposal_sync_action(
    closing_at: Option<chrono::DateTime<chrono::FixedOffset>>,
    is_ratifiable: bool,
    now: chrono::DateTime<chrono::FixedOffset>,
) -> ProposalSyncAction {
    let Some(closing_at) = closing_at else {
        return ProposalSyncAction::None;
    };

    if now < closing_at {
        return ProposalSyncAction::None;
    }

    if is_ratifiable {
        ProposalSyncAction::Ratify
    } else {
        ProposalSyncAction::Close
    }
}

fn configured_interval_seconds(env_key: &str, default: u64) -> u64 {
    std::env::var(env_key)
        .ok()
        .and_then(|value| value.parse::<u64>().ok())
        .filter(|value| *value > 0)
        .unwrap_or(default)
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("poll synchronization failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
