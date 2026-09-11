use axum::{
    extract::{FromRequestParts, Path},
    http::{request::Parts, StatusCode},
};
use sea_orm::{prelude::Uuid, DatabaseConnection};

use super::types::{ChannelPath, ServerPath};
use crate::{
    auth::{AuthenticatedUser, AuthenticatedUserOptional, HasJwtSecret},
    common::ApiError,
    invites::InviteAccessToken,
};

pub(crate) trait HasDatabase {
    fn database(&self) -> &DatabaseConnection;
}

pub(crate) struct ChannelWriteContext {
    pub(crate) server_id: Uuid,
    pub(crate) channel_id: Uuid,
    pub(crate) user_id: Uuid,
}

impl<S> FromRequestParts<S> for ChannelWriteContext
where
    S: HasDatabase + HasJwtSecret + Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = Path::<ChannelPath>::from_request_parts(parts, state)
            .await
            .map_err(|_| {
                ApiError::new(StatusCode::BAD_REQUEST, "Invalid route path.")
            })?;
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;

        super::get_channel(state.database(), path.server_id, path.channel_id)
            .await?;
        super::ensure_channel_member(
            state.database(),
            path.channel_id,
            user_id,
        )
        .await?;

        Ok(Self {
            server_id: path.server_id,
            channel_id: path.channel_id,
            user_id,
        })
    }
}

pub(crate) struct CanManageContext {
    pub(crate) server_id: Uuid,
}

impl<S> FromRequestParts<S> for CanManageContext
where
    S: HasDatabase + HasJwtSecret + Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = Path::<ServerPath>::from_request_parts(parts, state)
            .await
            .map_err(|_| invalid_route_path())?;
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;

        super::service::can_manage_channels(
            state.database(),
            user_id,
            path.server_id,
        )
        .await?;

        Ok(Self {
            server_id: path.server_id,
        })
    }
}

pub(crate) struct CanManageChannelContext {
    pub(crate) server_id: Uuid,
    pub(crate) channel_id: Uuid,
}

impl<S> FromRequestParts<S> for CanManageChannelContext
where
    S: HasDatabase + HasJwtSecret + Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = Path::<ChannelPath>::from_request_parts(parts, state)
            .await
            .map_err(|_| invalid_route_path())?;
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;

        super::service::can_manage_channels(
            state.database(),
            user_id,
            path.server_id,
        )
        .await?;

        Ok(Self {
            server_id: path.server_id,
            channel_id: path.channel_id,
        })
    }
}

pub(crate) struct IsServerAudienceContext {
    pub(crate) server_id: Uuid,
}

impl<S> FromRequestParts<S> for IsServerAudienceContext
where
    S: HasDatabase + HasJwtSecret + Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = Path::<ServerPath>::from_request_parts(parts, state)
            .await
            .map_err(|_| invalid_route_path())?;
        let AuthenticatedUserOptional(user_id) =
            AuthenticatedUserOptional::from_request_parts(parts, state).await?;
        let InviteAccessToken(invite_token) =
            InviteAccessToken::from_request_parts(parts, state).await?;

        crate::servers::is_server_audience(
            state.database(),
            path.server_id,
            user_id,
            invite_token.as_deref(),
        )
        .await?;

        Ok(Self {
            server_id: path.server_id,
        })
    }
}

pub(crate) struct CanReadChannelContext {
    pub(crate) server_id: Uuid,
    pub(crate) channel_id: Uuid,
    pub(crate) user_id: Option<Uuid>,
}

impl<S> FromRequestParts<S> for CanReadChannelContext
where
    S: HasDatabase + HasJwtSecret + Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = Path::<ChannelPath>::from_request_parts(parts, state)
            .await
            .map_err(|_| invalid_route_path())?;
        let AuthenticatedUserOptional(user_id) =
            AuthenticatedUserOptional::from_request_parts(parts, state).await?;
        let InviteAccessToken(invite_token) =
            InviteAccessToken::from_request_parts(parts, state).await?;

        super::can_read_channel(
            state.database(),
            path.server_id,
            path.channel_id,
            user_id,
            invite_token.as_deref(),
        )
        .await?;

        Ok(Self {
            server_id: path.server_id,
            channel_id: path.channel_id,
            user_id,
        })
    }
}

fn invalid_route_path() -> ApiError {
    ApiError::new(StatusCode::BAD_REQUEST, "Invalid route path.")
}
