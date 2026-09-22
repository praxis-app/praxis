//! Owns poll-action orchestration and dispatch while delegating subtype-specific
//! validation, persistence, implementation, and response shaping

use axum::http::StatusCode;
use chrono::Utc;
use entity::{
    enums::PollActionType, notifications, poll_actions, server_configs,
};
use sea_orm::{
    prelude::Uuid, sea_query::LockType, ActiveModelTrait, ColumnTrait,
    ConnectionTrait, DatabaseConnection, DatabaseTransaction, EntityTrait,
    IntoActiveModel, QueryFilter, QuerySelect, Set,
};
use std::collections::HashMap;
use uuid::Uuid as NativeUuid;

use super::{
    events, roles, settings,
    types::{CreatePollActionRequest, PollActionResponse},
};
pub(crate) use super::{
    events::{
        attach_event_cover_photo, event_cover_photo_storage_key,
        get_proposed_event_cover_photo, plan_event_closed_reason,
    },
    settings::validate_server_config_change,
};
use crate::common::{ApiError, AppResult};

pub(crate) async fn create_poll_action<C: ConnectionTrait>(
    database: &C,
    poll_id: Uuid,
    server_id: Uuid,
    request: CreatePollActionRequest,
    current_server_config: &server_configs::Model,
) -> AppResult<poll_actions::Model> {
    let action = poll_actions::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        poll_id: Set(poll_id),
        action_type: Set(request.action_type),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)?;

    match request.action_type {
        PollActionType::ChangeSettings => {
            if let Some(server_config) = request.server_config {
                settings::create_poll_action_server_config(
                    database,
                    action.id,
                    server_config,
                    current_server_config,
                )
                .await?;
            }
        }
        PollActionType::ChangeRole | PollActionType::CreateRole => {
            if let Some(server_role) = request.server_role {
                roles::create_poll_action_role(
                    database,
                    action.id,
                    server_id,
                    server_role,
                )
                .await?;
            }
        }
        PollActionType::PlanEvent => {
            if let Some(event) = request.event {
                events::create_poll_action_event(
                    database, action.id, server_id, event,
                )
                .await?;
            }
        }
        _ => {}
    }

    Ok(action)
}

pub(crate) fn validate_action(
    action: Option<&CreatePollActionRequest>,
    body: Option<&str>,
) -> AppResult<()> {
    let action = action.ok_or_else(|| {
        ApiError::new(StatusCode::UNPROCESSABLE_ENTITY, "Action is required.")
    })?;
    if matches!(
        action.action_type,
        PollActionType::General | PollActionType::Test
    ) && body.map(str::trim).map(str::is_empty).unwrap_or(true)
    {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Polls with this action must include a body.",
        ));
    }

    let payload_matches_action = match action.action_type {
        PollActionType::ChangeSettings => {
            action.server_role.is_none()
                && action.server_config.is_some()
                && action.event.is_none()
        }
        PollActionType::ChangeRole | PollActionType::CreateRole => {
            action.server_role.is_some()
                && action.server_config.is_none()
                && action.event.is_none()
        }
        PollActionType::PlanEvent => {
            action.server_role.is_none()
                && action.server_config.is_none()
                && action.event.is_some()
        }
        _ => {
            action.server_role.is_none()
                && action.server_config.is_none()
                && action.event.is_none()
        }
    };
    if !payload_matches_action {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Poll action payload does not match its action type.",
        ));
    }

    match action.action_type {
        PollActionType::ChangeSettings => settings::validate_settings_payload(
            action.server_config.as_ref().expect("checked above"),
        )?,
        PollActionType::ChangeRole => roles::validate_role_change_payload(
            action.server_role.as_ref().expect("checked above"),
        )?,
        PollActionType::PlanEvent => events::validate_plan_event_request(
            action.event.as_ref().expect("checked above"),
        )?,
        _ => {}
    }

    Ok(())
}

pub(crate) async fn implement_poll_action_in_transaction(
    transaction: &DatabaseTransaction,
    poll_id: Uuid,
) -> AppResult<Vec<notifications::Model>> {
    let action = match poll_actions::Entity::find()
        .filter(poll_actions::Column::PollId.eq(poll_id))
        .lock(LockType::Update)
        .one(transaction)
        .await
        .map_err(internal_error)?
    {
        Some(action) => action,
        None => return Ok(Vec::new()),
    };

    if action.executed_at.is_some() {
        return Ok(Vec::new());
    }

    let notifications = match action.action_type {
        PollActionType::ChangeRole => {
            roles::implement_change_server_role(transaction, poll_id, action.id)
                .await?
        }
        PollActionType::CreateRole => {
            roles::implement_create_server_role(transaction, poll_id, action.id)
                .await?
        }
        PollActionType::ChangeSettings => {
            settings::implement_change_server_config(
                transaction,
                poll_id,
                action.id,
            )
            .await?;
            Vec::new()
        }
        PollActionType::PlanEvent => {
            events::implement_plan_event(transaction, poll_id, action.id)
                .await?
        }
        _ => Vec::new(),
    };

    let mut active = action.into_active_model();
    active.executed_at = Set(Some(Utc::now().fixed_offset()));
    active.update(transaction).await.map_err(internal_error)?;
    Ok(notifications)
}

pub(crate) async fn shape_poll_actions(
    database: &DatabaseConnection,
    poll_ids: &[Uuid],
) -> AppResult<HashMap<Uuid, PollActionResponse>> {
    if poll_ids.is_empty() {
        return Ok(HashMap::new());
    }
    let actions = poll_actions::Entity::find()
        .filter(poll_actions::Column::PollId.is_in(poll_ids.iter().copied()))
        .all(database)
        .await
        .map_err(internal_error)?;
    if actions.is_empty() {
        return Ok(HashMap::new());
    }

    let action_ids: Vec<Uuid> =
        actions.iter().map(|action| action.id).collect();
    let mut server_roles =
        roles::shape_poll_action_roles(database, &action_ids).await?;
    let mut server_configs =
        settings::shape_poll_action_settings_map(database, &action_ids).await?;
    let mut proposed_events =
        events::shape_poll_action_events(database, &action_ids).await?;

    Ok(actions
        .into_iter()
        .map(|action| {
            (
                action.poll_id,
                PollActionResponse {
                    server_role: server_roles.remove(&action.id),
                    server_config: server_configs.remove(&action.id),
                    event: proposed_events.remove(&action.id),
                    id: action.id.to_string(),
                    action_type: action.action_type,
                },
            )
        })
        .collect())
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("poll action request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
