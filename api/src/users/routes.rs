use axum::{
    routing::{get, post, put},
    Router,
};
use sea_orm::DatabaseConnection;

use super::handlers::{
    get_current_user, get_current_user_config, get_current_user_servers,
    get_user_image, get_user_profile, is_first_user,
    update_current_user_config, update_user_profile, upload_user_cover_photo,
    upload_user_profile_picture, UsersState,
};
use crate::cache::CacheService;

pub(crate) fn router(
    database: DatabaseConnection,
    jwt_secret: String,
    cache_service: CacheService,
) -> Router {
    Router::new()
        .route("/users/me", get(get_current_user))
        .route("/users/me/servers", get(get_current_user_servers))
        .route("/users/me/configs", get(get_current_user_config))
        .route("/users/me/configs", put(update_current_user_config))
        .route("/users/is-first", get(is_first_user))
        .route("/users/profile", put(update_user_profile))
        .route("/users/profile-picture", post(upload_user_profile_picture))
        .route("/users/cover-photo", post(upload_user_cover_photo))
        .route("/users/{userId}/profile", get(get_user_profile))
        .route("/users/{userId}/images/{imageId}", get(get_user_image))
        .with_state(UsersState::new(database, jwt_secret, cache_service))
}
