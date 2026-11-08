use axum::http::StatusCode;
use chrono::Utc;
use entity::{
    channels as channel_entities,
    enums::{
        ModerationAction, ModerationTargetKind, NotificationKind, PollType,
    },
    notifications, polls,
};
use sea_orm::{
    prelude::Uuid, ActiveModelTrait, ColumnTrait, ConnectionTrait,
    DatabaseConnection, EntityTrait, IntoActiveModel, QueryFilter, QuerySelect,
    Set, TransactionTrait,
};
use std::collections::{HashMap, HashSet};

use crate::{
    authz, channels,
    common::{ApiError, AppResult},
    moderation::{self, ModerationRecord},
};

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
    if poll.hidden_at.is_some() {
        transaction.commit().await.map_err(internal_error)?;
        return Ok((poll, vec![]));
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
    if poll.hidden_at.is_none() {
        transaction.commit().await.map_err(internal_error)?;
        return Ok(poll);
    }

    let record =
        poll_record(request, &poll, ModerationAction::RestorePoll, reason);
    let mut active = poll.into_active_model();
    active.hidden_at = Set(None);
    let poll = active.update(&transaction).await.map_err(internal_error)?;
    moderation::record_action(&transaction, record).await?;
    transaction.commit().await.map_err(internal_error)?;

    Ok(poll)
}

pub(crate) async fn get_channels_with_visible_hidden_polls<C>(
    database: &C,
    user_id: Option<Uuid>,
    channel_ids: impl IntoIterator<Item = Uuid>,
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
            moderation::can_moderate_content(database, user_id, server_id)
                .await,
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
    moderation::can_moderate_content(
        database,
        request.actor_user_id,
        request.server_id,
    )
    .await?;
    let reason = moderation::normalize_reason(
        request.reason.as_deref(),
        is_reason_required,
    )?;
    channels::get_channel(database, request.server_id, request.channel_id)
        .await?;
    Ok(reason)
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
