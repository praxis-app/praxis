use axum::{routing::get, Router};
use sea_orm::DatabaseConnection;

use super::{capabilities, instance_roles};

pub(crate) fn router(
    database: DatabaseConnection,
    jwt_secret: String,
    video_calls_enabled: bool,
) -> Router {
    Router::new()
        .route(
            "/instance/capabilities",
            get(capabilities::get_capabilities),
        )
        .with_state(capabilities::CapabilitiesState::new(
            jwt_secret.clone(),
            video_calls_enabled,
        ))
        .nest(
            "/instance/roles",
            instance_roles::router(database, jwt_secret),
        )
}
