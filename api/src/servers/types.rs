use sea_orm::prelude::{DateTimeWithTimeZone, Uuid};
use serde::{Deserialize, Serialize};

use crate::users::UserImageRef;

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ServerPath {
    pub(crate) server_id: Uuid,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ServerImagePath {
    pub(super) server_id: Uuid,
    pub(super) image_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ServerRequest {
    pub(super) name: String,
    pub(super) slug: String,
    pub(super) description: Option<String>,
    pub(super) is_default_server: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ServerMembersRequest {
    pub(super) user_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct JoinServerRequest {
    pub(super) invite_token: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ServerResponse {
    pub(super) id: String,
    pub(super) name: String,
    pub(super) slug: String,
    pub(super) description: Option<String>,
    pub(super) image: Option<ServerImageRef>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) is_default_server: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) general_channel_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) member_count: Option<u64>,
    pub(super) created_at: String,
    pub(super) updated_at: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ServerImageRef {
    pub(crate) id: String,
    pub(crate) created_at: String,
}

pub(super) struct StoredServerImage {
    pub(super) bytes: Vec<u8>,
}

#[derive(Debug, Serialize)]
pub(super) struct ServerPayload {
    pub(super) server: ServerResponse,
}

#[derive(Debug, Serialize)]
pub(crate) struct ServersPayload {
    pub(crate) servers: Vec<ServerResponse>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct UserResponse {
    pub(crate) id: String,
    pub(crate) name: String,
    pub(crate) display_name: Option<String>,
    pub(crate) profile_picture: Option<UserImageRef>,
}

#[derive(Debug, Serialize)]
pub(crate) struct UsersPayload {
    pub(crate) users: Vec<UserResponse>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ServerConfigRequest {
    pub(crate) anonymous_users_enabled: Option<bool>,
    pub(crate) decision_making_model: Option<String>,
    pub(crate) disagreements_limit: Option<i32>,
    pub(crate) abstains_limit: Option<i32>,
    pub(crate) agreement_threshold: Option<i32>,
    pub(crate) quorum_enabled: Option<bool>,
    pub(crate) quorum_threshold: Option<i32>,
    pub(crate) voting_time_limit: Option<i32>,
    pub(crate) blocks_open_to_all: Option<bool>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ServerConfigResponse {
    pub(super) anonymous_users_enabled: bool,
    pub(super) decision_making_model: String,
    pub(super) disagreements_limit: i32,
    pub(super) abstains_limit: i32,
    pub(super) agreement_threshold: i32,
    pub(super) quorum_enabled: bool,
    pub(super) quorum_threshold: i32,
    pub(super) voting_time_limit: i32,
    pub(super) blocks_open_to_all: bool,
    pub(super) updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ServerConfigPayload {
    pub(super) server_config: ServerConfigResponse,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct AnonymousUsersEnabledResponse {
    pub(super) anonymous_users_enabled: bool,
}

pub(crate) fn serialize_timestamp(value: DateTimeWithTimeZone) -> String {
    value.to_rfc3339()
}
