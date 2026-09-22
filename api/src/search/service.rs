use axum::http::StatusCode;
use chrono::{Duration, Utc};
use entity::{channel_keys, channel_members, channels, servers};
use sea_orm::{
    prelude::{DateTimeWithTimeZone, Uuid},
    ColumnTrait, Condition, DatabaseConnection, EntityTrait, QueryFilter,
    QuerySelect,
};
use std::collections::{HashMap, HashSet};
use tokio::sync::OwnedSemaphorePermit;

use super::{
    cursor::{self, CursorBinding, SearchCursor},
    handlers::SearchState,
    request, results,
    scan::{self, Candidate},
    types::{SearchCoverage, SearchQuery, SearchResponse},
};
use crate::{
    common::{encryption, ApiError, AppResult},
    servers as servers_service, users as users_service,
};

const WINDOW_DAYS: i64 = 30;

pub(super) struct SearchScope {
    pub(super) server: servers::Model,
    pub(super) channels: HashMap<Uuid, channels::Model>,
    pub(super) scanned_channel_ids: Vec<Uuid>,
}

#[derive(Clone, Copy)]
pub(super) struct SearchWindow {
    start: DateTimeWithTimeZone,
    end: DateTimeWithTimeZone,
    ceiling: DateTimeWithTimeZone,
}

pub(super) async fn search(
    state: &SearchState,
    user_id: Uuid,
    server_id: Uuid,
    query: SearchQuery,
) -> AppResult<SearchResponse> {
    let request = request::parse_request(query)?;
    let database = &state.database;
    let scope = authorize(
        database,
        server_id,
        user_id,
        request.channel_filter.as_deref(),
    )
    .await?;

    let binding = CursorBinding {
        user_id,
        server_id,
        query_digest: &request.query_digest,
        filter_digest: &request.filter_digest,
    };
    let cursor = request
        .cursor_token
        .as_deref()
        .map(|token| cursor::decode(&state.cursor_key, &binding, token))
        .transpose()?;
    let window = resume_or_anchor_window(cursor);

    let permit = state.acquire_scan_permit()?;
    let scans =
        scan::collect_candidates(database, &scope, &request, window).await?;
    let coverage = SearchCoverage {
        mode: "boundedRecent",
        window_start: window.start.to_rfc3339(),
        window_end: window.end.to_rfc3339(),
        sources: scans.iter().map(|scan| scan.coverage.clone()).collect(),
    };

    let coverage_floor = scans
        .iter()
        .filter_map(|scan| scan.frontier)
        .max_by(|left, right| left.sort_key().cmp(&right.sort_key()));
    let candidates: Vec<Candidate> = scans
        .into_iter()
        .flat_map(|scan| scan.candidates.into_iter())
        .collect();
    let keys = get_readable_channel_keys(
        database,
        &scope.scanned_channel_ids,
        &candidates,
    )
    .await?;

    let needle = request.needle.clone();
    let matched = tokio::task::spawn_blocking(move || {
        let _permit_held_until_complete: OwnedSemaphorePermit = permit;
        results::evaluate_candidates(candidates, &keys, &needle)
    })
    .await
    .map_err(|error| {
        tracing::error!("search decrypt worker failed: {error}");
        internal_error()
    })?;

    let page =
        results::paginate(matched, cursor, coverage_floor, request.limit);
    let results = results::shape_results(database, &scope, page.items).await?;
    let next_cursor = page.next.map(|next| {
        cursor::encode(
            &state.cursor_key,
            &binding,
            &SearchCursor {
                window_start: window.start,
                window_end: window.end,
                created_at: next.0,
                kind: next.1,
                id: next.2,
            },
        )
    });

    Ok(SearchResponse {
        results,
        next_cursor,
        has_more: page.has_more,
        search_coverage: coverage,
    })
}

async fn authorize(
    database: &DatabaseConnection,
    server_id: Uuid,
    user_id: Uuid,
    channel_filter: Option<&[Uuid]>,
) -> AppResult<SearchScope> {
    if users_service::is_anonymous_user(database, user_id).await? {
        return Err(ApiError::new(
            StatusCode::FORBIDDEN,
            "Search requires a registered account.",
        ));
    }

    let server = servers_service::get_server(database, server_id)
        .await
        .map_err(|_| not_found())?;
    if !servers_service::is_server_member(database, server_id, user_id).await? {
        return Err(not_found());
    }

    let server_channels = channels::Entity::find()
        .filter(channels::Column::ServerId.eq(server_id))
        .all(database)
        .await
        .map_err(query_error)?;
    let readable_ids =
        readable_channel_ids(database, server_id, user_id, &server_channels)
            .await?;

    let channels: HashMap<Uuid, channels::Model> = server_channels
        .into_iter()
        .filter(|channel| readable_ids.contains(&channel.id))
        .map(|channel| (channel.id, channel))
        .collect();

    let scanned_channel_ids = match channel_filter {
        Some(filter) => {
            if filter.iter().any(|id| !channels.contains_key(id)) {
                return Err(not_found());
            }
            filter.to_vec()
        }
        None => channels.keys().copied().collect(),
    };

    Ok(SearchScope {
        server,
        channels,
        scanned_channel_ids,
    })
}

async fn readable_channel_ids(
    database: &DatabaseConnection,
    server_id: Uuid,
    user_id: Uuid,
    server_channels: &[channels::Model],
) -> AppResult<HashSet<Uuid>> {
    let server_channel_ids: Vec<Uuid> =
        server_channels.iter().map(|channel| channel.id).collect();

    if servers_service::default_server_id(database).await? == server_id {
        return Ok(server_channel_ids.into_iter().collect());
    }
    if server_channel_ids.is_empty() {
        return Ok(HashSet::new());
    }

    Ok(channel_members::Entity::find()
        .select_only()
        .column(channel_members::Column::ChannelId)
        .filter(channel_members::Column::UserId.eq(user_id))
        .filter(channel_members::Column::ChannelId.is_in(server_channel_ids))
        .into_tuple::<Uuid>()
        .all(database)
        .await
        .map_err(query_error)?
        .into_iter()
        .collect())
}

fn resume_or_anchor_window(cursor: Option<SearchCursor>) -> SearchWindow {
    cursor.map_or_else(SearchWindow::anchor_now, |cursor| SearchWindow {
        start: cursor.window_start,
        end: cursor.window_end,
        ceiling: cursor.created_at,
    })
}

impl SearchWindow {
    fn anchor_now() -> Self {
        let end = Utc::now().fixed_offset();
        Self {
            start: end - Duration::days(WINDOW_DAYS),
            end,
            ceiling: end,
        }
    }

    pub(super) fn condition<C: ColumnTrait>(&self, column: C) -> Condition {
        Condition::all()
            .add(column.gte(self.start))
            .add(column.lte(self.ceiling))
    }
}

async fn get_readable_channel_keys(
    database: &DatabaseConnection,
    channel_ids: &[Uuid],
    candidates: &[Candidate],
) -> AppResult<HashMap<Uuid, Vec<u8>>> {
    let mut key_ids: Vec<Uuid> = candidates
        .iter()
        .flat_map(|candidate| candidate.fields.iter().map(|field| field.key_id))
        .collect();
    key_ids.sort_unstable();
    key_ids.dedup();
    if key_ids.is_empty() || channel_ids.is_empty() {
        return Ok(HashMap::new());
    }

    let keys = channel_keys::Entity::find()
        .filter(channel_keys::Column::Id.is_in(key_ids))
        .filter(channel_keys::Column::ChannelId.is_in(channel_ids.to_vec()))
        .all(database)
        .await
        .map_err(query_error)?;

    Ok(keys.into_iter().filter_map(unwrapped_key).collect())
}

fn unwrapped_key(key: channel_keys::Model) -> Option<(Uuid, Vec<u8>)> {
    encryption::unwrap_channel_key(&key.wrapped_key, &key.iv, &key.tag)
        .ok()
        .map(|unwrapped| (key.id, unwrapped))
}

fn not_found() -> ApiError {
    ApiError::new(StatusCode::NOT_FOUND, "Not found.")
}

pub(super) fn query_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("search query failed: {error}");
    internal_error()
}

pub(super) fn internal_error() -> ApiError {
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
