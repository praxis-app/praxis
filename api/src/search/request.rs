use axum::http::StatusCode;
use sea_orm::prelude::Uuid;

use super::{
    cursor,
    matching::{self, MAX_QUERY_CHARS, MIN_QUERY_CHARS},
    types::{SearchKind, SearchQuery},
};
use crate::common::{ApiError, AppResult};

const DEFAULT_PAGE_LIMIT: u64 = 25;
const MAX_PAGE_LIMIT: u64 = 50;

pub(super) struct SearchRequest {
    pub(super) needle: String,
    pub(super) query_digest: String,
    pub(super) filter_digest: String,
    pub(super) kinds: Vec<SearchKind>,
    pub(super) channel_filter: Option<Vec<Uuid>>,
    pub(super) limit: u64,
    pub(super) cursor_token: Option<String>,
}

pub(super) fn parse_request(query: SearchQuery) -> AppResult<SearchRequest> {
    let raw_query = query.q.unwrap_or_default();
    let needle = matching::normalize(&raw_query);
    let length = needle.chars().count();
    if !(MIN_QUERY_CHARS..=MAX_QUERY_CHARS).contains(&length) {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            format!(
                "A search query must be between {MIN_QUERY_CHARS} and \
                 {MAX_QUERY_CHARS} characters."
            ),
        ));
    }

    let kinds = match query.kind.as_deref().map(str::trim).filter(is_present) {
        Some(value) => {
            let mut kinds = Vec::new();
            for name in value.split(',').map(str::trim).filter(is_present) {
                let kind = SearchKind::parse(name).ok_or_else(|| {
                    ApiError::new(
                        StatusCode::BAD_REQUEST,
                        "Unknown search content kind.",
                    )
                })?;
                if !kinds.contains(&kind) {
                    kinds.push(kind);
                }
            }
            if kinds.is_empty() {
                return Err(ApiError::new(
                    StatusCode::BAD_REQUEST,
                    "Unknown search content kind.",
                ));
            }
            kinds
        }
        None => SearchKind::ALL.to_vec(),
    };

    let channel_filter = match query
        .channel_id
        .as_deref()
        .map(str::trim)
        .filter(is_present)
    {
        Some(value) => {
            let mut channel_ids = Vec::new();
            for id in value.split(',').map(str::trim).filter(is_present) {
                let channel_id = Uuid::parse_str(id).map_err(|_| {
                    ApiError::new(
                        StatusCode::BAD_REQUEST,
                        "channelId must be a UUID.",
                    )
                })?;
                if !channel_ids.contains(&channel_id) {
                    channel_ids.push(channel_id);
                }
            }
            if channel_ids.is_empty() {
                return Err(ApiError::new(
                    StatusCode::BAD_REQUEST,
                    "channelId must be a UUID.",
                ));
            }
            Some(channel_ids)
        }
        None => None,
    };

    let limit = match query.limit {
        Some(0) => {
            return Err(ApiError::new(
                StatusCode::BAD_REQUEST,
                "limit must be greater than zero.",
            ))
        }
        Some(limit) => limit.min(MAX_PAGE_LIMIT),
        None => DEFAULT_PAGE_LIMIT,
    };

    Ok(SearchRequest {
        query_digest: cursor::digest(&needle),
        filter_digest: cursor::digest(&filter_signature(
            &kinds,
            channel_filter.as_deref(),
        )),
        needle,
        kinds,
        channel_filter,
        limit,
        cursor_token: query.before.filter(|token| !token.is_empty()),
    })
}

fn filter_signature(
    kinds: &[SearchKind],
    channel_filter: Option<&[Uuid]>,
) -> String {
    let mut kinds: Vec<&str> = kinds.iter().map(|kind| kind.as_str()).collect();
    kinds.sort_unstable();
    let mut channels: Vec<String> = channel_filter
        .unwrap_or_default()
        .iter()
        .map(Uuid::to_string)
        .collect();
    channels.sort();

    format!("{}|{}", kinds.join(","), channels.join(","))
}

fn is_present(value: &&str) -> bool {
    !value.is_empty()
}
