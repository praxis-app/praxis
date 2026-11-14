use axum::http::StatusCode;
use entity::{
    calls,
    enums::{ModerationAction, ModerationTargetKind, NotificationKind},
    notifications, users,
};
use sea_orm::{
    prelude::Uuid, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter,
    QuerySelect, TransactionTrait,
};

use super::{
    livekit::{
        delete_livekit_room, livekit_room_participant_ids,
        remove_livekit_participant, LiveKitConfig,
    },
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

pub(super) struct ModeratedCall {
    pub(super) call: CallArtifactResponse,
    pub(super) reason: Option<String>,
    pub(super) disconnected_user_ids: Vec<Uuid>,
    pub(super) notifications: Vec<notifications::Model>,
}

pub(super) async fn end_call_as_moderator(
    database: &DatabaseConnection,
    livekit: Option<&LiveKitConfig>,
    request: &CallModeration,
) -> AppResult<ModeratedCall> {
    let reason = authorize(database, request).await?;
    let call = get_call(
        database,
        request.server_id,
        request.channel_id,
        request.call_id,
    )
    .await?;

    // TODO: Deleting the room before the call is marked ended lets the
    // room_finished webhook win the race, which skips the end_call audit entry
    // or overwrites the moderator ended reason. End the call and record the
    // action first, then delete the room, and make the webhook update a no-op
    // for calls that are no longer active
    let mut disconnected_user_ids = Vec::new();
    if is_active_status(&call.status) {
        if let Some(livekit) = livekit {
            disconnected_user_ids =
                list_other_participants(livekit, &call.livekit_room, request)
                    .await;
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
            ModerationRecord::direct(
                request.actor_user_id,
                ModerationAction::EndCall,
                ModerationTargetKind::Call,
                call.id,
                Some(request.server_id),
                reason.clone(),
            )
            .with_channel(request.channel_id)
            .with_target_label("Call"),
        )
        .await?;
        call
    } else {
        call
    };
    transaction.commit().await.map_err(internal_error)?;

    Ok(ModeratedCall {
        call: super::service::shape_call_artifact(database, call).await?,
        reason,
        disconnected_user_ids,
        notifications: Vec::new(),
    })
}

pub(super) async fn remove_call_participant(
    database: &DatabaseConnection,
    livekit: Option<&LiveKitConfig>,
    request: &CallModeration,
    participant_id: Uuid,
) -> AppResult<ModeratedCall> {
    // TODO: Only Call:manage is checked here, so a call moderator can remove
    // themselves or a server or instance admin. Apply the same self-target and
    // hierarchy guards as member moderation
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
    let notifications = if removed {
        let transaction = database.begin().await.map_err(internal_error)?;
        let notifications = moderation::record_and_notify(
            &transaction,
            ModerationRecord::direct(
                request.actor_user_id,
                ModerationAction::RemoveCallParticipant,
                ModerationTargetKind::User,
                participant_id,
                Some(request.server_id),
                reason.clone(),
            )
            .with_channel(request.channel_id),
            NotificationKind::CallParticipantRemoved,
            participant_id,
        )
        .await?;
        transaction.commit().await.map_err(internal_error)?;
        notifications
    } else {
        vec![]
    };

    Ok(ModeratedCall {
        call: super::service::shape_call_artifact(database, call).await?,
        reason,
        disconnected_user_ids: if removed {
            vec![participant_id]
        } else {
            Vec::new()
        },
        notifications,
    })
}

async fn list_other_participants(
    livekit: &LiveKitConfig,
    room_name: &str,
    request: &CallModeration,
) -> Vec<Uuid> {
    match livekit_room_participant_ids(livekit, room_name).await {
        Ok(user_ids) => user_ids
            .into_iter()
            .filter(|user_id| *user_id != request.actor_user_id)
            .collect(),
        Err(error) => {
            tracing::warn!("failed to list call participants: {error}");
            Vec::new()
        }
    }
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
