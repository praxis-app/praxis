use axum::http::StatusCode;
use entity::{enums::ServerDecisionMakingModel, server_configs};
use sea_orm::{
    prelude::Uuid, ActiveModelTrait, ColumnTrait, ConnectionTrait,
    DatabaseConnection, EntityTrait, IntoActiveModel, QueryFilter, Set,
};
use uuid::Uuid as NativeUuid;

use crate::{
    common::{ApiError, AppResult},
    servers::types::{
        serialize_timestamp, ServerConfigRequest, ServerConfigResponse,
    },
};

pub(crate) async fn get_server_config(
    database: &DatabaseConnection,
    server_id: Uuid,
) -> AppResult<ServerConfigResponse> {
    let config = ensure_server_config(database, server_id).await?;
    Ok(shape_server_config(config))
}

pub(crate) async fn is_anonymous_users_enabled(
    database: &DatabaseConnection,
    server_id: Uuid,
) -> AppResult<bool> {
    let config = ensure_server_config(database, server_id).await?;
    Ok(config.anonymous_users_enabled)
}

pub(crate) async fn update_server_config(
    database: &DatabaseConnection,
    server_id: Uuid,
    request: ServerConfigRequest,
) -> AppResult<()> {
    let config = ensure_server_config(database, server_id).await?;
    validate_server_config_request(&request, &config)?;
    let mut active = config.into_active_model();

    if let Some(value) = request.anonymous_users_enabled {
        active.anonymous_users_enabled = Set(value);
    }
    if let Some(value) = request.decision_making_model {
        active.decision_making_model =
            Set(parse_decision_making_model(&value)?);
    }
    if let Some(value) = request.disagreements_limit {
        active.disagreements_limit = Set(value);
    }
    if let Some(value) = request.abstains_limit {
        active.abstains_limit = Set(value);
    }
    if let Some(value) = request.agreement_threshold {
        active.agreement_threshold = Set(value);
    }
    if let Some(value) = request.quorum_enabled {
        active.quorum_enabled = Set(value);
    }
    if let Some(value) = request.quorum_threshold {
        active.quorum_threshold = Set(value);
    }
    if let Some(value) = request.voting_time_limit {
        active.voting_time_limit = Set(value);
    }
    if let Some(value) = request.blocks_open_to_all {
        active.blocks_open_to_all = Set(value);
    }

    active.update(database).await.map_err(internal_error)?;
    Ok(())
}

pub(crate) async fn apply_server_config<C: ConnectionTrait>(
    database: &C,
    config: server_configs::Model,
    request: &ServerConfigRequest,
) -> AppResult<()> {
    validate_server_config_request(request, &config)?;
    let mut active = config.into_active_model();
    if let Some(value) = request.anonymous_users_enabled {
        active.anonymous_users_enabled = Set(value);
    }
    if let Some(value) = request.decision_making_model.as_deref() {
        active.decision_making_model = Set(parse_decision_making_model(value)?);
    }
    if let Some(value) = request.disagreements_limit {
        active.disagreements_limit = Set(value);
    }
    if let Some(value) = request.abstains_limit {
        active.abstains_limit = Set(value);
    }
    if let Some(value) = request.agreement_threshold {
        active.agreement_threshold = Set(value);
    }
    if let Some(value) = request.quorum_enabled {
        active.quorum_enabled = Set(value);
    }
    if let Some(value) = request.quorum_threshold {
        active.quorum_threshold = Set(value);
    }
    if let Some(value) = request.voting_time_limit {
        active.voting_time_limit = Set(value);
    }
    if let Some(value) = request.blocks_open_to_all {
        active.blocks_open_to_all = Set(value);
    }
    active.update(database).await.map_err(internal_error)?;
    Ok(())
}

pub(crate) async fn ensure_server_config(
    database: &DatabaseConnection,
    server_id: Uuid,
) -> AppResult<server_configs::Model> {
    crate::servers::get_server(database, server_id).await?;

    if let Some(config) = server_configs::Entity::find()
        .filter(server_configs::Column::ServerId.eq(server_id))
        .one(database)
        .await
        .map_err(internal_error)?
    {
        return Ok(config);
    }

    server_configs::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        server_id: Set(server_id),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)
}

fn shape_server_config(config: server_configs::Model) -> ServerConfigResponse {
    ServerConfigResponse {
        anonymous_users_enabled: config.anonymous_users_enabled,
        decision_making_model: config.decision_making_model.to_string(),
        disagreements_limit: config.disagreements_limit,
        abstains_limit: config.abstains_limit,
        agreement_threshold: config.agreement_threshold,
        quorum_enabled: config.quorum_enabled,
        quorum_threshold: config.quorum_threshold,
        voting_time_limit: config.voting_time_limit,
        blocks_open_to_all: config.blocks_open_to_all,
        updated_at: serialize_timestamp(config.updated_at),
    }
}

fn parse_decision_making_model(
    value: &str,
) -> AppResult<ServerDecisionMakingModel> {
    value.parse().map_err(|_| {
        ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Decision making model is invalid.",
        )
    })
}

/// Validates the config the server would end up with, not just the fields the
/// request happens to carry, so a partial update cannot leave an invalid pair
/// of stored settings behind
pub(crate) fn validate_server_config_request(
    request: &ServerConfigRequest,
    current: &server_configs::Model,
) -> AppResult<()> {
    let decision_making_model = match request.decision_making_model.as_deref() {
        Some(model) => parse_decision_making_model(model)?,
        None => current.decision_making_model,
    };

    validate_range(request.disagreements_limit, 0, 10, "disagreementsLimit")?;
    validate_range(request.abstains_limit, 0, 10, "abstainsLimit")?;
    validate_range(request.agreement_threshold, 1, 100, "agreementThreshold")?;
    validate_range(request.quorum_threshold, 1, 100, "quorumThreshold")?;

    let agreement_threshold = request
        .agreement_threshold
        .unwrap_or(current.agreement_threshold);
    let voting_time_limit = request
        .voting_time_limit
        .unwrap_or(current.voting_time_limit);

    if decision_making_model == ServerDecisionMakingModel::MajorityVote
        && agreement_threshold <= 50
    {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Majority vote agreement threshold must be greater than 50.",
        ));
    }

    if decision_making_model == ServerDecisionMakingModel::Consent
        && voting_time_limit <= 0
    {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Consent requires a voting time limit.",
        ));
    }

    Ok(())
}

fn validate_range(
    value: Option<i32>,
    min: i32,
    max: i32,
    field: &str,
) -> AppResult<()> {
    if value
        .map(|value| value < min || value > max)
        .unwrap_or(false)
    {
        Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            format!("{field} must be between {min} and {max}."),
        ))
    } else {
        Ok(())
    }
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("server config request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
