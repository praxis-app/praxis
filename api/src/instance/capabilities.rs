use axum::{extract::State, response::Json};
use serde::Serialize;
use std::sync::Arc;

use crate::{
    auth::{AuthenticatedUser, HasJwtSecret},
    common::AppResult,
};

#[derive(Clone, Debug)]
pub(super) struct CapabilitiesState {
    jwt_secret: Arc<str>,
    video_calls_enabled: bool,
}

impl CapabilitiesState {
    pub(super) fn new(jwt_secret: String, video_calls_enabled: bool) -> Self {
        Self {
            jwt_secret: Arc::<str>::from(jwt_secret),
            video_calls_enabled,
        }
    }
}

impl HasJwtSecret for CapabilitiesState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct CapabilitiesResponse {
    video_calls_enabled: bool,
}

pub(super) async fn get_capabilities(
    State(state): State<CapabilitiesState>,
    AuthenticatedUser(_user_id): AuthenticatedUser,
) -> AppResult<Json<CapabilitiesResponse>> {
    Ok(Json(CapabilitiesResponse {
        video_calls_enabled: state.video_calls_enabled,
    }))
}
