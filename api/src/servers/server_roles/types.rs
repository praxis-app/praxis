use sea_orm::prelude::Uuid;
use serde::{Deserialize, Serialize};

use crate::{authz::PermissionRule, servers::types::UserResponse};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct RoleRequest {
    pub(super) name: String,
    pub(super) color: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct RoleMembersRequest {
    pub(super) user_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct UpdatePermissionsRequest {
    pub(super) permissions: Vec<PermissionRule>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ServerRoleResponse {
    pub(super) id: String,
    pub(super) name: String,
    pub(super) color: String,
    pub(super) permissions: Vec<PermissionRule>,
    pub(super) member_count: usize,
    pub(super) members: Vec<UserResponse>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ServerRolePayload {
    pub(super) server_role: ServerRoleResponse,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ServerRolesPayload {
    pub(super) server_roles: Vec<ServerRoleResponse>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ServerRolePath {
    pub(super) server_id: Uuid,
    pub(super) server_role_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ServerRoleMemberPath {
    pub(super) server_id: Uuid,
    pub(super) server_role_id: Uuid,
    pub(super) user_id: Uuid,
}
