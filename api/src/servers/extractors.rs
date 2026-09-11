use axum::{
    extract::{FromRequestParts, Path},
    http::{request::Parts, StatusCode},
};
use sea_orm::prelude::Uuid;

use super::{handlers::ServersState, service, types::ServerPath};
use crate::{
    auth::AuthenticatedUser, common::ApiError, invites::InviteAccessToken,
};

pub(super) struct CanReadServerContext {
    pub(super) path: ServerPath,
}

impl FromRequestParts<ServersState> for CanReadServerContext {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &ServersState,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = Path::<ServerPath>::from_request_parts(parts, state)
            .await
            .map_err(|_| {
                ApiError::new(StatusCode::BAD_REQUEST, "Invalid route path.")
            })?;
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;
        let InviteAccessToken(invite_token) =
            InviteAccessToken::from_request_parts(parts, state).await?;

        service::can_read_server(
            &state.database,
            path.server_id,
            Some(user_id),
            invite_token.as_deref(),
        )
        .await?;

        Ok(Self { path })
    }
}

pub(super) struct CanUpdateServerContext {
    pub(super) path: ServerPath,
    pub(super) user_id: Uuid,
}

impl FromRequestParts<ServersState> for CanUpdateServerContext {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &ServersState,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = Path::<ServerPath>::from_request_parts(parts, state)
            .await
            .map_err(|_| {
                ApiError::new(StatusCode::BAD_REQUEST, "Invalid route path.")
            })?;
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;

        service::can_update_server(&state.database, user_id, path.server_id)
            .await?;

        Ok(Self { path, user_id })
    }
}

pub(super) struct CanManageServersContext {
    pub(super) user_id: Uuid,
}

impl FromRequestParts<ServersState> for CanManageServersContext {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &ServersState,
    ) -> Result<Self, Self::Rejection> {
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;

        service::can_manage_servers(&state.database, user_id).await?;

        Ok(Self { user_id })
    }
}
