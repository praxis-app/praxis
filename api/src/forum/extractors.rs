use axum::{
    extract::{FromRequestParts, Path},
    http::{request::Parts, StatusCode},
};
use entity::enums::ChannelType;
use sea_orm::prelude::Uuid;

use super::types::{ForumChannelPath, ForumPostPath, ForumReplyPath};
use crate::{
    auth::{AuthenticatedUser, AuthenticatedUserOptional, HasJwtSecret},
    channels::{self, extractors::HasDatabase},
    common::ApiError,
    invites::InviteAccessToken,
};

pub(super) struct ForumReadContext {
    pub(super) channel_id: Uuid,
}

pub(super) struct ForumPostReadContext {
    pub(super) channel_id: Uuid,
    pub(super) post_id: Uuid,
    pub(super) user_id: Option<Uuid>,
}

pub(super) struct ForumAccessContext {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) user_id: Uuid,
}

impl<S> FromRequestParts<S> for ForumReadContext
where
    S: HasDatabase + HasJwtSecret + Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = forum_channel_path(parts, state).await?;
        let AuthenticatedUserOptional(user_id) =
            AuthenticatedUserOptional::from_request_parts(parts, state).await?;
        let InviteAccessToken(invite_token) =
            InviteAccessToken::from_request_parts(parts, state).await?;
        can_read_forum_channel(
            state,
            path.server_id,
            path.channel_id,
            user_id,
            invite_token.as_deref(),
        )
        .await?;

        Ok(Self {
            channel_id: path.channel_id,
        })
    }
}

impl<S> FromRequestParts<S> for ForumPostReadContext
where
    S: HasDatabase + HasJwtSecret + Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = forum_post_path(parts, state).await?;
        let AuthenticatedUserOptional(user_id) =
            AuthenticatedUserOptional::from_request_parts(parts, state).await?;
        let InviteAccessToken(invite_token) =
            InviteAccessToken::from_request_parts(parts, state).await?;
        can_read_forum_channel(
            state,
            path.server_id,
            path.channel_id,
            user_id,
            invite_token.as_deref(),
        )
        .await?;

        Ok(Self {
            channel_id: path.channel_id,
            post_id: path.post_id,
            user_id,
        })
    }
}

pub(super) struct ForumPostAccessContext {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) post_id: Uuid,
    pub(super) user_id: Uuid,
}

pub(super) struct ForumReplyAccessContext {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) post_id: Uuid,
    pub(super) reply_id: Uuid,
    pub(super) user_id: Uuid,
}

impl<S> FromRequestParts<S> for ForumAccessContext
where
    S: HasDatabase + HasJwtSecret + Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = forum_channel_path(parts, state).await?;
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;
        is_forum_channel_member(
            state,
            path.server_id,
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

impl<S> FromRequestParts<S> for ForumPostAccessContext
where
    S: HasDatabase + HasJwtSecret + Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = forum_post_path(parts, state).await?;
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;
        is_forum_channel_member(
            state,
            path.server_id,
            path.channel_id,
            user_id,
        )
        .await?;

        Ok(Self {
            server_id: path.server_id,
            channel_id: path.channel_id,
            post_id: path.post_id,
            user_id,
        })
    }
}

async fn forum_channel_path<S>(
    parts: &mut Parts,
    state: &S,
) -> Result<Path<ForumChannelPath>, ApiError>
where
    S: Send + Sync,
{
    Path::<ForumChannelPath>::from_request_parts(parts, state)
        .await
        .map_err(|_| invalid_route_path())
}

async fn forum_post_path<S>(
    parts: &mut Parts,
    state: &S,
) -> Result<Path<ForumPostPath>, ApiError>
where
    S: Send + Sync,
{
    Path::<ForumPostPath>::from_request_parts(parts, state)
        .await
        .map_err(|_| invalid_route_path())
}

async fn can_read_forum_channel<S>(
    state: &S,
    server_id: Uuid,
    channel_id: Uuid,
    user_id: Option<Uuid>,
    invite_token: Option<&str>,
) -> Result<(), ApiError>
where
    S: HasDatabase + Send + Sync,
{
    ensure_forum_channel(state, server_id, channel_id).await?;
    channels::can_read_channel(
        state.database(),
        server_id,
        channel_id,
        user_id,
        invite_token,
    )
    .await
}

impl<S> FromRequestParts<S> for ForumReplyAccessContext
where
    S: HasDatabase + HasJwtSecret + Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) =
            Path::<ForumReplyPath>::from_request_parts(parts, state)
                .await
                .map_err(|_| {
                    ApiError::new(
                        StatusCode::BAD_REQUEST,
                        "Invalid route path.",
                    )
                })?;
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;
        is_forum_channel_member(
            state,
            path.server_id,
            path.channel_id,
            user_id,
        )
        .await?;

        Ok(Self {
            server_id: path.server_id,
            channel_id: path.channel_id,
            post_id: path.post_id,
            reply_id: path.reply_id,
            user_id,
        })
    }
}

async fn is_forum_channel_member<S>(
    state: &S,
    server_id: Uuid,
    channel_id: Uuid,
    user_id: Uuid,
) -> Result<(), ApiError>
where
    S: HasDatabase + Send + Sync,
{
    ensure_forum_channel(state, server_id, channel_id).await?;
    channels::ensure_channel_member(state.database(), channel_id, user_id)
        .await?;
    Ok(())
}

async fn ensure_forum_channel<S>(
    state: &S,
    server_id: Uuid,
    channel_id: Uuid,
) -> Result<entity::channels::Model, ApiError>
where
    S: HasDatabase + Send + Sync,
{
    let channel =
        channels::get_channel(state.database(), server_id, channel_id).await?;
    if channel.channel_type != ChannelType::Forum {
        return Err(ApiError::new(
            StatusCode::NOT_FOUND,
            "Forum channel not found.",
        ));
    }
    Ok(channel)
}

fn invalid_route_path() -> ApiError {
    ApiError::new(StatusCode::BAD_REQUEST, "Invalid route path.")
}
