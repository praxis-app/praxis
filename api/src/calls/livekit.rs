use axum::http::StatusCode;
use entity::users;
use livekit_api::{
    access_token::{AccessToken, TokenVerifier, VideoGrants},
    services::{room::RoomClient, ServiceError, TwirpError, TwirpErrorCode},
    webhooks::WebhookReceiver,
};
use std::env;
use tokio::time;

use crate::common::{ApiError, AppResult};

const TOKEN_TTL_MINUTES: i64 = 30;
const LEAVE_PARTICIPANT_SETTLE_MILLIS: u64 = 500;

#[derive(Clone, Debug)]
pub struct LiveKitConfig {
    pub(super) url: String,
    api_url: String,
    api_key: String,
    api_secret: String,
}

impl LiveKitConfig {
    pub(crate) fn from_env() -> Option<Self> {
        if video_calls_disabled() {
            return None;
        }

        let url = livekit_url_from_env()?;
        let api_url =
            livekit_api_url_from_env().unwrap_or_else(|| livekit_api_url(&url));
        let api_key = env::var("LIVEKIT_API_KEY").ok()?;
        let api_secret = env::var("LIVEKIT_API_SECRET").ok()?;

        if url.trim().is_empty()
            || api_key.trim().is_empty()
            || api_secret.trim().is_empty()
        {
            return None;
        }

        Some(Self {
            api_url,
            url,
            api_key,
            api_secret,
        })
    }

    pub(super) fn webhook_receiver(&self) -> WebhookReceiver {
        WebhookReceiver::new(TokenVerifier::with_api_key(
            &self.api_key,
            &self.api_secret,
        ))
    }
}

fn video_calls_disabled() -> bool {
    env::var("VIDEO_CALLS_ENABLED")
        .map(|value| !value.eq_ignore_ascii_case("true"))
        .unwrap_or(true)
}

pub(super) async fn ensure_livekit_available(
    livekit: &LiveKitConfig,
) -> AppResult<()> {
    RoomClient::with_api_key(
        &livekit.api_url,
        &livekit.api_key,
        &livekit.api_secret,
    )
    .list_rooms(vec!["praxis-live-health-check".to_owned()])
    .await
    .map(|_| ())
    .map_err(livekit_unavailable)
}

pub(super) async fn livekit_room_participant_count(
    livekit: &LiveKitConfig,
    room_name: &str,
) -> AppResult<usize> {
    let participants = RoomClient::with_api_key(
        &livekit.api_url,
        &livekit.api_key,
        &livekit.api_secret,
    )
    .list_participants(room_name)
    .await;

    match participants {
        Ok(participants) => Ok(participants.len()),
        Err(error) if is_livekit_not_found(&error) => Ok(0),
        Err(error) => Err(internal_error(error)),
    }
}

pub(super) async fn settled_livekit_room_participant_count(
    livekit: &LiveKitConfig,
    room_name: &str,
) -> AppResult<usize> {
    let count = livekit_room_participant_count(livekit, room_name).await?;

    if count == 0 {
        return Ok(0);
    }

    time::sleep(std::time::Duration::from_millis(
        LEAVE_PARTICIPANT_SETTLE_MILLIS,
    ))
    .await;

    livekit_room_participant_count(livekit, room_name).await
}

pub(super) fn create_livekit_token(
    livekit: &LiveKitConfig,
    room_name: &str,
    user: &users::Model,
) -> AppResult<String> {
    let name = user
        .display_name
        .clone()
        .unwrap_or_else(|| user.name.clone());

    let metadata = serde_json::json!({
        "userId": user.id,
        "name": user.name,
        "displayName": user.display_name,
    })
    .to_string();

    AccessToken::with_api_key(&livekit.api_key, &livekit.api_secret)
        .with_identity(&user.id.to_string())
        .with_name(&name)
        .with_metadata(&metadata)
        .with_ttl(std::time::Duration::from_secs(
            (TOKEN_TTL_MINUTES * 60) as u64,
        ))
        .with_grants(VideoGrants {
            room: room_name.to_owned(),
            room_join: true,
            can_subscribe: true,
            can_publish: true,
            can_publish_data: false,
            ..Default::default()
        })
        .to_jwt()
        .map_err(internal_error)
}

fn livekit_url_from_env() -> Option<String> {
    if let Ok(url) = env::var("LIVEKIT_URL") {
        if !url.trim().is_empty() {
            return Some(url);
        }
    }

    let host = env::var("LIVEKIT_HOST").ok()?;
    let port = env::var("LIVEKIT_PORT").ok()?;

    if host.trim().is_empty() || port.trim().is_empty() {
        return None;
    }

    Some(format!("ws://{host}:{port}"))
}

fn livekit_api_url_from_env() -> Option<String> {
    env::var("LIVEKIT_API_URL")
        .ok()
        .filter(|url| !url.trim().is_empty())
}

fn livekit_api_url(livekit_url: &str) -> String {
    livekit_url
        .strip_prefix("wss://")
        .map(|host| format!("https://{host}"))
        .or_else(|| {
            livekit_url
                .strip_prefix("ws://")
                .map(|host| format!("http://{host}"))
        })
        .unwrap_or_else(|| livekit_url.to_owned())
}

fn is_livekit_not_found(error: &ServiceError) -> bool {
    matches!(
        error,
        ServiceError::Twirp(TwirpError::Twirp(code))
            if code.code == TwirpErrorCode::NOT_FOUND
    )
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("LiveKit request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}

fn livekit_unavailable(error: impl std::fmt::Display) -> ApiError {
    tracing::warn!("LiveKit is unavailable: {error}");
    ApiError::new(StatusCode::SERVICE_UNAVAILABLE, "LiveKit is unavailable.")
}
