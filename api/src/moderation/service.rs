use axum::http::StatusCode;
use entity::{
    enums::{ModerationAction, ModerationTargetKind, NotificationKind},
    moderation_actions, notifications,
};
use sea_orm::{prelude::Uuid, ActiveModelTrait, ConnectionTrait, Set};
use uuid::Uuid as NativeUuid;

use crate::{
    authz::{self, PermissionScope},
    common::{text::sanitize_text, ApiError, AppResult},
    notifications::{
        self as notifications_service, CreateNotificationsRequest,
        NotificationTarget,
    },
};

const MIN_REASON_LENGTH: usize = 4;
const MAX_REASON_LENGTH: usize = 500;

pub(crate) struct ModerationRecord {
    pub(crate) actor_user_id: Uuid,
    pub(crate) action: ModerationAction,
    pub(crate) target_kind: ModerationTargetKind,
    pub(crate) target_id: Uuid,
    pub(crate) server_id: Option<Uuid>,
    pub(crate) reason: Option<String>,
}

pub(crate) struct ModerationNotice {
    pub(crate) kind: NotificationKind,
    pub(crate) server_id: Uuid,
    pub(crate) channel_id: Option<Uuid>,
    pub(crate) moderation_action_id: Uuid,
    pub(crate) actor_user_id: Uuid,
    pub(crate) recipient_user_id: Uuid,
}

pub(crate) async fn can_moderate_content<C: ConnectionTrait>(
    database: &C,
    user_id: Uuid,
    server_id: Uuid,
) -> AppResult<()> {
    authz::can(
        database,
        user_id,
        "delete",
        "Message",
        PermissionScope::ServerOrInstance(server_id),
    )
    .await
}

pub(crate) async fn can_manage_calls<C: ConnectionTrait>(
    database: &C,
    user_id: Uuid,
    server_id: Uuid,
) -> AppResult<()> {
    authz::can(
        database,
        user_id,
        "manage",
        "Call",
        PermissionScope::ServerOrInstance(server_id),
    )
    .await
}

pub(crate) async fn record_action<C>(
    database: &C,
    record: ModerationRecord,
) -> AppResult<Uuid>
where
    C: ConnectionTrait,
{
    let action = moderation_actions::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        actor_user_id: Set(record.actor_user_id),
        action: Set(record.action),
        target_kind: Set(record.target_kind),
        target_id: Set(record.target_id),
        server_id: Set(record.server_id),
        reason: Set(record.reason),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)?;

    Ok(action.id)
}

pub(crate) async fn notify_moderated_user<C>(
    database: &C,
    notice: ModerationNotice,
) -> AppResult<Vec<notifications::Model>>
where
    C: ConnectionTrait,
{
    if notice.recipient_user_id == notice.actor_user_id {
        return Ok(Vec::new());
    }

    notifications_service::create_notifications(
        database,
        CreateNotificationsRequest {
            kind: notice.kind,
            server_id: notice.server_id,
            channel_id: notice.channel_id,
            actor_user_id: None,
            target: NotificationTarget::ModerationAction(
                notice.moderation_action_id,
            ),
            vote_type: None,
            recipient_ids: vec![notice.recipient_user_id],
        },
    )
    .await
}

pub(crate) fn normalize_reason(
    reason: Option<&str>,
    required: bool,
) -> AppResult<Option<String>> {
    let reason = reason.map(sanitize_text).filter(|value| !value.is_empty());

    match &reason {
        None if required => Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "A reason is required.",
        )),
        Some(value)
            if !(MIN_REASON_LENGTH..=MAX_REASON_LENGTH)
                .contains(&value.chars().count()) =>
        {
            Err(ApiError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                format!(
                    "Reason must be between {MIN_REASON_LENGTH} and \
                     {MAX_REASON_LENGTH} characters."
                ),
            ))
        }
        _ => Ok(reason),
    }
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("moderation request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
