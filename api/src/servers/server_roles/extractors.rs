//! Resolves server-role routes and enforces their access rules before
//! handlers execute.
//!
//! The mutating routes require `ServerRole: manage`. The read routes require
//! only read access to the server, because the proposal flow needs current
//! role definitions and eligible members in order to propose changes to them

use axum::{
    extract::{FromRequestParts, Path},
    http::{request::Parts, StatusCode},
};
use sea_orm::prelude::Uuid;

use super::{
    handlers::ServerRolesState,
    types::{ServerRoleMemberPath, ServerRolePath},
};
use crate::{
    auth::{AuthenticatedUser, AuthenticatedUserOptional},
    authz::{self, PermissionScope},
    common::ApiError,
    invites::InviteAccessToken,
    servers::{self, types::ServerPath},
};

pub(super) struct CanManageServerRolesContext {
    pub(super) server_id: Uuid,
}

pub(super) struct CanManageServerRoleContext {
    pub(super) server_id: Uuid,
    pub(super) server_role_id: Uuid,
    pub(super) user_id: Uuid,
}

pub(super) struct CanManageServerRoleMemberContext {
    pub(super) server_id: Uuid,
    pub(super) server_role_id: Uuid,
    pub(super) member_user_id: Uuid,
}

impl FromRequestParts<ServerRolesState> for CanManageServerRolesContext {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &ServerRolesState,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = Path::<ServerPath>::from_request_parts(parts, state)
            .await
            .map_err(|_| invalid_route_path())?;
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;

        can_manage_server_roles(state, user_id, path.server_id).await?;

        Ok(Self {
            server_id: path.server_id,
        })
    }
}

impl FromRequestParts<ServerRolesState> for CanManageServerRoleContext {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &ServerRolesState,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) =
            Path::<ServerRolePath>::from_request_parts(parts, state)
                .await
                .map_err(|_| invalid_route_path())?;
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;

        can_manage_server_roles(state, user_id, path.server_id).await?;

        Ok(Self {
            server_id: path.server_id,
            server_role_id: path.server_role_id,
            user_id,
        })
    }
}

impl FromRequestParts<ServerRolesState> for CanManageServerRoleMemberContext {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &ServerRolesState,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) =
            Path::<ServerRoleMemberPath>::from_request_parts(parts, state)
                .await
                .map_err(|_| invalid_route_path())?;
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;

        can_manage_server_roles(state, user_id, path.server_id).await?;

        Ok(Self {
            server_id: path.server_id,
            server_role_id: path.server_role_id,
            member_user_id: path.user_id,
        })
    }
}

async fn can_manage_server_roles(
    state: &ServerRolesState,
    user_id: Uuid,
    server_id: Uuid,
) -> Result<(), ApiError> {
    authz::can(
        &state.database,
        user_id,
        "manage",
        "ServerRole",
        PermissionScope::Server(server_id),
    )
    .await
}

fn invalid_route_path() -> ApiError {
    ApiError::new(StatusCode::BAD_REQUEST, "Invalid route path.")
}

pub(super) struct IsServerAudienceContext {
    pub(super) server_id: Uuid,
}

impl FromRequestParts<ServerRolesState> for IsServerAudienceContext {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &ServerRolesState,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = Path::<ServerPath>::from_request_parts(parts, state)
            .await
            .map_err(|_| invalid_route_path())?;
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;

        servers::is_server_audience(
            &state.database,
            path.server_id,
            Some(user_id),
            None,
        )
        .await?;

        Ok(Self {
            server_id: path.server_id,
        })
    }
}

pub(super) struct CanReadServerRoleContext {
    pub(super) server_id: Uuid,
    pub(super) server_role_id: Uuid,
}

impl FromRequestParts<ServerRolesState> for CanReadServerRoleContext {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &ServerRolesState,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) =
            Path::<ServerRolePath>::from_request_parts(parts, state)
                .await
                .map_err(|_| invalid_route_path())?;
        let AuthenticatedUserOptional(user_id) =
            AuthenticatedUserOptional::from_request_parts(parts, state).await?;
        let InviteAccessToken(invite_token) =
            InviteAccessToken::from_request_parts(parts, state).await?;

        servers::is_server_audience(
            &state.database,
            path.server_id,
            user_id,
            invite_token.as_deref(),
        )
        .await?;

        Ok(Self {
            server_id: path.server_id,
            server_role_id: path.server_role_id,
        })
    }
}

pub(super) struct CanReadServerRoleMembersContext {
    pub(super) server_id: Uuid,
    pub(super) server_role_id: Uuid,
}

impl FromRequestParts<ServerRolesState> for CanReadServerRoleMembersContext {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &ServerRolesState,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) =
            Path::<ServerRolePath>::from_request_parts(parts, state)
                .await
                .map_err(|_| invalid_route_path())?;
        let AuthenticatedUser(user_id) =
            AuthenticatedUser::from_request_parts(parts, state).await?;

        servers::is_server_audience(
            &state.database,
            path.server_id,
            Some(user_id),
            None,
        )
        .await?;

        Ok(Self {
            server_id: path.server_id,
            server_role_id: path.server_role_id,
        })
    }
}
