use axum::http::StatusCode;
use entity::{enums::NotificationKind, user_configs};
use sea_orm::{
    prelude::Uuid, ActiveModelTrait, ColumnTrait, ConnectionTrait,
    DatabaseConnection, EntityTrait, IntoActiveModel, QueryFilter, Set,
};
use std::collections::HashSet;
use uuid::Uuid as NativeUuid;

use crate::{
    common::{ApiError, AppResult},
    messages::types::serialize_timestamp,
    users::types::{UserConfigRequest, UserConfigResponse},
};

pub(crate) async fn get_user_config(
    database: &DatabaseConnection,
    user_id: Uuid,
) -> AppResult<UserConfigResponse> {
    let config = ensure_user_config(database, user_id).await?;
    Ok(shape_user_config(config))
}

pub(crate) async fn update_user_config(
    database: &DatabaseConnection,
    user_id: Uuid,
    request: UserConfigRequest,
) -> AppResult<UserConfigResponse> {
    let config = ensure_user_config(database, user_id).await?;
    let mut active = config.into_active_model();

    if let Some(value) = request.message_notifications_enabled {
        active.message_notifications_enabled = Set(value);
    }
    if let Some(value) = request.reply_notifications_enabled {
        active.reply_notifications_enabled = Set(value);
    }
    if let Some(value) = request.proposal_notifications_enabled {
        active.proposal_notifications_enabled = Set(value);
    }
    if let Some(value) = request.role_notifications_enabled {
        active.role_notifications_enabled = Set(value);
    }
    active.updated_at = Set(chrono::Utc::now().fixed_offset());

    let config = active.update(database).await.map_err(internal_error)?;
    Ok(shape_user_config(config))
}

/// A user without a config row has every kind enabled
pub(crate) async fn filter_notification_recipients<C>(
    database: &C,
    kind: NotificationKind,
    candidates: &[Uuid],
) -> AppResult<Vec<Uuid>>
where
    C: ConnectionTrait,
{
    if candidates.is_empty() {
        return Ok(Vec::new());
    }

    let opted_out: HashSet<Uuid> = user_configs::Entity::find()
        .filter(user_configs::Column::UserId.is_in(candidates.iter().copied()))
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .filter(|config| !allows_notification_kind(config, kind))
        .map(|config| config.user_id)
        .collect();

    Ok(candidates
        .iter()
        .copied()
        .filter(|id| !opted_out.contains(id))
        .collect())
}

fn allows_notification_kind(
    config: &user_configs::Model,
    kind: NotificationKind,
) -> bool {
    match kind {
        NotificationKind::NewMessage => config.message_notifications_enabled,
        NotificationKind::MessageReply | NotificationKind::ForumReply => {
            config.reply_notifications_enabled
        }
        // An event only exists because a proposal to hold it was ratified
        NotificationKind::NewProposal
        | NotificationKind::ProposalVote
        | NotificationKind::ProposalRatified
        | NotificationKind::ProposalClosed
        | NotificationKind::EventCreated => {
            config.proposal_notifications_enabled
        }
        NotificationKind::ServerRoleGranted => {
            config.role_notifications_enabled
        }
    }
}

async fn ensure_user_config(
    database: &DatabaseConnection,
    user_id: Uuid,
) -> AppResult<user_configs::Model> {
    if let Some(config) = user_configs::Entity::find()
        .filter(user_configs::Column::UserId.eq(user_id))
        .one(database)
        .await
        .map_err(internal_error)?
    {
        return Ok(config);
    }

    user_configs::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        user_id: Set(user_id),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)
}

fn shape_user_config(config: user_configs::Model) -> UserConfigResponse {
    UserConfigResponse {
        message_notifications_enabled: config.message_notifications_enabled,
        reply_notifications_enabled: config.reply_notifications_enabled,
        proposal_notifications_enabled: config.proposal_notifications_enabled,
        role_notifications_enabled: config.role_notifications_enabled,
        updated_at: serialize_timestamp(config.updated_at),
    }
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("user config request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
