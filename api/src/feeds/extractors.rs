use axum::{
    extract::{FromRequestParts, Path},
    http::{request::Parts, StatusCode},
};
use sea_orm::prelude::Uuid;

use crate::{
    auth::{AuthenticatedUserOptional, HasJwtSecret},
    calls::types::CallPath,
    channels::{self, extractors::HasDatabase},
    common::ApiError,
    invites::InviteAccessToken,
};

pub(super) struct ChannelFeedAccessContext {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) user_id: Option<Uuid>,
}

pub(super) struct CallFeedAccessContext {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) call_id: Uuid,
}

impl<S> FromRequestParts<S> for ChannelFeedAccessContext
where
    S: HasDatabase + HasJwtSecret + Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) =
            Path::<channels::types::ChannelPath>::from_request_parts(
                parts, state,
            )
            .await
            .map_err(|_| {
                ApiError::new(StatusCode::BAD_REQUEST, "Invalid route path.")
            })?;
        let AuthenticatedUserOptional(user_id) =
            AuthenticatedUserOptional::from_request_parts(parts, state).await?;
        let InviteAccessToken(invite_token) =
            InviteAccessToken::from_request_parts(parts, state).await?;

        channels::can_read_channel(
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

impl<S> FromRequestParts<S> for CallFeedAccessContext
where
    S: HasDatabase + HasJwtSecret + Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = Path::<CallPath>::from_request_parts(parts, state)
            .await
            .map_err(|_| {
                ApiError::new(StatusCode::BAD_REQUEST, "Invalid route path.")
            })?;
        let AuthenticatedUserOptional(user_id) =
            AuthenticatedUserOptional::from_request_parts(parts, state).await?;
        let InviteAccessToken(invite_token) =
            InviteAccessToken::from_request_parts(parts, state).await?;

        channels::can_read_channel(
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
            call_id: path.call_id,
        })
    }
}
