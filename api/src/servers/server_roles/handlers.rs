use axum::{extract::State, http::StatusCode, response::Json};
use sea_orm::{prelude::Uuid, DatabaseConnection};
use std::sync::Arc;

use super::{
    extractors::{
        CanManageServerRoleContext, CanManageServerRoleMemberContext,
        CanManageServerRolesContext, CanReadServerRoleContext,
        CanReadServerRoleMembersContext, IsServerAudienceContext,
    },
    service,
    types::{
        RoleMembersRequest, RoleRequest, ServerRolePayload, ServerRolesPayload,
        UpdatePermissionsRequest,
    },
};
use crate::{
    auth::HasJwtSecret,
    common::{response::EmptyResponse, ApiError, AppResult},
    notifications,
    pub_sub::PubSubService,
    servers::types::UsersPayload,
};

#[derive(Clone, Debug)]
pub(super) struct ServerRolesState {
    pub(super) database: DatabaseConnection,
    pub(super) pub_sub_service: PubSubService,
    jwt_secret: Arc<str>,
}

impl ServerRolesState {
    pub(super) fn new(
        database: DatabaseConnection,
        jwt_secret: String,
        pub_sub_service: PubSubService,
    ) -> Self {
        Self {
            database,
            pub_sub_service,
            jwt_secret: Arc::<str>::from(jwt_secret),
        }
    }
}

impl HasJwtSecret for ServerRolesState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

pub(super) async fn get_server_role(
    State(state): State<ServerRolesState>,
    context: CanReadServerRoleContext,
) -> AppResult<Json<ServerRolePayload>> {
    let server_role = service::get_server_role(
        &state.database,
        context.server_id,
        context.server_role_id,
    )
    .await?;
    Ok(Json(ServerRolePayload { server_role }))
}

pub(super) async fn get_server_roles(
    State(state): State<ServerRolesState>,
    context: IsServerAudienceContext,
) -> AppResult<Json<ServerRolesPayload>> {
    let server_roles =
        service::get_server_roles(&state.database, context.server_id).await?;
    Ok(Json(ServerRolesPayload { server_roles }))
}

pub(super) async fn get_users_eligible_for_server_role(
    State(state): State<ServerRolesState>,
    context: CanReadServerRoleMembersContext,
) -> AppResult<Json<UsersPayload>> {
    let users = service::get_users_eligible_for_server_role(
        &state.database,
        context.server_id,
        context.server_role_id,
    )
    .await?;
    Ok(Json(UsersPayload { users }))
}

pub(super) async fn create_server_role(
    State(state): State<ServerRolesState>,
    context: CanManageServerRolesContext,
    Json(payload): Json<RoleRequest>,
) -> AppResult<Json<ServerRolePayload>> {
    let server_role = service::create_server_role(
        &state.database,
        context.server_id,
        payload,
    )
    .await?;
    Ok(Json(ServerRolePayload { server_role }))
}

pub(super) async fn update_server_role(
    State(state): State<ServerRolesState>,
    context: CanManageServerRoleContext,
    Json(payload): Json<RoleRequest>,
) -> AppResult<Json<EmptyResponse>> {
    service::update_server_role(
        &state.database,
        context.server_id,
        context.server_role_id,
        payload,
    )
    .await?;
    Ok(Json(EmptyResponse {}))
}

pub(super) async fn update_server_role_permissions(
    State(state): State<ServerRolesState>,
    context: CanManageServerRoleContext,
    Json(payload): Json<UpdatePermissionsRequest>,
) -> AppResult<Json<EmptyResponse>> {
    service::update_server_role_permissions(
        &state.database,
        context.server_id,
        context.server_role_id,
        payload.permissions,
    )
    .await?;
    Ok(Json(EmptyResponse {}))
}

pub(super) async fn add_server_role_members(
    State(state): State<ServerRolesState>,
    context: CanManageServerRoleContext,
    Json(payload): Json<RoleMembersRequest>,
) -> AppResult<Json<EmptyResponse>> {
    let user_ids = parse_user_ids(&payload.user_ids)?;
    let created = service::add_server_role_members(
        &state.database,
        context.server_id,
        context.server_role_id,
        context.user_id,
        &user_ids,
    )
    .await?;

    notifications::publish_notifications(
        &state.database,
        &state.pub_sub_service,
        &created,
    )
    .await;

    Ok(Json(EmptyResponse {}))
}

pub(super) async fn remove_server_role_member(
    State(state): State<ServerRolesState>,
    context: CanManageServerRoleMemberContext,
) -> AppResult<Json<EmptyResponse>> {
    service::remove_server_role_member(
        &state.database,
        context.server_id,
        context.server_role_id,
        context.member_user_id,
    )
    .await?;
    Ok(Json(EmptyResponse {}))
}

pub(super) async fn delete_server_role(
    State(state): State<ServerRolesState>,
    context: CanManageServerRoleContext,
) -> AppResult<Json<EmptyResponse>> {
    service::delete_server_role(
        &state.database,
        context.server_id,
        context.server_role_id,
    )
    .await?;
    Ok(Json(EmptyResponse {}))
}

fn parse_user_ids(values: &[String]) -> AppResult<Vec<Uuid>> {
    values
        .iter()
        .map(|value| {
            value.parse::<Uuid>().map_err(|_| {
                ApiError::new(StatusCode::BAD_REQUEST, "userIds must be UUIDs.")
            })
        })
        .collect()
}
