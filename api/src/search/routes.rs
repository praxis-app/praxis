use axum::{routing::get, Router};
use sea_orm::DatabaseConnection;

use super::handlers::{search, SearchState};

pub(crate) fn router(
    database: DatabaseConnection,
    jwt_secret: String,
) -> Router {
    Router::new()
        .route("/", get(search))
        .with_state(SearchState::new(database, jwt_secret))
}
