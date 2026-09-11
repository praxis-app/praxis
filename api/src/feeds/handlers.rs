use axum::{
    extract::{Query, State},
    response::Json,
};
use sea_orm::DatabaseConnection;
use std::sync::Arc;

use super::{
    extractors::{CallFeedAccessContext, ChannelFeedAccessContext},
    pagination::{
        around_feed_response, feed_response, parse_around, parse_cursor,
    },
    service,
    types::{FeedQuery, FeedResponse},
};
use crate::{
    auth::HasJwtSecret, channels::extractors::HasDatabase, common::AppResult,
};

#[derive(Clone, Debug)]
pub(super) struct FeedsState {
    pub(super) database: DatabaseConnection,
    jwt_secret: Arc<str>,
}

impl FeedsState {
    pub(super) fn new(
        database: DatabaseConnection,
        jwt_secret: String,
    ) -> Self {
        Self {
            database,
            jwt_secret: Arc::<str>::from(jwt_secret),
        }
    }
}

impl HasJwtSecret for FeedsState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

impl HasDatabase for FeedsState {
    fn database(&self) -> &DatabaseConnection {
        &self.database
    }
}

// TODO: Split up into multiple handler fns - ensure they're dedicated to
// one purpose. Do the same for their respective routes / endpoints, with
// less overloaded functions or routes
pub(super) async fn get_channel_feed(
    State(feeds_state): State<FeedsState>,
    context: ChannelFeedAccessContext,
    Query(query): Query<FeedQuery>,
) -> AppResult<Json<FeedResponse>> {
    if let Some(target_id) = parse_around(&query)? {
        let (feed, has_more, has_more_newer) =
            service::get_channel_feed_around(
                &feeds_state.database,
                context.server_id,
                context.channel_id,
                target_id,
                context.user_id,
            )
            .await?;
        return Ok(Json(around_feed_response(feed, has_more, has_more_newer)));
    }

    let limit = query.limit.unwrap_or(50).min(100);
    let (cursor, direction) = parse_cursor(&query)?;
    let feed = service::get_channel_feed(
        &feeds_state.database,
        context.server_id,
        context.channel_id,
        cursor,
        direction,
        limit,
        context.user_id,
    )
    .await?;

    Ok(Json(feed_response(
        feed,
        limit,
        direction,
        cursor.is_some(),
    )))
}

pub(super) async fn get_call_feed(
    State(feeds_state): State<FeedsState>,
    context: CallFeedAccessContext,
    Query(query): Query<FeedQuery>,
) -> AppResult<Json<FeedResponse>> {
    if let Some(target_id) = parse_around(&query)? {
        let (feed, has_more, has_more_newer) = service::get_call_feed_around(
            &feeds_state.database,
            context.server_id,
            context.channel_id,
            context.call_id,
            target_id,
        )
        .await?;
        return Ok(Json(around_feed_response(feed, has_more, has_more_newer)));
    }

    let limit = query.limit.unwrap_or(50).min(100);
    let (cursor, direction) = parse_cursor(&query)?;
    let feed = service::get_call_feed(
        &feeds_state.database,
        context.server_id,
        context.channel_id,
        context.call_id,
        cursor,
        direction,
        limit,
    )
    .await?;

    Ok(Json(feed_response(
        feed,
        limit,
        direction,
        cursor.is_some(),
    )))
}
