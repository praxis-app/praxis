use axum::{
    extract::{Path, Query, State},
    http::{Response, StatusCode},
    response::Json,
};
use sea_orm::{prelude::Uuid, DatabaseConnection};
use std::{path::PathBuf, sync::Arc};

use super::{
    moderation::{self, AccountModeration},
    service,
    types::{
        CurrentUserPayload, FirstUserResponse, InstanceUsersQuery,
        InstanceUsersResponse, UpdateUserProfileRequest, UserConfigPayload,
        UserConfigRequest, UserImagePath, UserImagePayload, UserPath,
        UserProfilePayload,
    },
    user_configs,
};
use crate::{
    auth::{AuthenticatedUser, AuthenticatedUserOptional, HasJwtSecret},
    cache::CacheService,
    calls::LiveKitConfig,
    common::{
        request::{parse_uuid, MultipartFile},
        response::EmptyResponse,
        storage::upload_root,
        AppResult,
    },
    invites::InviteAccessToken,
    moderation::ModerationReasonRequest,
    pub_sub::PubSubService,
    servers::{self, types::ServersPayload},
};

#[derive(Clone, Debug)]
pub(super) struct UsersState {
    database: DatabaseConnection,
    jwt_secret: Arc<str>,
    upload_root: Arc<PathBuf>,
    cache_service: CacheService,
    pub_sub_service: PubSubService,
    livekit: Option<LiveKitConfig>,
}

impl UsersState {
    pub(super) fn new(
        database: DatabaseConnection,
        jwt_secret: String,
        cache_service: CacheService,
        pub_sub_service: PubSubService,
        livekit: Option<LiveKitConfig>,
    ) -> Self {
        Self {
            database,
            jwt_secret: Arc::<str>::from(jwt_secret),
            upload_root: Arc::new(upload_root()),
            cache_service,
            pub_sub_service,
            livekit,
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

pub(super) async fn get_instance_users(
    State(state): State<UsersState>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    Query(query): Query<InstanceUsersQuery>,
) -> AppResult<Json<InstanceUsersResponse>> {
    let users = moderation::list_instance_users(
        &state.database,
        user_id,
        query.before.as_deref(),
        query.limit,
    )
    .await?;
    Ok(Json(users))
}

pub(super) async fn suspend_user(
    State(state): State<UsersState>,
    Path(path): Path<UserPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    Json(payload): Json<ModerationReasonRequest>,
) -> AppResult<Json<EmptyResponse>> {
    moderation::suspend_user(
        &state.database,
        account_moderation(user_id, &path, payload.reason),
    )
    .await?;
    evict_account(&state, path.user_id).await;
    Ok(Json(EmptyResponse {}))
}

pub(super) async fn restore_user(
    State(state): State<UsersState>,
    Path(path): Path<UserPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    payload: Option<Json<ModerationReasonRequest>>,
) -> AppResult<Json<EmptyResponse>> {
    let reason = payload.and_then(|Json(payload)| payload.reason);
    moderation::restore_user(
        &state.database,
        account_moderation(user_id, &path, reason),
    )
    .await?;
    Ok(Json(EmptyResponse {}))
}

pub(super) async fn delete_user(
    State(state): State<UsersState>,
    Path(path): Path<UserPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    Json(payload): Json<ModerationReasonRequest>,
) -> AppResult<Json<EmptyResponse>> {
    moderation::delete_user(
        &state.database,
        &state.upload_root,
        account_moderation(user_id, &path, payload.reason),
    )
    .await?;
    evict_account(&state, path.user_id).await;
    Ok(Json(EmptyResponse {}))
}

async fn evict_account(state: &UsersState, user_id: Uuid) {
    moderation::evict_account(
        &state.database,
        &state.pub_sub_service,
        state.livekit.as_ref(),
        user_id,
    )
    .await;
}

fn account_moderation(
    actor_user_id: Uuid,
    path: &UserPath,
    reason: Option<String>,
) -> AccountModeration {
    AccountModeration {
        actor_user_id,
        target_user_id: path.user_id,
        reason,
    }
}
