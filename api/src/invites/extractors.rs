use axum::{
    extract::{FromRequestParts, Path, Query},
    http::{request::Parts, StatusCode},
};
use sea_orm::prelude::Uuid;

use super::{
    handlers::InvitesState,
    types::{InviteAccessQuery, InvitePath, ServerPath},
};
use crate::{
    auth::AuthenticatedUser,
    authz::{self, PermissionScope},
    common::ApiError,
};

const INVITE_TOKEN_HEADER: &str = "x-invite-token";

pub(crate) struct InviteAccessToken(pub(crate) Option<String>);

impl<S> FromRequestParts<S> for InviteAccessToken
where
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        if let Some(value) = parts.headers.get(INVITE_TOKEN_HEADER) {
            let token = value.to_str().map_err(|_| invalid_invite_token())?;
            return Ok(Self(Some(token.to_owned())));
        }

        let Query(query) =
            Query::<InviteAccessQuery>::from_request_parts(parts, state)
                .await
                .map_err(|_| invalid_invite_token())?;
        Ok(Self(query.invite_token))
    }
}

fn invalid_invite_token() -> ApiError {
    ApiError::new(StatusCode::BAD_REQUEST, "Invalid invite token.")
}

pub(crate) struct CanCreateInviteContext {
    pub(super) server_id: Uuid,
    pub(super) user_id: Uuid,
}

pub(crate) struct CanManageInviteContext {
    pub(super) server_id: Uuid,
    pub(super) invite_id: Uuid,
}

impl FromRequestParts<InvitesState> for CanCreateInviteContext {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &InvitesState,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = Path::<ServerPath>::from_request_parts(parts, state)
            .await
            .map_err(|_| invalid_route_path())?;
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;

        // `create`, not `read`: the list exists to manage invites you issue,
        // so only users who can create one need it
        authz::can(
            &state.database,
            user_id,
            "create",
            "Invite",
            PermissionScope::Server(path.server_id),
        )
        .await?;

        Ok(Self {
            server_id: path.server_id,
            user_id,
        })
    }
}

impl FromRequestParts<InvitesState> for CanManageInviteContext {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &InvitesState,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = Path::<InvitePath>::from_request_parts(parts, state)
            .await
            .map_err(|_| invalid_route_path())?;
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;

        authz::can(
            &state.database,
            user_id,
            "manage",
            "Invite",
            PermissionScope::Server(path.server_id),
        )
        .await?;

        Ok(Self {
            server_id: path.server_id,
            invite_id: path.invite_id,
        })
    }
}

fn invalid_route_path() -> ApiError {
    ApiError::new(StatusCode::BAD_REQUEST, "Invalid route path.")
}
