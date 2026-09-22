//! Loads path-scoped polls from requests and enforces poll access
//! prerequisites before handlers execute

use axum::{
    extract::{FromRequestParts, Path},
    http::{request::Parts, StatusCode},
};
use entity::polls;
use sea_orm::prelude::Uuid;

use super::{handlers::PollsState, service, types::PollPath};
use crate::{auth::AuthenticatedUser, channels, common::ApiError};

pub(super) struct PollDeleteContext {
    pub(super) poll: polls::Model,
}

impl FromRequestParts<PollsState> for PollDeleteContext {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &PollsState,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = Path::<PollPath>::from_request_parts(parts, state)
            .await
            .map_err(|_| {
                ApiError::new(StatusCode::BAD_REQUEST, "Invalid route path.")
            })?;
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;
        let poll = service::get_poll(
            &state.database,
            path.server_id,
            path.channel_id,
            path.poll_id,
        )
        .await?;

        can_manage_poll(state, path.channel_id, user_id, &poll).await?;

        Ok(Self { poll })
    }
}

async fn can_manage_poll(
    state: &PollsState,
    channel_id: Uuid,
    user_id: Uuid,
    poll: &polls::Model,
) -> Result<(), ApiError> {
    channels::ensure_channel_member(&state.database, channel_id, user_id)
        .await?;
    if poll.user_id == user_id {
        Ok(())
    } else {
        Err(ApiError::new(StatusCode::FORBIDDEN, "Forbidden."))
    }
}
