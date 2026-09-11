use serde::{Deserialize, Serialize};

use crate::users::PublicUser;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct SignupRequest {
    pub(super) email: String,
    pub(super) name: String,
    pub(super) password: String,
    pub(super) invite_token: Option<String>,
}

#[derive(Debug, Deserialize)]
pub(super) struct LoginRequest {
    pub(super) email: String,
    pub(super) password: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct CreateAnonSessionRequest {
    pub(super) invite_token: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct SessionResponse {
    pub(super) user: Option<PublicUser>,
    #[serde(rename = "access_token")]
    pub(super) access_token: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub(super) struct Claims {
    pub(super) sub: String,
    pub(super) exp: u64,
}
