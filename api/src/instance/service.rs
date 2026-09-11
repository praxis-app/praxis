use axum::http::StatusCode;
use entity::instance_configs;
use sea_orm::{
    ActiveModelTrait, DatabaseConnection, EntityTrait, QueryOrder, Set,
};
use uuid::Uuid as NativeUuid;

use crate::common::{ApiError, AppResult};

pub(crate) async fn initialize(database: &DatabaseConnection) -> AppResult<()> {
    if get_config(database).await?.is_some() {
        return Ok(());
    }

    initialize_config(database).await?;
    tracing::info!("Instance initialized.");
    Ok(())
}

pub(crate) async fn get_config_safely(
    database: &DatabaseConnection,
) -> AppResult<instance_configs::Model> {
    if let Some(config) = get_config(database).await? {
        return Ok(config);
    }

    initialize_config(database).await
}

pub(crate) async fn get_config(
    database: &DatabaseConnection,
) -> AppResult<Option<instance_configs::Model>> {
    instance_configs::Entity::find()
        .order_by_asc(instance_configs::Column::CreatedAt)
        .one(database)
        .await
        .map_err(internal_error)
}

async fn initialize_config(
    database: &DatabaseConnection,
) -> AppResult<instance_configs::Model> {
    let initial_server =
        crate::servers::service::create_initial_server(database).await?;

    instance_configs::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        default_server_id: Set(initial_server.id),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("instance request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
