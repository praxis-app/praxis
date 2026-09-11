use chrono::{DateTime, FixedOffset};
use sea_orm::prelude::Uuid;

use super::types::{
    FeedItem, FeedMessageResponse, FeedPollResponse,
    FeedProposalForumReferenceResponse,
};
use crate::{
    calls,
    common::{
        pagination::{PaginationCursor, PaginationDirection},
        ApiError, AppResult,
    },
    forum, messages, polls,
};

// Return up to 25 older and 25 newer items beside the target
const AROUND_NEIGHBORS_PER_SIDE: u64 = 25;

pub(crate) async fn get_channel_feed(
    database: &sea_orm::DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    cursor: Option<PaginationCursor>,
    direction: PaginationDirection,
    limit: u64,
    user_id: Option<Uuid>,
) -> AppResult<Vec<FeedItem>> {
    let fetch_limit = limit.saturating_add(1);
    let messages = messages::get_channel_message_feed(
        database,
        server_id,
        channel_id,
        cursor,
        direction,
        fetch_limit,
    )
    .await?;
    let polls = polls::service::get_inline_polls(
        database,
        server_id,
        channel_id,
        cursor,
        direction,
        fetch_limit,
        user_id,
    )
    .await?;
    let calls = calls::service::get_channel_call_artifacts(
        database,
        server_id,
        channel_id,
        cursor,
        direction,
        fetch_limit,
    )
    .await?;
    let proposal_references =
        forum::proposal_moves::list_proposal_forum_references(
            database,
            channel_id,
            cursor,
            direction,
            fetch_limit,
        )
        .await?;

    let mut feed = messages
        .into_iter()
        .map(FeedMessageResponse::new)
        .map(FeedItem::Message)
        .collect();
    append_polls(&mut feed, polls);
    for reference in proposal_references {
        feed.push(FeedItem::ProposalForumReference(
            FeedProposalForumReferenceResponse::new(reference),
        ));
    }
    for call in calls {
        feed.push(FeedItem::Call(call));
    }

    Ok(sort_feed(feed, direction, fetch_limit))
}

pub(crate) async fn get_channel_feed_around(
    database: &sea_orm::DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    target_id: Uuid,
    user_id: Option<Uuid>,
) -> AppResult<(Vec<FeedItem>, bool, bool)> {
    let target = load_channel_feed_target(
        database, server_id, channel_id, target_id, user_id,
    )
    .await?;
    let anchor = super::pagination::item_pagination_cursor(&target)
        .ok_or_else(target_unavailable)?;

    let mut older = get_channel_feed(
        database,
        server_id,
        channel_id,
        Some(anchor),
        PaginationDirection::Older,
        AROUND_NEIGHBORS_PER_SIDE,
        user_id,
    )
    .await?;
    let has_more = older.len() > AROUND_NEIGHBORS_PER_SIDE as usize;
    older.truncate(AROUND_NEIGHBORS_PER_SIDE as usize);

    let mut newer = get_channel_feed(
        database,
        server_id,
        channel_id,
        Some(anchor),
        PaginationDirection::Newer,
        AROUND_NEIGHBORS_PER_SIDE,
        user_id,
    )
    .await?;
    let has_more_newer = newer.len() > AROUND_NEIGHBORS_PER_SIDE as usize;
    newer.truncate(AROUND_NEIGHBORS_PER_SIDE as usize);
    newer.reverse();

    let mut feed = newer;
    feed.push(target);
    feed.extend(older);

    Ok((feed, has_more, has_more_newer))
}

pub(crate) async fn get_call_feed_around(
    database: &sea_orm::DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    call_id: Uuid,
    target_id: Uuid,
) -> AppResult<(Vec<FeedItem>, bool, bool)> {
    let target = messages::get_call_message_target(
        database, server_id, channel_id, call_id, target_id,
    )
    .await?
    .map(FeedMessageResponse::new)
    .map(FeedItem::Message)
    .ok_or_else(target_unavailable)?;
    let anchor = super::pagination::item_pagination_cursor(&target)
        .ok_or_else(target_unavailable)?;

    let mut older = get_call_feed(
        database,
        server_id,
        channel_id,
        call_id,
        Some(anchor),
        PaginationDirection::Older,
        AROUND_NEIGHBORS_PER_SIDE,
    )
    .await?;
    let has_more = older.len() > AROUND_NEIGHBORS_PER_SIDE as usize;
    older.truncate(AROUND_NEIGHBORS_PER_SIDE as usize);

    let mut newer = get_call_feed(
        database,
        server_id,
        channel_id,
        call_id,
        Some(anchor),
        PaginationDirection::Newer,
        AROUND_NEIGHBORS_PER_SIDE,
    )
    .await?;
    let has_more_newer = newer.len() > AROUND_NEIGHBORS_PER_SIDE as usize;
    newer.truncate(AROUND_NEIGHBORS_PER_SIDE as usize);
    newer.reverse();

    let mut feed = newer;
    feed.push(target);
    feed.extend(older);

    Ok((feed, has_more, has_more_newer))
}

async fn load_channel_feed_target(
    database: &sea_orm::DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    target_id: Uuid,
    user_id: Option<Uuid>,
) -> AppResult<FeedItem> {
    if let Some(message) = messages::get_channel_message_target(
        database, server_id, channel_id, target_id,
    )
    .await?
    {
        return Ok(FeedItem::Message(FeedMessageResponse::new(message)));
    }

    let poll = polls::service::get_inline_poll_target(
        database, server_id, channel_id, target_id, user_id,
    )
    .await?
    .ok_or_else(target_unavailable)?;

    Ok(FeedItem::Poll(Box::new(FeedPollResponse::new(poll))))
}

fn target_unavailable() -> ApiError {
    ApiError::new(axum::http::StatusCode::NOT_FOUND, "Not found.")
}

pub(crate) async fn get_call_feed(
    database: &sea_orm::DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    call_id: Uuid,
    cursor: Option<PaginationCursor>,
    direction: PaginationDirection,
    limit: u64,
) -> AppResult<Vec<FeedItem>> {
    let fetch_limit = limit.saturating_add(1);
    let messages = messages::get_call_message_feed(
        database,
        server_id,
        channel_id,
        call_id,
        cursor,
        direction,
        fetch_limit,
    )
    .await?;

    Ok(messages
        .into_iter()
        .map(FeedMessageResponse::new)
        .map(FeedItem::Message)
        .collect())
}

fn append_polls(
    feed: &mut Vec<FeedItem>,
    polls: Vec<polls::types::PollResponse>,
) {
    for poll in polls {
        feed.push(FeedItem::Poll(Box::new(FeedPollResponse::new(poll))));
    }
}

fn sort_feed(
    mut feed: Vec<FeedItem>,
    direction: PaginationDirection,
    limit: u64,
) -> Vec<FeedItem> {
    feed.sort_by(|left, right| match direction {
        PaginationDirection::Older => timestamp_millis(right)
            .cmp(&timestamp_millis(left))
            .then_with(|| id_string(right).cmp(id_string(left))),
        PaginationDirection::Newer => timestamp_millis(left)
            .cmp(&timestamp_millis(right))
            .then_with(|| id_string(left).cmp(id_string(right))),
    });

    feed.into_iter().take(limit as usize).collect()
}

fn timestamp_millis(item: &FeedItem) -> i64 {
    DateTime::<FixedOffset>::parse_from_rfc3339(created_at(item))
        .map(|timestamp| timestamp.timestamp_millis())
        .unwrap_or_default()
}

pub(super) fn created_at(item: &FeedItem) -> &str {
    match item {
        FeedItem::Message(message) => &message.message.created_at,
        FeedItem::Poll(poll) => &poll.poll.created_at,
        FeedItem::ProposalForumReference(reference) => {
            &reference.reference.created_at
        }
        FeedItem::Call(call) => &call.created_at,
    }
}

pub(super) fn id_string(item: &FeedItem) -> &str {
    match item {
        FeedItem::Message(message) => &message.message.id,
        FeedItem::Poll(poll) => &poll.poll.id,
        FeedItem::ProposalForumReference(reference) => &reference.reference.id,
        FeedItem::Call(call) => &call.id,
    }
}
