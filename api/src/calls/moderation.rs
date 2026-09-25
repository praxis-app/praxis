use axum::http::StatusCode;
use entity::{
    calls,
    enums::{ModerationAction, ModerationTargetKind},
    users,
};
use sea_orm::{
    prelude::Uuid, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter,
    QuerySelect, TransactionTrait,
};

use super::{
    livekit::{delete_livekit_room, remove_livekit_participant, LiveKitConfig},
    service::{
        end_call, get_call, internal_error, is_active_status,
        MODERATOR_ENDED_REASON,
    },
    types::CallArtifactResponse,
};
use crate::{
    common::{ApiError, AppResult},
    moderation::{self, ModerationRecord},
};

pub(super) struct CallModeration {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) call_id: Uuid,
    pub(super) actor_user_id: Uuid,
    pub(super) reason: Option<String>,
}

pub(super) async fn end_call_as_moderator(
    database: &DatabaseConnection,
    livekit: Option<&LiveKitConfig>,
    request: &CallModeration,
) -> AppResult<CallArtifactResponse> {
    let reason = authorize(database, request).await?;
    let call = get_call(
        database,
        request.server_id,
        request.channel_id,
        request.call_id,
    )
    .await?;

    if is_active_status(&call.status) {
        if let Some(livekit) = livekit {
            delete_livekit_room(livekit, &call.livekit_room).await?;
        }
    }

    let transaction = database.begin().await.map_err(internal_error)?;
    let call = calls::Entity::find_by_id(request.call_id)
        .filter(calls::Column::ServerId.eq(request.server_id))
        .filter(calls::Column::ChannelId.eq(request.channel_id))
        .lock_exclusive()
        .one(&transaction)
        .await
        .map_err(internal_error)?
        .ok_or_else(call_not_found)?;
    let call = if is_active_status(&call.status) {
        let call = end_call(
            &transaction,
            call,
            Some(request.actor_user_id),
            MODERATOR_ENDED_REASON,
        )
        .await?;
        moderation::record_action(
            &transaction,
            ModerationRecord {
                actor_user_id: request.actor_user_id,
                action: ModerationAction::EndCall,
                target_kind: ModerationTargetKind::Call,
                target_id: call.id,
                server_id: Some(request.server_id),
                reason,
            },
        )
        .await?;
        call
    } else {
        call
    };
    transaction.commit().await.map_err(internal_error)?;

    super::service::shape_call_artifact(database, call).await
}

pub(super) async fn remove_call_participant(
    database: &DatabaseConnection,
    livekit: Option<&LiveKitConfig>,
    request: &CallModeration,
    participant_id: Uuid,
) -> AppResult<CallArtifactResponse> {
    let reason = authorize(database, request).await?;
    let livekit = livekit.ok_or_else(|| {
        ApiError::new(
            StatusCode::SERVICE_UNAVAILABLE,
            "LiveKit is not configured.",
        )
    })?;
    let call = get_call(
        database,
        request.server_id,
        request.channel_id,
        request.call_id,
    )
    .await?;
    users::Entity::find_by_id(participant_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Participant not found.")
        })?;

    let removed = is_active_status(&call.status)
        && remove_livekit_participant(
            livekit,
            &call.livekit_room,
            &participant_id.to_string(),
        )
        .await?;
    if removed {
        moderation::record_action(
            database,
            ModerationRecord {
                actor_user_id: request.actor_user_id,
                action: ModerationAction::RemoveCallParticipant,
                target_kind: ModerationTargetKind::User,
                target_id: participant_id,
                server_id: Some(request.server_id),
                reason,
            },
        )
        .await?;
    }

    super::service::shape_call_artifact(database, call).await
}

async fn authorize(
    database: &DatabaseConnection,
    request: &CallModeration,
) -> AppResult<Option<String>> {
    moderation::can_manage_calls(
        database,
        request.actor_user_id,
        request.server_id,
    )
    .await?;
    moderation::normalize_reason(request.reason.as_deref(), false)
}

fn call_not_found() -> ApiError {
    ApiError::new(StatusCode::NOT_FOUND, "Call not found.")
}
