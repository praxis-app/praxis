use axum::{routing::get, Router};
use sea_orm::DatabaseConnection;

use super::handlers::{get_call_feed, get_channel_feed, FeedsState};

pub(crate) fn channel_feed_router(
    database: DatabaseConnection,
    jwt_secret: String,
) -> Router {
    Router::new()
        .route("/", get(get_channel_feed))
        .with_state(FeedsState::new(database, jwt_secret))
}

pub(crate) fn call_feed_router(
    database: DatabaseConnection,
    jwt_secret: String,
) -> Router {
    Router::new()
        .route("/", get(get_call_feed))
        .with_state(FeedsState::new(database, jwt_secret))
}
