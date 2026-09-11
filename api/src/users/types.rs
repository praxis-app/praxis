use sea_orm::{prelude::Uuid, DbErr};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

use super::models::UserRecord;
use crate::{authz::PermissionRule, servers::types::ServerResponse};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PublicUser {
    id: Uuid,
    email: Option<String>,
    name: String,
    display_name: Option<String>,
    anonymous: bool,
}

impl From<UserRecord> for PublicUser {
    fn from(user: UserRecord) -> Self {
        Self {
            id: user.id,
            email: user.email,
            name: user.name,
            display_name: user.display_name,
            anonymous: user.anonymous,
        }
    }
}

pub(crate) enum CreateUserError {
    DuplicateEmail,
    Database(DbErr),
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct UserImageRef {
    pub(super) id: String,
    pub(super) created_at: String,
}

#[derive(Debug, Serialize)]
pub(super) struct UserImagePayload {
    pub(super) image: UserImageRef,
}

#[derive(Debug, Clone)]
pub(super) struct StoredUserImage {
    pub(super) bytes: Vec<u8>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct UserImagePath {
    pub(super) user_id: Uuid,
    pub(super) image_id: Uuid,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct CurrentUserResponse {
    pub(super) id: String,
    pub(super) name: String,
    pub(super) display_name: Option<String>,
    pub(super) anonymous: bool,
    pub(super) permissions: CurrentUserPermissions,
    pub(super) profile_picture: Option<UserImageRef>,
    pub(super) current_server: Option<ServerResponse>,
    pub(super) servers_count: usize,
}

#[derive(Debug, Serialize)]
pub(super) struct CurrentUserPayload {
    pub(super) user: CurrentUserResponse,
}

#[derive(Debug, Clone, Serialize)]
pub(super) struct CurrentUserPermissions {
    pub(super) instance: Vec<PermissionRule>,
    pub(super) servers: BTreeMap<String, Vec<PermissionRule>>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct UserProfileResponse {
    pub(super) id: String,
    pub(super) name: String,
    pub(super) display_name: Option<String>,
    pub(super) bio: Option<String>,
    pub(super) profile_picture: Option<UserImageRef>,
    pub(super) cover_photo: Option<UserImageRef>,
}

#[derive(Debug, Serialize)]
pub(super) struct UserProfilePayload {
    pub(super) user: UserProfileResponse,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct FirstUserResponse {
    pub(super) is_first_user: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct UpdateUserProfileRequest {
    pub(super) name: Option<String>,
    pub(super) display_name: Option<String>,
    pub(super) bio: Option<String>,
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(crate) struct UserConfigRequest {
    pub(crate) message_notifications_enabled: Option<bool>,
    pub(crate) reply_notifications_enabled: Option<bool>,
    pub(crate) proposal_notifications_enabled: Option<bool>,
    pub(crate) role_notifications_enabled: Option<bool>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct UserConfigResponse {
    pub(crate) message_notifications_enabled: bool,
    pub(crate) reply_notifications_enabled: bool,
    pub(crate) proposal_notifications_enabled: bool,
    pub(crate) role_notifications_enabled: bool,
    pub(crate) updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct UserConfigPayload {
    pub(super) user_config: UserConfigResponse,
}
