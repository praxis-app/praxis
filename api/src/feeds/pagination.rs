use axum::http::StatusCode;
use sea_orm::prelude::Uuid;

use super::{
    service,
    types::{FeedItem, FeedQuery, FeedResponse},
};
use crate::common::{
    pagination::{PaginationCursor, PaginationDirection},
    request::parse_uuid,
    ApiError, AppResult,
};

pub(super) fn parse_cursor(
    query: &FeedQuery,
) -> AppResult<(Option<PaginationCursor>, PaginationDirection)> {
    match (&query.before, &query.after) {
        (Some(_), Some(_)) => Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Use either before or after, not both.",
        )),
        (Some(cursor), None) => Ok((
            Some(PaginationCursor::parse(cursor)?),
            PaginationDirection::Older,
        )),
        (None, Some(cursor)) => Ok((
            Some(PaginationCursor::parse(cursor)?),
            PaginationDirection::Newer,
        )),
        (None, None) => Ok((None, PaginationDirection::Older)),
    }
}

pub(super) fn parse_around(query: &FeedQuery) -> AppResult<Option<Uuid>> {
    let Some(around) =
        query.around.as_deref().filter(|value| !value.is_empty())
    else {
        return Ok(None);
    };
    if query.before.is_some() || query.after.is_some() {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Use around on its own, without before or after.",
        ));
    }

    Ok(Some(parse_uuid(around, "around")?))
}

pub(super) fn around_feed_response(
    feed: Vec<FeedItem>,
    has_more: bool,
    has_more_newer: bool,
) -> FeedResponse {
    FeedResponse {
        start_cursor: feed.first().and_then(item_cursor),
        next_cursor: feed.last().and_then(item_cursor),
        feed,
        has_more,
        has_more_newer,
    }
}

pub(super) fn feed_response(
    mut feed: Vec<FeedItem>,
    limit: u64,
    direction: PaginationDirection,
    has_cursor: bool,
) -> FeedResponse {
    let has_overflow = feed.len() > limit as usize;
    if has_overflow {
        feed.pop();
    }
    if direction == PaginationDirection::Newer {
        feed.reverse();
    }
    let start_cursor = feed.first().and_then(item_cursor);
    let next_cursor = feed.last().and_then(item_cursor);

    let (has_more, has_more_newer) = match direction {
        PaginationDirection::Older => (has_overflow, has_cursor),
        PaginationDirection::Newer => (true, has_overflow),
    };

    FeedResponse {
        feed,
        start_cursor,
        next_cursor,
        has_more,
        has_more_newer,
    }
}

fn item_cursor(item: &FeedItem) -> Option<String> {
    Some(item_pagination_cursor(item)?.encode())
}

pub(super) fn item_pagination_cursor(
    item: &FeedItem,
) -> Option<PaginationCursor> {
    Some(PaginationCursor {
        created_at: chrono::DateTime::parse_from_rfc3339(service::created_at(
            item,
        ))
        .ok()?,
        id: Uuid::parse_str(service::id_string(item)).ok()?,
    })
}
