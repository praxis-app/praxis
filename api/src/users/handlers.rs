use axum::{
    extract::{Path, State},
    http::{Response, StatusCode},
    response::Json,
};
use sea_orm::DatabaseConnection;
use std::{path::PathBuf, sync::Arc};

use super::{
    service,
    types::{
        CurrentUserPayload, FirstUserResponse, UpdateUserProfileRequest,
        UserConfigPayload, UserConfigRequest, UserImagePath, UserImagePayload,
        UserProfilePayload,
    },
    user_configs,
};
use crate::{
    auth::{AuthenticatedUser, AuthenticatedUserOptional, HasJwtSecret},
    cache::CacheService,
    common::{
        request::{parse_uuid, MultipartFile},
        storage::upload_root,
        AppResult,
    },
    invites::InviteAccessToken,
    servers::{self, types::ServersPayload},
};

#[derive(Clone, Debug)]
pub(super) struct UsersState {
    database: DatabaseConnection,
    jwt_secret: Arc<str>,
    upload_root: Arc<PathBuf>,
    cache_service: CacheService,
}

impl UsersState {
    pub(super) fn new(
        database: DatabaseConnection,
        jwt_secret: String,
        cache_service: CacheService,
    ) -> Self {
        Self {
            database,
            jwt_secret: Arc::<str>::from(jwt_secret),
            upload_root: Arc::new(upload_root()),
            cache_service,
        }
    }
}

impl HasJwtSecret for UsersState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

pub(super) async fn get_current_user(
    State(state): State<UsersState>,
    AuthenticatedUser(user_id): AuthenticatedUser,
) -> AppResult<Json<CurrentUserPayload>> {
    let user = service::get_current_user(
        &state.database,
        &state.cache_service,
        user_id,
    )
    .await?;

    Ok(Json(CurrentUserPayload { user }))
}

pub(super) async fn get_current_user_servers(
    State(state): State<UsersState>,
    AuthenticatedUser(user_id): AuthenticatedUser,
) -> AppResult<Json<ServersPayload>> {
    let servers =
        servers::service::get_servers_for_user(&state.database, user_id)
            .await?;
    Ok(Json(ServersPayload { servers }))
}

pub(super) async fn get_current_user_config(
    State(state): State<UsersState>,
    AuthenticatedUser(user_id): AuthenticatedUser,
) -> AppResult<Json<UserConfigPayload>> {
    let user_config =
        user_configs::get_user_config(&state.database, user_id).await?;
    Ok(Json(UserConfigPayload { user_config }))
}

pub(super) async fn update_current_user_config(
    State(state): State<UsersState>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    Json(payload): Json<UserConfigRequest>,
) -> AppResult<Json<UserConfigPayload>> {
    let user_config =
        user_configs::update_user_config(&state.database, user_id, payload)
            .await?;
    Ok(Json(UserConfigPayload { user_config }))
}

pub(super) async fn is_first_user(
    State(state): State<UsersState>,
) -> AppResult<Json<FirstUserResponse>> {
    let is_first_user = service::is_first_user(&state.database).await?;
    Ok(Json(FirstUserResponse { is_first_user }))
}

pub(super) async fn get_user_profile(
    State(state): State<UsersState>,
    Path(user_id): Path<String>,
    AuthenticatedUserOptional(current_user_id): AuthenticatedUserOptional,
    InviteAccessToken(invite_token): InviteAccessToken,
) -> AppResult<Json<UserProfilePayload>> {
    let user_id = parse_uuid(&user_id, "userId")?;
    let user = service::get_user_profile(
        &state.database,
        current_user_id,
        user_id,
        invite_token.as_deref(),
    )
    .await?;

    Ok(Json(UserProfilePayload { user }))
}

pub(super) async fn update_user_profile(
    State(state): State<UsersState>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    Json(payload): Json<UpdateUserProfileRequest>,
) -> AppResult<StatusCode> {
    service::update_user_profile(&state.database, user_id, payload).await?;
    Ok(StatusCode::OK)
}

pub(super) async fn upload_user_profile_picture(
    State(state): State<UsersState>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    MultipartFile { bytes }: MultipartFile,
) -> AppResult<(StatusCode, Json<UserImagePayload>)> {
    let image = service::upload_user_profile_picture(
        &state.database,
        &state.upload_root,
        user_id,
        bytes,
    )
    .await?;

    Ok((StatusCode::CREATED, Json(UserImagePayload { image })))
}

pub(super) async fn upload_user_cover_photo(
    State(state): State<UsersState>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    MultipartFile { bytes }: MultipartFile,
) -> AppResult<(StatusCode, Json<UserImagePayload>)> {
    let image = service::upload_user_cover_photo(
        &state.database,
        &state.upload_root,
        user_id,
        bytes,
    )
    .await?;

    Ok((StatusCode::CREATED, Json(UserImagePayload { image })))
}

pub(super) async fn get_user_image(
    State(state): State<UsersState>,
    Path(path): Path<UserImagePath>,
    AuthenticatedUserOptional(current_user_id): AuthenticatedUserOptional,
    InviteAccessToken(invite_token): InviteAccessToken,
) -> AppResult<Response<axum::body::Body>> {
    let image = service::get_user_image(
        &state.database,
        &state.upload_root,
        current_user_id,
        path.user_id,
        path.image_id,
        invite_token.as_deref(),
    )
    .await?;

    crate::common::images::safe_image_response(image.bytes)
}
