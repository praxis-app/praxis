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
pub(super) struct InstanceRoleResponse {
    pub(super) id: String,
    pub(super) name: String,
    pub(super) color: String,
    pub(super) permissions: Vec<PermissionRule>,
    pub(super) member_count: usize,
    pub(super) members: Vec<UserResponse>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct InstanceRolePayload {
    pub(super) instance_role: InstanceRoleResponse,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct InstanceRolesPayload {
    pub(super) instance_roles: Vec<InstanceRoleResponse>,
}
