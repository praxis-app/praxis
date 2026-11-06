use axum::{
    routing::{delete, get, post, put},
    Router,
};
use sea_orm::DatabaseConnection;

use super::handlers::{
    delete_user, get_current_user, get_current_user_config,
    get_current_user_servers, get_instance_users, get_user_image,
    get_user_profile, is_first_user, restore_user, suspend_user,
    update_current_user_config, update_user_profile, upload_user_cover_photo,
    upload_user_profile_picture, UsersState,
};
use crate::{
    cache::CacheService, calls::LiveKitConfig, pub_sub::PubSubService,
};

pub(crate) fn router(
    database: DatabaseConnection,
    jwt_secret: String,
    cache_service: CacheService,
    pub_sub_service: PubSubService,
    livekit: Option<LiveKitConfig>,
) -> Router {
    Router::new()
        .route("/users", get(get_instance_users))
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
        .route("/users/{userId}/suspend", post(suspend_user))
        .route("/users/{userId}/restore", post(restore_user))
        .route("/users/{userId}", delete(delete_user))
        .with_state(UsersState::new(
            database,
            jwt_secret,
            cache_service,
            pub_sub_service,
            livekit,
        ))
}
