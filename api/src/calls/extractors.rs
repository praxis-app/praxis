use axum::{
    extract::{FromRequestParts, Path},
    http::{request::Parts, StatusCode},
};
use sea_orm::prelude::Uuid;

use super::types::CallPath;
use crate::{
    auth::{AuthenticatedUser, HasJwtSecret},
    channels::{self, extractors::HasDatabase},
    common::ApiError,
};

pub(crate) struct CallWriteContext {
    pub(crate) server_id: Uuid,
    pub(crate) channel_id: Uuid,
    pub(crate) call_id: Uuid,
    pub(crate) user_id: Uuid,
}

impl<S> FromRequestParts<S> for CallWriteContext
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
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;

        channels::get_channel(
            state.database(),
            path.server_id,
            path.channel_id,
        )
        .await?;
        channels::ensure_channel_member(
            state.database(),
            path.channel_id,
            user_id,
        )
        .await?;
        super::service::get_call(
            state.database(),
            path.server_id,
            path.channel_id,
            path.call_id,
        )
        .await?;

        Ok(Self {
            server_id: path.server_id,
            channel_id: path.channel_id,
            call_id: path.call_id,
            user_id,
        })
    }
}
