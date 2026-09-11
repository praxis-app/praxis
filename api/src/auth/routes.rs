use axum::{routing::post, Router};
use sea_orm::DatabaseConnection;

use super::handlers::{
    create_anon_session, login, logout, signup, upgrade_anon_session, AuthState,
};

pub(crate) fn router(
    database: DatabaseConnection,
    jwt_secret: String,
) -> Router {
    Router::new()
        .route("/auth/signup", post(signup))
        .route("/auth/login", post(login))
        .route(
            "/auth/anon",
            post(create_anon_session).put(upgrade_anon_session),
        )
        .route("/auth/logout", post(logout))
        .with_state(AuthState::new(database, jwt_secret))
}
