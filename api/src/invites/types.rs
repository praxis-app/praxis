use sea_orm::prelude::{DateTimeWithTimeZone, Uuid};
use serde::{Deserialize, Serialize};

pub(super) use crate::servers::types::ServerPath;
use crate::users::UserImageRef;

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct InviteAccessQuery {
    pub(crate) invite_token: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct InvitePath {
    pub(super) server_id: Uuid,
    pub(super) invite_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct InviteRequest {
    pub(super) max_uses: Option<i32>,
    pub(super) expires_at: Option<DateTimeWithTimeZone>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct InviteResponse {
    pub(super) id: String,
    pub(super) token: String,
    pub(super) uses: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) max_uses: Option<i32>,
    pub(super) user: InviteUserResponse,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) expires_at: Option<String>,
    pub(super) created_at: String,
}

#[derive(Debug, Serialize)]
pub(super) struct InvitePayload {
    pub(super) invite: InviteResponse,
}

#[derive(Debug, Serialize)]
pub(super) struct InvitesPayload {
    pub(super) invites: Vec<InviteResponse>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct InviteValidityResponse {
    pub(super) is_valid_invite: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct InviteUserResponse {
    pub(super) id: String,
    pub(super) name: String,
    pub(super) display_name: Option<String>,
    pub(super) profile_picture: Option<UserImageRef>,
}
