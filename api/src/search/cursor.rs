use axum::http::StatusCode;
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use chrono::{DateTime, FixedOffset};
use ring::{digest, hmac};
use sea_orm::prelude::Uuid;

use super::types::SearchKind;
use crate::common::{ApiError, AppResult};

const CURSOR_VERSION: &str = "v1";
const CURSOR_KEY_INFO: &[u8] = b"search-cursor/v1";
const CURSOR_FIELDS: usize = 9;

#[derive(Clone)]
pub(super) struct CursorKey(hmac::Key);

impl CursorKey {
    pub(super) fn derive(jwt_secret: &str) -> Self {
        let root = hmac::Key::new(hmac::HMAC_SHA256, jwt_secret.as_bytes());
        let derived = hmac::sign(&root, CURSOR_KEY_INFO);
        Self(hmac::Key::new(hmac::HMAC_SHA256, derived.as_ref()))
    }
}

impl std::fmt::Debug for CursorKey {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter.write_str("CursorKey(..)")
    }
}

#[derive(Clone, Copy, Debug)]
pub(super) struct SearchCursor {
    pub(super) window_start: DateTime<FixedOffset>,
    pub(super) window_end: DateTime<FixedOffset>,
    pub(super) created_at: DateTime<FixedOffset>,
    pub(super) kind: SearchKind,
    pub(super) id: Uuid,
}

pub(super) struct CursorBinding<'a> {
    pub(super) user_id: Uuid,
    pub(super) server_id: Uuid,
    pub(super) query_digest: &'a str,
    pub(super) filter_digest: &'a str,
}

pub(super) fn digest(value: &str) -> String {
    URL_SAFE_NO_PAD.encode(digest::digest(&digest::SHA256, value.as_bytes()))
}

pub(super) fn encode(
    key: &CursorKey,
    binding: &CursorBinding<'_>,
    cursor: &SearchCursor,
) -> String {
    let payload = URL_SAFE_NO_PAD.encode(
        [
            cursor.window_start.to_rfc3339(),
            cursor.window_end.to_rfc3339(),
            cursor.created_at.to_rfc3339(),
            cursor.kind.as_str().to_owned(),
            cursor.id.to_string(),
            binding.user_id.to_string(),
            binding.server_id.to_string(),
            binding.query_digest.to_owned(),
            binding.filter_digest.to_owned(),
        ]
        .join("|"),
    );
    let signature =
        URL_SAFE_NO_PAD.encode(hmac::sign(&key.0, payload.as_bytes()));

    format!("{CURSOR_VERSION}.{payload}.{signature}")
}

pub(super) fn decode(
    key: &CursorKey,
    binding: &CursorBinding<'_>,
    token: &str,
) -> AppResult<SearchCursor> {
    let mut parts = token.split('.');
    let (Some(version), Some(payload), Some(signature), None) =
        (parts.next(), parts.next(), parts.next(), parts.next())
    else {
        return Err(invalid_cursor());
    };
    if version != CURSOR_VERSION {
        return Err(invalid_cursor());
    }

    let signature = URL_SAFE_NO_PAD
        .decode(signature)
        .map_err(|_| invalid_cursor())?;
    hmac::verify(&key.0, payload.as_bytes(), &signature)
        .map_err(|_| invalid_cursor())?;

    let decoded = URL_SAFE_NO_PAD
        .decode(payload)
        .map_err(|_| invalid_cursor())?;
    let decoded = String::from_utf8(decoded).map_err(|_| invalid_cursor())?;
    let fields: Vec<&str> = decoded.split('|').collect();
    if fields.len() != CURSOR_FIELDS {
        return Err(invalid_cursor());
    }

    if !matches_binding(&fields, binding) {
        return Err(invalid_cursor());
    }

    Ok(SearchCursor {
        window_start: parse_timestamp(fields[0])?,
        window_end: parse_timestamp(fields[1])?,
        created_at: parse_timestamp(fields[2])?,
        kind: SearchKind::parse(fields[3]).ok_or_else(invalid_cursor)?,
        id: Uuid::parse_str(fields[4]).map_err(|_| invalid_cursor())?,
    })
}

fn matches_binding(fields: &[&str], binding: &CursorBinding<'_>) -> bool {
    fields[5] == binding.user_id.to_string()
        && fields[6] == binding.server_id.to_string()
        && fields[7] == binding.query_digest
        && fields[8] == binding.filter_digest
}

fn parse_timestamp(value: &str) -> AppResult<DateTime<FixedOffset>> {
    DateTime::parse_from_rfc3339(value).map_err(|_| invalid_cursor())
}

fn invalid_cursor() -> ApiError {
    ApiError::new(StatusCode::BAD_REQUEST, "Invalid search cursor.")
}
