use entity::enums::{
    PollActionPermissionChangeType, PollActionRoleMemberChangeType,
    PollActionType,
};
use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CreatePollActionRequest {
    pub(crate) action_type: PollActionType,
    pub(crate) server_role: Option<CreatePollActionServerRoleRequest>,
    pub(crate) server_config:
        Option<crate::servers::types::ServerConfigRequest>,
    pub(crate) event: Option<CreatePollActionEventRequest>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(crate) struct CreatePollActionEventRequest {
    pub(crate) name: String,
    pub(crate) description: String,
    pub(crate) starts_at: DateTimeWithTimeZone,
    pub(crate) ends_at: Option<DateTimeWithTimeZone>,
    pub(crate) online: bool,
    pub(crate) location: Option<String>,
    pub(crate) external_link: Option<String>,
    pub(crate) host_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CreatePollActionServerRoleRequest {
    pub(crate) name: Option<String>,
    pub(crate) color: Option<String>,
    pub(crate) members: Option<Vec<PollActionServerRoleMemberRequest>>,
    pub(crate) permissions: Option<Vec<CreatePollActionPermissionRequest>>,
    pub(crate) server_role_to_update_id: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PollActionServerRoleMemberRequest {
    pub(super) user_id: String,
    pub(super) change_type: PollActionRoleMemberChangeType,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CreatePollActionPermissionRequest {
    pub(super) subject: String,
    pub(super) actions: Vec<PollActionPermissionChangeRequest>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct PollActionPermissionChangeRequest {
    pub(super) action: String,
    pub(super) change_type: PollActionPermissionChangeType,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PollActionResponse {
    pub(super) id: String,
    pub(super) action_type: PollActionType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) server_role: Option<PollActionServerRoleResponse>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) server_config: Option<PollActionServerConfigResponse>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) event: Option<PollActionEventResponse>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct PollActionEventResponse {
    pub(super) id: String,
    pub(super) name: String,
    pub(super) description: String,
    pub(super) starts_at: String,
    pub(super) ends_at: Option<String>,
    pub(super) online: bool,
    pub(super) location: Option<String>,
    pub(super) external_link: Option<String>,
    pub(super) hosts: Vec<PollActionUserResponse>,
    pub(super) cover_photo: Option<PollActionEventCoverPhotoResponse>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) created_event_id: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PollActionEventCoverPhotoResponse {
    pub(crate) id: String,
    pub(crate) created_at: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct PollActionServerConfigResponse {
    pub(super) anonymous_users_enabled: Option<bool>,
    pub(super) prev_anonymous_users_enabled: Option<bool>,
    pub(super) decision_making_model: Option<String>,
    pub(super) prev_decision_making_model: Option<String>,
    pub(super) disagreements_limit: Option<i32>,
    pub(super) prev_disagreements_limit: Option<i32>,
    pub(super) abstains_limit: Option<i32>,
    pub(super) prev_abstains_limit: Option<i32>,
    pub(super) agreement_threshold: Option<i32>,
    pub(super) prev_agreement_threshold: Option<i32>,
    pub(super) quorum_enabled: Option<bool>,
    pub(super) prev_quorum_enabled: Option<bool>,
    pub(super) quorum_threshold: Option<i32>,
    pub(super) prev_quorum_threshold: Option<i32>,
    pub(super) voting_time_limit: Option<i32>,
    pub(super) prev_voting_time_limit: Option<i32>,
    pub(super) blocks_open_to_all: Option<bool>,
    pub(super) prev_blocks_open_to_all: Option<bool>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct PollActionServerRoleResponse {
    pub(super) id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) color: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) prev_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) prev_color: Option<String>,
    pub(super) server_role_id: String,
    pub(super) members: Vec<PollActionServerRoleMemberResponse>,
    pub(super) permissions: Vec<PollActionPermissionResponse>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct PollActionServerRoleMemberResponse {
    pub(super) change_type: PollActionRoleMemberChangeType,
    pub(super) user: PollActionUserResponse,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct PollActionUserResponse {
    pub(super) id: String,
    pub(super) name: String,
    pub(super) display_name: Option<String>,
    pub(super) profile_picture: Option<crate::users::UserImageRef>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct PollActionPermissionResponse {
    pub(super) subject: String,
    pub(super) action: String,
    pub(super) change_type: PollActionPermissionChangeType,
}
