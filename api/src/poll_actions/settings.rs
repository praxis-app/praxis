//! Owns change-settings action validation, persistence,
//! implementation, and response shaping

use axum::http::StatusCode;
use entity::{channels, poll_action_server_configs, polls, server_configs};
use sea_orm::{
    prelude::Uuid, sea_query::LockType, ActiveModelTrait, ColumnTrait,
    ConnectionTrait, DatabaseConnection, DatabaseTransaction, EntityTrait,
    QueryFilter, QuerySelect, Set,
};
use std::collections::HashMap;
use uuid::Uuid as NativeUuid;

use super::types::PollActionServerConfigResponse;
use crate::{
    common::{ApiError, AppResult},
    servers,
};

pub(super) fn validate_settings_payload(
    request: &crate::servers::types::ServerConfigRequest,
) -> AppResult<()> {
    if request.anonymous_users_enabled.is_none()
        && request.decision_making_model.is_none()
        && request.disagreements_limit.is_none()
        && request.abstains_limit.is_none()
        && request.agreement_threshold.is_none()
        && request.quorum_enabled.is_none()
        && request.quorum_threshold.is_none()
        && request.voting_time_limit.is_none()
        && request.blocks_open_to_all.is_none()
    {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Polls to change server settings must include at least 1 change.",
        ));
    }
    Ok(())
}

pub(super) async fn create_poll_action_server_config<C: ConnectionTrait>(
    database: &C,
    poll_action_id: Uuid,
    request: crate::servers::types::ServerConfigRequest,
    current: &server_configs::Model,
) -> AppResult<()> {
    poll_action_server_configs::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        poll_action_id: Set(poll_action_id),
        anonymous_users_enabled: Set(request.anonymous_users_enabled),
        prev_anonymous_users_enabled: Set(request
            .anonymous_users_enabled
            .map(|_| current.anonymous_users_enabled)),
        decision_making_model: Set(request.decision_making_model.clone()),
        prev_decision_making_model: Set(request
            .decision_making_model
            .map(|_| current.decision_making_model.to_string())),
        disagreements_limit: Set(request.disagreements_limit),
        prev_disagreements_limit: Set(request
            .disagreements_limit
            .map(|_| current.disagreements_limit)),
        abstains_limit: Set(request.abstains_limit),
        prev_abstains_limit: Set(request
            .abstains_limit
            .map(|_| current.abstains_limit)),
        agreement_threshold: Set(request.agreement_threshold),
        prev_agreement_threshold: Set(request
            .agreement_threshold
            .map(|_| current.agreement_threshold)),
        quorum_enabled: Set(request.quorum_enabled),
        prev_quorum_enabled: Set(request
            .quorum_enabled
            .map(|_| current.quorum_enabled)),
        quorum_threshold: Set(request.quorum_threshold),
        prev_quorum_threshold: Set(request
            .quorum_threshold
            .map(|_| current.quorum_threshold)),
        voting_time_limit: Set(request.voting_time_limit),
        prev_voting_time_limit: Set(request
            .voting_time_limit
            .map(|_| current.voting_time_limit)),
        blocks_open_to_all: Set(request.blocks_open_to_all),
        prev_blocks_open_to_all: Set(request
            .blocks_open_to_all
            .map(|_| current.blocks_open_to_all)),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)?;
    Ok(())
}

pub(crate) fn validate_server_config_change(
    request: &crate::servers::types::ServerConfigRequest,
    current: &server_configs::Model,
) -> AppResult<()> {
    servers::server_configs::service::validate_server_config_request(
        request, current,
    )?;
    let has_real_change = request
        .anonymous_users_enabled
        .map(|value| value != current.anonymous_users_enabled)
        .unwrap_or(false)
        || request
            .decision_making_model
            .as_deref()
            .map(|value| value != current.decision_making_model)
            .unwrap_or(false)
        || request
            .disagreements_limit
            .map(|value| value != current.disagreements_limit)
            .unwrap_or(false)
        || request
            .abstains_limit
            .map(|value| value != current.abstains_limit)
            .unwrap_or(false)
        || request
            .agreement_threshold
            .map(|value| value != current.agreement_threshold)
            .unwrap_or(false)
        || request
            .quorum_enabled
            .map(|value| value != current.quorum_enabled)
            .unwrap_or(false)
        || request
            .quorum_threshold
            .map(|value| value != current.quorum_threshold)
            .unwrap_or(false)
        || request
            .voting_time_limit
            .map(|value| value != current.voting_time_limit)
            .unwrap_or(false)
        || request
            .blocks_open_to_all
            .map(|value| value != current.blocks_open_to_all)
            .unwrap_or(false);
    if !has_real_change {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Server settings proposals must include at least 1 real change.",
        ));
    }
    Ok(())
}

pub(super) async fn implement_change_server_config(
    database: &DatabaseTransaction,
    poll_id: Uuid,
    poll_action_id: Uuid,
) -> AppResult<()> {
    let change = poll_action_server_configs::Entity::find()
        .filter(
            poll_action_server_configs::Column::PollActionId.eq(poll_action_id),
        )
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "Server config changes are required.",
            )
        })?;
    let poll = polls::Entity::find_by_id(poll_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Poll not found.")
        })?;
    let channel = channels::Entity::find_by_id(poll.channel_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Channel not found.")
        })?;
    let config = server_configs::Entity::find()
        .filter(server_configs::Column::ServerId.eq(channel.server_id))
        .lock(LockType::Update)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Server config not found.")
        })?;
    let request = crate::servers::types::ServerConfigRequest {
        anonymous_users_enabled: change.anonymous_users_enabled,
        decision_making_model: change.decision_making_model,
        disagreements_limit: change.disagreements_limit,
        abstains_limit: change.abstains_limit,
        agreement_threshold: change.agreement_threshold,
        quorum_enabled: change.quorum_enabled,
        quorum_threshold: change.quorum_threshold,
        voting_time_limit: change.voting_time_limit,
        blocks_open_to_all: change.blocks_open_to_all,
    };
    servers::server_configs::service::apply_server_config(
        database, config, &request,
    )
    .await
}

pub(super) async fn shape_poll_action_settings_map(
    database: &DatabaseConnection,
    poll_action_ids: &[Uuid],
) -> AppResult<HashMap<Uuid, PollActionServerConfigResponse>> {
    if poll_action_ids.is_empty() {
        return Ok(HashMap::new());
    }
    Ok(poll_action_server_configs::Entity::find()
        .filter(
            poll_action_server_configs::Column::PollActionId
                .is_in(poll_action_ids.iter().copied()),
        )
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .map(|config| {
            let poll_action_id = config.poll_action_id;
            (
                poll_action_id,
                PollActionServerConfigResponse {
                    anonymous_users_enabled: config.anonymous_users_enabled,
                    prev_anonymous_users_enabled: config
                        .prev_anonymous_users_enabled,
                    decision_making_model: config.decision_making_model,
                    prev_decision_making_model: config
                        .prev_decision_making_model,
                    disagreements_limit: config.disagreements_limit,
                    prev_disagreements_limit: config.prev_disagreements_limit,
                    abstains_limit: config.abstains_limit,
                    prev_abstains_limit: config.prev_abstains_limit,
                    agreement_threshold: config.agreement_threshold,
                    prev_agreement_threshold: config.prev_agreement_threshold,
                    quorum_enabled: config.quorum_enabled,
                    prev_quorum_enabled: config.prev_quorum_enabled,
                    quorum_threshold: config.quorum_threshold,
                    prev_quorum_threshold: config.prev_quorum_threshold,
                    voting_time_limit: config.voting_time_limit,
                    prev_voting_time_limit: config.prev_voting_time_limit,
                    blocks_open_to_all: config.blocks_open_to_all,
                    prev_blocks_open_to_all: config.prev_blocks_open_to_all,
                },
            )
        })
        .collect())
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("poll action settings request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
