use axum::{extract::State, http::StatusCode, response::Json};
use sea_orm::{prelude::Uuid, DatabaseConnection};
use std::sync::Arc;

use super::{
    extractors::{
        CanManageInstanceRoleContext, CanManageInstanceRoleMemberContext,
        CanManageInstanceRolesContext,
    },
    service,
    types::{
        InstanceRolePayload, InstanceRolesPayload, RoleMembersRequest,
        RoleRequest, UpdatePermissionsRequest,
    },
};
use crate::{
    auth::HasJwtSecret,
    common::{response::EmptyResponse, ApiError, AppResult},
    servers::types::UsersPayload,
};

#[derive(Clone, Debug)]
pub(super) struct InstanceRolesState {
    pub(super) database: DatabaseConnection,
    jwt_secret: Arc<str>,
}

impl InstanceRolesState {
    pub(super) fn new(
        database: DatabaseConnection,
        jwt_secret: String,
    ) -> Self {
        Self {
            database,
            jwt_secret: Arc::<str>::from(jwt_secret),
        }
    }
}

impl HasJwtSecret for InstanceRolesState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

pub(super) async fn get_instance_role(
    State(state): State<InstanceRolesState>,
    context: CanManageInstanceRoleContext,
) -> AppResult<Json<InstanceRolePayload>> {
    let instance_role =
        service::get_instance_role(&state.database, context.instance_role_id)
            .await?;
    Ok(Json(InstanceRolePayload { instance_role }))
}

pub(super) async fn get_instance_roles(
    State(state): State<InstanceRolesState>,
    _: CanManageInstanceRolesContext,
) -> AppResult<Json<InstanceRolesPayload>> {
    let instance_roles = service::get_instance_roles(&state.database).await?;
    Ok(Json(InstanceRolesPayload { instance_roles }))
}

// Unlike the server-role equivalent, no proposal flow needs this list: poll
// actions can only propose changes to server roles, never instance roles
pub(super) async fn get_users_eligible_for_instance_role(
    State(state): State<InstanceRolesState>,
    context: CanManageInstanceRoleContext,
) -> AppResult<Json<UsersPayload>> {
    let users = service::get_users_eligible_for_instance_role(
        &state.database,
        context.instance_role_id,
    )
    .await?;
    Ok(Json(UsersPayload { users }))
}

pub(super) async fn create_instance_role(
    State(state): State<InstanceRolesState>,
    _: CanManageInstanceRolesContext,
    Json(payload): Json<RoleRequest>,
) -> AppResult<Json<InstanceRolePayload>> {
    let instance_role =
        service::create_instance_role(&state.database, payload).await?;
    Ok(Json(InstanceRolePayload { instance_role }))
}

pub(super) async fn update_instance_role(
    State(state): State<InstanceRolesState>,
    context: CanManageInstanceRoleContext,
    Json(payload): Json<RoleRequest>,
) -> AppResult<Json<EmptyResponse>> {
    service::update_instance_role(
        &state.database,
        context.instance_role_id,
        payload,
    )
    .await?;
    Ok(Json(EmptyResponse {}))
}

pub(super) async fn update_instance_role_permissions(
    State(state): State<InstanceRolesState>,
    context: CanManageInstanceRoleContext,
    Json(payload): Json<UpdatePermissionsRequest>,
) -> AppResult<Json<EmptyResponse>> {
    service::update_instance_role_permissions(
        &state.database,
        context.instance_role_id,
        payload.permissions,
    )
    .await?;
    Ok(Json(EmptyResponse {}))
}

pub(super) async fn add_instance_role_members(
    State(state): State<InstanceRolesState>,
    context: CanManageInstanceRoleContext,
    Json(payload): Json<RoleMembersRequest>,
) -> AppResult<Json<EmptyResponse>> {
    let user_ids = parse_user_ids(&payload.user_ids)?;
    service::add_instance_role_members(
        &state.database,
        context.instance_role_id,
        &user_ids,
    )
    .await?;
    Ok(Json(EmptyResponse {}))
}

pub(super) async fn remove_instance_role_member(
    State(state): State<InstanceRolesState>,
    context: CanManageInstanceRoleMemberContext,
) -> AppResult<Json<EmptyResponse>> {
    service::remove_instance_role_member(
        &state.database,
        context.instance_role_id,
        context.member_user_id,
    )
    .await?;
    Ok(Json(EmptyResponse {}))
}

pub(super) async fn delete_instance_role(
    State(state): State<InstanceRolesState>,
    context: CanManageInstanceRoleContext,
) -> AppResult<Json<EmptyResponse>> {
    service::delete_instance_role(&state.database, context.instance_role_id)
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
