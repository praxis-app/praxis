use axum::http::StatusCode;
use entity::{forum_posts, messages, users};
use sea_orm::{
    prelude::Uuid, sea_query::Expr, ColumnTrait, DatabaseConnection,
    EntityTrait, FromQueryResult, QueryFilter, QueryOrder, QuerySelect,
};
use std::collections::HashMap;

use super::types::{ForumPostResponse, ForumPostSummaryResponse};
use crate::{
    channels,
    common::{encryption, ApiError, AppResult},
    messages::{self as messages_service, types::MessageUser},
    polls::service as polls_service,
    users as users_service,
};

#[derive(FromQueryResult)]
struct ReplyCount {
    thread_root_id: Option<Uuid>,
    reply_count: i64,
}

pub(super) async fn shape_forum_post(
    database: &DatabaseConnection,
    post: forum_posts::Model,
    user_id: Option<Uuid>,
) -> AppResult<ForumPostResponse> {
    let replies = messages::Entity::find()
        .filter(messages::Column::ThreadRootId.eq(post.root_message_id))
        .order_by_asc(messages::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;

    shape_forum_post_with_replies(database, post, replies, user_id).await
}

pub(super) async fn shape_forum_post_with_replies(
    database: &DatabaseConnection,
    post: forum_posts::Model,
    replies: Vec<messages::Model>,
    user_id: Option<Uuid>,
) -> AppResult<ForumPostResponse> {
    let root = messages::Entity::find_by_id(post.root_message_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            internal_consistency_error("Post root message not found.")
        })?;
    let mut records = Vec::with_capacity(replies.len() + 1);
    records.push(root);
    records.extend(replies);
    let mut shaped_messages =
        messages_service::shape_messages(database, records)
            .await?
            .into_iter();
    let root = shaped_messages.next().ok_or_else(|| {
        internal_consistency_error("Post root message not found.")
    })?;
    let proposal = match post.poll_id {
        Some(poll_id) => Some(
            polls_service::get_poll_response(
                database,
                Uuid::nil(),
                post.channel_id,
                poll_id,
                user_id,
            )
            .await?,
        ),
        None => None,
    };
    let summary = shape_post_summaries(database, vec![post])
        .await?
        .into_iter()
        .next()
        .ok_or_else(|| internal_consistency_error("Post not found."))?;

    Ok(ForumPostResponse {
        post: summary,
        body: root.body.unwrap_or_default(),
        replies: shaped_messages.collect(),
        proposal,
    })
}

pub(super) async fn shape_post_summaries(
    database: &DatabaseConnection,
    posts: Vec<forum_posts::Model>,
) -> AppResult<Vec<ForumPostSummaryResponse>> {
    if posts.is_empty() {
        return Ok(vec![]);
    }

    let user_ids = posts.iter().map(|post| post.user_id).collect::<Vec<_>>();
    let users = users::Entity::find()
        .filter(users::Column::Id.is_in(user_ids.iter().copied()))
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .map(|user| (user.id, user))
        .collect::<HashMap<_, _>>();
    let profile_pictures =
        users_service::get_user_profile_pictures_map(database, &user_ids)
            .await?;
    let key_map = channels::get_unwrapped_channel_key_map(
        database,
        posts.iter().map(|post| post.key_id).collect(),
    )
    .await?;
    let root_ids = posts
        .iter()
        .map(|post| post.root_message_id)
        .collect::<Vec<_>>();
    let reply_counts = messages::Entity::find()
        .select_only()
        .column(messages::Column::ThreadRootId)
        .column_as(Expr::col(messages::Column::Id).count(), "reply_count")
        .filter(messages::Column::ThreadRootId.is_in(root_ids))
        .group_by(messages::Column::ThreadRootId)
        .into_model::<ReplyCount>()
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .filter_map(|count| {
            count
                .thread_root_id
                .map(|root_id| (root_id, count.reply_count as usize))
        })
        .collect::<HashMap<_, _>>();

    posts
        .into_iter()
        .map(|post| {
            let user = users.get(&post.user_id).ok_or_else(|| {
                internal_consistency_error("Post author not found.")
            })?;
            let key = key_map.get(&post.key_id).ok_or_else(|| {
                internal_consistency_error("Post encryption key not found.")
            })?;
            let title = match (&post.ciphertext, &post.iv, &post.tag) {
                (Some(ciphertext), Some(iv), Some(tag)) => {
                    encryption::decrypt_text(ciphertext, iv, tag, key)?
                }
                _ => String::new(),
            };
            Ok(ForumPostSummaryResponse {
                id: post.id.to_string(),
                title,
                root_message_id: post.root_message_id.to_string(),
                poll_id: post.poll_id.map(|id| id.to_string()),
                status: post.status.to_string(),
                user: MessageUser {
                    id: user.id.to_string(),
                    name: user.name.clone(),
                    display_name: user.display_name.clone(),
                    profile_picture: profile_pictures.get(&user.id).cloned(),
                },
                reply_count: reply_counts
                    .get(&post.root_message_id)
                    .copied()
                    .unwrap_or_default(),
                latest_activity_at: post.latest_activity_at.to_rfc3339(),
                created_at: post.created_at.to_rfc3339(),
                updated_at: post.updated_at.to_rfc3339(),
            })
        })
        .collect()
}

fn internal_consistency_error(message: &'static str) -> ApiError {
    tracing::error!("forum data is inconsistent: {message}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("forum response shaping failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
