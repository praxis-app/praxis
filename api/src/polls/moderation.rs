use axum::http::StatusCode;
use chrono::Utc;
use entity::{
    channels as channel_entities,
    enums::{
        AuditLogOrigin, ModerationAction, ModerationTargetKind,
        NotificationKind, PollStage, PollType,
    },
    notifications, poll_configs, polls,
};
use sea_orm::{
    prelude::Uuid, sea_query::Expr, ActiveModelTrait, ColumnTrait,
    ConnectionTrait, DatabaseConnection, EntityTrait, IntoActiveModel,
    QueryFilter, QueryOrder, QuerySelect, Set, TransactionTrait,
};
use std::collections::{HashMap, HashSet};

use crate::{
    authz::{self, PermissionScope},
    channels,
    common::{ApiError, AppResult},
    moderation::{self, ModerationRecord},
    pub_sub::PubSubService,
};

const PROPOSAL_PAUSE_BUDGET_MS: i64 = 24 * 60 * 60 * 1000;

pub(super) fn pause_budget_exhausted(poll: &polls::Model) -> bool {
    poll.poll_type == PollType::Proposal
        && poll.stage == PollStage::Voting
        && poll.moderation_pause_ms >= PROPOSAL_PAUSE_BUDGET_MS
}

pub(super) struct PollModeration {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) poll_id: Uuid,
    pub(super) actor_user_id: Uuid,
    pub(super) reason: Option<String>,
}

pub(super) async fn hide_poll(
    database: &DatabaseConnection,
    request: &PollModeration,
) -> AppResult<(polls::Model, Vec<notifications::Model>)> {
    let reason = authorize(database, request, true).await?;

    let transaction = database.begin().await.map_err(internal_error)?;
    let poll = lock_poll(&transaction, request).await?;
    can_moderate_poll(
        database,
        request.actor_user_id,
        request.server_id,
        poll.poll_type,
    )
    .await?;
    if poll.hidden_at.is_some() {
        transaction.commit().await.map_err(internal_error)?;
        return Ok((poll, vec![]));
    }

    if pause_budget_exhausted(&poll) {
        return Err(ApiError::new(
            StatusCode::CONFLICT,
            "This proposal has used its moderation pause limit.",
        ));
    }

    let author_id = poll.user_id;
    let record =
        poll_record(request, &poll, ModerationAction::HidePoll, reason);
    let mut active = poll.into_active_model();
    active.hidden_at = Set(Some(Utc::now().fixed_offset()));
    let poll = active.update(&transaction).await.map_err(internal_error)?;
    let notifications = moderation::record_and_notify(
        &transaction,
        record,
        NotificationKind::PollHidden,
        author_id,
    )
    .await?;
    transaction.commit().await.map_err(internal_error)?;

    Ok((poll, notifications))
}

pub(super) async fn restore_poll(
    database: &DatabaseConnection,
    request: &PollModeration,
) -> AppResult<polls::Model> {
    let reason = authorize(database, request, false).await?;

    let transaction = database.begin().await.map_err(internal_error)?;
    let poll = lock_poll(&transaction, request).await?;
    can_moderate_poll(
        database,
        request.actor_user_id,
        request.server_id,
        poll.poll_type,
    )
    .await?;
    if poll.hidden_at.is_none() {
        transaction.commit().await.map_err(internal_error)?;
        return Ok(poll);
    }

    let pause_ms = extend_deadline_by_hidden_time(&transaction, &poll).await?;
    let record =
        poll_record(request, &poll, ModerationAction::RestorePoll, reason);
    let mut active = poll.into_active_model();
    active.hidden_at = Set(None);
    active.moderation_pause_ms = Set(pause_ms);
    let poll = active.update(&transaction).await.map_err(internal_error)?;
    moderation::record_action(&transaction, record).await?;
    transaction.commit().await.map_err(internal_error)?;

    Ok(poll)
}

pub(crate) async fn get_channels_with_visible_hidden_polls<C>(
    database: &C,
    user_id: Option<Uuid>,
    channel_ids: impl IntoIterator<Item = Uuid>,
    poll_type: PollType,
) -> AppResult<HashSet<Uuid>>
where
    C: ConnectionTrait,
{
    let Some(user_id) = user_id else {
        return Ok(HashSet::new());
    };
    let channel_ids: HashSet<Uuid> = channel_ids.into_iter().collect();
    if channel_ids.is_empty() {
        return Ok(HashSet::new());
    }

    let server_ids_by_channel: HashMap<Uuid, Uuid> =
        channel_entities::Entity::find()
            .select_only()
            .column(channel_entities::Column::Id)
            .column(channel_entities::Column::ServerId)
            .filter(channel_entities::Column::Id.is_in(channel_ids))
            .into_tuple::<(Uuid, Uuid)>()
            .all(database)
            .await
            .map_err(internal_error)?
            .into_iter()
            .collect();

    let mut moderated_server_ids = HashSet::new();
    for server_id in server_ids_by_channel
        .values()
        .copied()
        .collect::<HashSet<_>>()
    {
        if authz::is_granted(
            can_moderate_poll(database, user_id, server_id, poll_type).await,
        )? {
            moderated_server_ids.insert(server_id);
        }
    }

    Ok(server_ids_by_channel
        .into_iter()
        .filter(|(_, server_id)| moderated_server_ids.contains(server_id))
        .map(|(channel_id, _)| channel_id)
        .collect())
}

pub(crate) fn ensure_voting_not_paused(poll: &polls::Model) -> AppResult<()> {
    if poll.hidden_at.is_none() {
        Ok(())
    } else {
        Err(ApiError::new(
            StatusCode::CONFLICT,
            "Voting is paused while this poll is hidden by a moderator.",
        ))
    }
}

pub(super) async fn ensure_can_read_hidden_images(
    database: &DatabaseConnection,
    poll: &polls::Model,
    user_id: Option<Uuid>,
) -> AppResult<()> {
    if poll.hidden_at.is_none()
        || get_channels_with_visible_hidden_polls(
            database,
            user_id,
            [poll.channel_id],
            poll.poll_type,
        )
        .await?
        .contains(&poll.channel_id)
    {
        return Ok(());
    }
    Err(ApiError::new(StatusCode::NOT_FOUND, "Image not found."))
}

async fn authorize(
    database: &DatabaseConnection,
    request: &PollModeration,
    is_reason_required: bool,
) -> AppResult<Option<String>> {
    if !authz::is_granted(
        can_moderate_poll(
            database,
            request.actor_user_id,
            request.server_id,
            PollType::Proposal,
        )
        .await,
    )? {
        moderation::can_moderate_content(
            database,
            request.actor_user_id,
            request.server_id,
        )
        .await?;
    }
    let reason = moderation::normalize_reason(
        request.reason.as_deref(),
        is_reason_required,
    )?;
    channels::get_channel(database, request.server_id, request.channel_id)
        .await?;
    Ok(reason)
}

async fn can_moderate_poll<C: ConnectionTrait>(
    database: &C,
    user_id: Uuid,
    server_id: Uuid,
    poll_type: PollType,
) -> AppResult<()> {
    match poll_type {
        PollType::Proposal => {
            authz::can(
                database,
                user_id,
                "manage",
                "Proposal",
                PermissionScope::ServerOrInstance(server_id),
            )
            .await
        }
        PollType::Poll => {
            moderation::can_moderate_content(database, user_id, server_id).await
        }
    }
}

fn accounted_pause_ms(
    poll: &polls::Model,
    now: chrono::DateTime<chrono::FixedOffset>,
) -> i64 {
    let elapsed = poll
        .hidden_at
        .map(|at| (now - at).num_milliseconds().max(0))
        .unwrap_or(0);
    if poll.poll_type == PollType::Proposal && poll.stage == PollStage::Voting {
        elapsed
            .min((PROPOSAL_PAUSE_BUDGET_MS - poll.moderation_pause_ms).max(0))
    } else {
        elapsed
    }
}

async fn extend_deadline_by_hidden_time<C: ConnectionTrait>(
    database: &C,
    poll: &polls::Model,
) -> AppResult<i64> {
    if poll.hidden_at.is_none() || poll.stage != PollStage::Voting {
        return Ok(poll.moderation_pause_ms);
    }
    let now = Utc::now().fixed_offset();
    let elapsed = accounted_pause_ms(poll, now);
    let config = poll_configs::Entity::find()
        .filter(poll_configs::Column::PollId.eq(poll.id))
        .lock_exclusive()
        .one(database)
        .await
        .map_err(internal_error)?;
    if let Some(config) = config {
        if let Some(closing_at) = config.closing_at {
            let mut active = config.into_active_model();
            active.closing_at = Set(Some(
                closing_at + chrono::TimeDelta::milliseconds(elapsed),
            ));
            active.updated_at = Set(now);
            active.update(database).await.map_err(internal_error)?;
        }
    }
    Ok(if poll.poll_type == PollType::Proposal {
        poll.moderation_pause_ms + elapsed
    } else {
        poll.moderation_pause_ms
    })
}

pub(super) async fn restore_expired_proposal_pauses(
    database: &DatabaseConnection,
    pub_sub: &PubSubService,
) -> AppResult<()> {
    let mut cursor = None;
    loop {
        let mut query = polls::Entity::find()
            .filter(polls::Column::PollType.eq(PollType::Proposal))
            .filter(polls::Column::Stage.eq(PollStage::Voting))
            .filter(polls::Column::HiddenAt.is_not_null())
            .filter(Expr::cust(format!("hidden_at + (({PROPOSAL_PAUSE_BUDGET_MS} - moderation_pause_ms) * interval '1 millisecond') <= CURRENT_TIMESTAMP")));
        if let Some(id) = cursor {
            query = query.filter(polls::Column::Id.gt(id));
        }
        let batch = query
            .order_by_asc(polls::Column::Id)
            .limit(20)
            .all(database)
            .await
            .map_err(internal_error)?;
        let Some(last) = batch.last() else {
            break;
        };
        cursor = Some(last.id);
        for poll in batch {
            match restore_expired_proposal_pause(database, poll.id).await {
                Ok(Some(restored)) => {
                    if let Err(error) =
                        super::service::broadcast_stored_poll_update(
                            database, pub_sub, &restored, None,
                        )
                        .await
                    {
                        tracing::warn!("failed to broadcast automatic proposal restore: {error}");
                    }
                }
                Ok(None) => {}
                Err(error) => tracing::warn!(
                    "failed to restore expired proposal pause: {error}"
                ),
            }
        }
    }
    Ok(())
}

async fn restore_expired_proposal_pause(
    database: &DatabaseConnection,
    poll_id: Uuid,
) -> AppResult<Option<polls::Model>> {
    let transaction = database.begin().await.map_err(internal_error)?;
    let Some(poll) = polls::Entity::find_by_id(poll_id)
        .lock_exclusive()
        .one(&transaction)
        .await
        .map_err(internal_error)?
    else {
        return Ok(None);
    };
    if poll.poll_type != PollType::Proposal
        || poll.stage != PollStage::Voting
        || poll.hidden_at.is_none()
        || poll.moderation_pause_ms
            + accounted_pause_ms(&poll, Utc::now().fixed_offset())
            < PROPOSAL_PAUSE_BUDGET_MS
    {
        return Ok(None);
    }
    let channel = channel_entities::Entity::find_by_id(poll.channel_id)
        .one(&transaction)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Channel not found.")
        })?;
    let pause_ms = extend_deadline_by_hidden_time(&transaction, &poll).await?;
    let record = ModerationRecord {
        actor_user_id: None,
        origin: AuditLogOrigin::System,
        action: ModerationAction::RestorePoll,
        target_kind: ModerationTargetKind::Poll,
        target_id: poll.id,
        server_id: Some(channel.server_id),
        proposal_id: None,
        channel_id: Some(channel.id),
        target_label: Some("Proposal".to_owned()),
        server_label: None,
        before_value: None,
        after_value: None,
        reason: Some(
            "Automatically restored after the 24-hour moderation pause limit."
                .to_owned(),
        ),
    };
    let mut active = poll.into_active_model();
    active.hidden_at = Set(None);
    active.moderation_pause_ms = Set(pause_ms);
    let restored = active.update(&transaction).await.map_err(internal_error)?;
    moderation::record_action(&transaction, record).await?;
    transaction.commit().await.map_err(internal_error)?;
    Ok(Some(restored))
}

async fn lock_poll<C>(
    database: &C,
    request: &PollModeration,
) -> AppResult<polls::Model>
where
    C: ConnectionTrait,
{
    polls::Entity::find_by_id(request.poll_id)
        .filter(polls::Column::ChannelId.eq(request.channel_id))
        .lock_exclusive()
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| ApiError::new(StatusCode::NOT_FOUND, "Poll not found."))
}

fn poll_record(
    request: &PollModeration,
    poll: &polls::Model,
    action: ModerationAction,
    reason: Option<String>,
) -> ModerationRecord {
    let target_label = match poll.poll_type {
        PollType::Proposal => "Proposal",
        PollType::Poll => "Poll",
    };
    ModerationRecord::direct(
        request.actor_user_id,
        action,
        ModerationTargetKind::Poll,
        poll.id,
        Some(request.server_id),
        reason,
    )
    .with_channel(request.channel_id)
    .with_target_label(target_label)
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("poll moderation failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
