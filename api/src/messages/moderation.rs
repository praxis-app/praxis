use axum::http::StatusCode;
use chrono::Utc;
use entity::{
    enums::{ModerationAction, ModerationTargetKind},
    forum_posts, message_images, messages,
};
use sea_orm::{
    prelude::Uuid,
    sea_query::{Expr, Query},
    ColumnTrait, ConnectionTrait, DatabaseConnection, EntityTrait, QueryFilter,
    QuerySelect, TransactionTrait,
};
use std::path::Path;

use super::{
    replies::get_reply_summaries,
    service::{
        broadcast_to_call_members, broadcast_to_channel_members,
        internal_consistency_error, internal_error, shape_messages,
    },
    types::{serialize_timestamp, MessageResponse, RemoveMessageRequest},
};
use crate::{
    calls, channels,
    common::{storage::remove_stored_files, ApiError, AppResult},
    moderation::{self, ModerationRecord},
    pub_sub::{PubSubService, PubSubTopic},
};

pub(super) struct RemovedMessage {
    pub(super) message: MessageResponse,
    thread: Option<ThreadSummary>,
}

struct ThreadSummary {
    root_id: Uuid,
    reply_count: usize,
    latest_reply_at: Option<String>,
}

pub(crate) async fn erase_messages<C>(
    database: &C,
    message_ids: &[Uuid],
) -> AppResult<Vec<String>>
where
    C: ConnectionTrait,
{
    if message_ids.is_empty() {
        return Ok(vec![]);
    }

    let now = Utc::now().fixed_offset();
    messages::Entity::update_many()
        .col_expr(messages::Column::Ciphertext, Expr::value(None::<Vec<u8>>))
        .col_expr(messages::Column::Iv, Expr::value(None::<Vec<u8>>))
        .col_expr(messages::Column::Tag, Expr::value(None::<Vec<u8>>))
        .col_expr(messages::Column::KeyId, Expr::value(None::<Uuid>))
        .col_expr(messages::Column::ModeratedAt, Expr::value(now))
        .col_expr(messages::Column::UpdatedAt, Expr::value(now))
        .filter(messages::Column::Id.is_in(message_ids.iter().copied()))
        .exec(database)
        .await
        .map_err(internal_error)?;

    let images = message_images::Entity::find()
        .filter(
            message_images::Column::MessageId
                .is_in(message_ids.iter().copied()),
        )
        .all(database)
        .await
        .map_err(internal_error)?;
    message_images::Entity::delete_many()
        .filter(
            message_images::Column::MessageId
                .is_in(message_ids.iter().copied()),
        )
        .exec(database)
        .await
        .map_err(internal_error)?;

    Ok(images
        .into_iter()
        .filter_map(|image| image.storage_key)
        .collect())
}

pub(crate) async fn erase_user_messages<C>(
    database: &C,
    user_id: Uuid,
) -> AppResult<Vec<String>>
where
    C: ConnectionTrait,
{
    let proposal_post_roots = Query::select()
        .column(forum_posts::Column::RootMessageId)
        .from(forum_posts::Entity)
        .and_where(forum_posts::Column::PollId.is_not_null())
        .to_owned();
    let message_ids = messages::Entity::find()
        .select_only()
        .column(messages::Column::Id)
        .filter(messages::Column::UserId.eq(user_id))
        .filter(messages::Column::BotId.is_null())
        .filter(messages::Column::ModeratedAt.is_null())
        .filter(messages::Column::Id.not_in_subquery(proposal_post_roots))
        .into_tuple::<Uuid>()
        .all(database)
        .await
        .map_err(internal_error)?;

    erase_messages(database, &message_ids).await
}

pub(super) async fn remove_message(
    database: &DatabaseConnection,
    upload_root: &Path,
    request: &RemoveMessageRequest,
) -> AppResult<RemovedMessage> {
    moderation::can_moderate_content(
        database,
        request.actor_user_id,
        request.server_id,
    )
    .await?;
    let reason =
        moderation::normalize_reason(request.reason.as_deref(), false)?;
    channels::get_channel(database, request.server_id, request.channel_id)
        .await?;
    if let Some(call_id) = request.call_id {
        calls::service::get_call(
            database,
            request.server_id,
            request.channel_id,
            call_id,
        )
        .await?;
    }

    let transaction = database.begin().await.map_err(internal_error)?;
    let message = messages::Entity::find_by_id(request.message_id)
        .filter(messages::Column::ChannelId.eq(request.channel_id))
        .lock_exclusive()
        .one(&transaction)
        .await
        .map_err(internal_error)?
        .ok_or_else(message_not_found)?;
    ensure_removable_message(&transaction, &message, request.call_id).await?;

    let storage_keys = if message.moderated_at.is_none() {
        let storage_keys = erase_messages(&transaction, &[message.id]).await?;
        moderation::record_action(
            &transaction,
            ModerationRecord {
                actor_user_id: request.actor_user_id,
                action: ModerationAction::RemoveMessage,
                target_kind: ModerationTargetKind::Message,
                target_id: message.id,
                server_id: Some(request.server_id),
                reason,
            },
        )
        .await?;
        storage_keys
    } else {
        vec![]
    };
    transaction.commit().await.map_err(internal_error)?;
    remove_stored_files(upload_root, &storage_keys).await;

    let thread_root_id = message.thread_root_id;
    let message = reload_message(database, message.id).await?;
    let thread = match thread_root_id {
        Some(root_id) => {
            let summary = get_reply_summaries(database, vec![root_id])
                .await?
                .remove(&root_id);
            Some(ThreadSummary {
                root_id,
                reply_count: summary.map(|(count, _)| count).unwrap_or(0),
                latest_reply_at: summary
                    .map(|(_, latest)| serialize_timestamp(latest)),
            })
        }
        None => None,
    };

    Ok(RemovedMessage { message, thread })
}

pub(super) async fn broadcast_removed_message(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    request: &RemoveMessageRequest,
    removed: &RemovedMessage,
) -> AppResult<()> {
    if let Some(call_id) = request.call_id {
        return broadcast_to_call_members(
            database,
            pub_sub_service,
            request.server_id,
            request.channel_id,
            call_id,
            request.actor_user_id,
            serde_json::json!({
                "type": "message",
                "action": "removed",
                "message": removed.message,
            }),
        )
        .await;
    }

    let Some(thread) = removed.thread.as_ref() else {
        return broadcast_to_channel_members(
            database,
            pub_sub_service,
            request.server_id,
            request.channel_id,
            request.actor_user_id,
            serde_json::json!({
                "type": "message",
                "action": "removed",
                "message": removed.message,
            }),
        )
        .await;
    };

    let body = serde_json::json!({
        "type": "threadReply",
        "action": "removed",
        "rootKind": "message",
        "rootId": thread.root_id,
        "rootMessageId": thread.root_id,
        "reply": removed.message,
        "replyCount": thread.reply_count,
        "latestReplyAt": thread.latest_reply_at,
    });
    let members =
        channels::get_channel_member_user_ids(database, request.channel_id)
            .await?;
    for member_id in members {
        let topic = PubSubTopic::new_message(
            request.server_id,
            request.channel_id,
            member_id,
        )
        .to_string();
        pub_sub_service.publish(&topic, body.clone()).await?;
    }
    Ok(())
}

async fn ensure_removable_message<C>(
    database: &C,
    message: &messages::Model,
    call_id: Option<Uuid>,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    let in_scope = message.bot_id.is_none()
        && message.thread_poll_id.is_none()
        && match call_id {
            Some(call_id) => {
                message.call_id == Some(call_id)
                    && message.thread_root_id.is_none()
            }
            None => message.call_id.is_none(),
        };
    if !in_scope {
        return Err(message_not_found());
    }

    let forum_root_id = message.thread_root_id.unwrap_or(message.id);
    let is_forum_content = forum_posts::Entity::find()
        .filter(forum_posts::Column::RootMessageId.eq(forum_root_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .is_some();
    if is_forum_content {
        return Err(message_not_found());
    }

    Ok(())
}

async fn reload_message(
    database: &DatabaseConnection,
    message_id: Uuid,
) -> AppResult<MessageResponse> {
    let message = messages::Entity::find_by_id(message_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(message_not_found)?;
    shape_messages(database, vec![message])
        .await?
        .into_iter()
        .next()
        .ok_or_else(|| internal_consistency_error("Message not found."))
}

fn message_not_found() -> ApiError {
    ApiError::new(StatusCode::NOT_FOUND, "Message not found.")
}
