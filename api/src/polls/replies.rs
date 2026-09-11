use axum::http::StatusCode;
use entity::{
    enums::{ChannelType, NotificationKind},
    forum_posts, messages, polls,
};
use sea_orm::{
    prelude::Uuid, ActiveModelTrait, ColumnTrait, ConnectionTrait,
    DatabaseConnection, EntityTrait, QueryFilter, QuerySelect, Set,
    TransactionTrait,
};
use std::path::Path;
use uuid::Uuid as NativeUuid;

use super::{
    service,
    types::{
        MovedPollThreadDestination, MovedPollThreadResponse, PollThreadResponse,
    },
};
use crate::{
    channels,
    common::{encryption, text::sanitize_text, ApiError, AppResult},
    messages::{
        self as message_service,
        types::{CreateReplyRequest, ListRepliesPage},
        CreatedReply,
    },
    notifications::WithNotifications,
    pub_sub::{PubSubService, PubSubTopic},
};

pub(super) struct ListRepliesContext {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) poll_id: Uuid,
    pub(super) current_user_id: Option<Uuid>,
}

pub(super) struct CreateReplyContext {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) poll_id: Uuid,
    pub(super) user_id: Uuid,
}

pub(super) enum PollThreadLookup {
    Thread(Box<PollThreadResponse>),
    Moved(MovedPollThreadResponse),
}

pub(super) async fn list_replies(
    database: &DatabaseConnection,
    context: ListRepliesContext,
    page: ListRepliesPage,
) -> AppResult<PollThreadLookup> {
    ensure_text_channel(database, context.server_id, context.channel_id)
        .await?;
    if let Some(moved_to) = load_moved_poll_thread_destination(
        database,
        context.channel_id,
        context.poll_id,
    )
    .await?
    {
        return Ok(PollThreadLookup::Moved(MovedPollThreadResponse {
            error: "Proposal moved to forum.",
            moved_to,
        }));
    }
    load_poll_thread_root(database, context.channel_id, context.poll_id, false)
        .await?;

    let replies_page = match page.around {
        Some(target_id) => {
            if page.before.is_some() || page.after.is_some() {
                return Err(ApiError::new(
                    StatusCode::BAD_REQUEST,
                    "Use around on its own, without before or after.",
                ));
            }
            let target = load_poll_reply(
                database,
                context.channel_id,
                context.poll_id,
                target_id,
            )
            .await?;
            message_service::paginate_replies_around(
                database,
                || poll_replies_query(context.channel_id, context.poll_id),
                target,
            )
            .await?
        }
        None => {
            message_service::paginate_replies(
                database,
                poll_replies_query(context.channel_id, context.poll_id),
                page.before.as_deref(),
                page.after.as_deref(),
                page.limit,
            )
            .await?
        }
    };

    let replies =
        message_service::shape_messages(database, replies_page.replies).await?;
    let root = service::get_poll_response(
        database,
        context.server_id,
        context.channel_id,
        context.poll_id,
        context.current_user_id,
    )
    .await?;

    Ok(PollThreadLookup::Thread(Box::new(PollThreadResponse {
        root,
        replies,
        start_cursor: replies_page.start_cursor,
        next_cursor: replies_page.next_cursor,
        has_more: replies_page.has_more,
        has_more_newer: replies_page.has_more_newer,
    })))
}

async fn load_poll_reply(
    database: &DatabaseConnection,
    channel_id: Uuid,
    poll_id: Uuid,
    reply_id: Uuid,
) -> AppResult<messages::Model> {
    messages::Entity::find_by_id(reply_id)
        .filter(messages::Column::ChannelId.eq(channel_id))
        .filter(messages::Column::ThreadPollId.eq(poll_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(reply_unavailable)
}

fn poll_replies_query(
    channel_id: Uuid,
    poll_id: Uuid,
) -> sea_orm::Select<messages::Entity> {
    messages::Entity::find()
        .filter(messages::Column::ChannelId.eq(channel_id))
        .filter(messages::Column::ThreadPollId.eq(poll_id))
}

fn reply_unavailable() -> ApiError {
    ApiError::new(StatusCode::NOT_FOUND, "Not found.")
}

pub(super) async fn create_reply(
    database: &DatabaseConnection,
    upload_root: &Path,
    context: CreateReplyContext,
    request: CreateReplyRequest,
    images: Vec<Vec<u8>>,
) -> AppResult<WithNotifications<CreatedReply>> {
    ensure_text_channel(database, context.server_id, context.channel_id)
        .await?;
    message_service::validate_message_content(
        request.body.as_deref(),
        images.len(),
    )?;
    let body = request
        .body
        .map(|value| sanitize_text(&value))
        .filter(|value| !value.is_empty());
    let encrypted = match body.as_deref() {
        Some(body) => {
            let (key, unwrapped_key) = channels::get_unwrapped_channel_key(
                database,
                context.channel_id,
            )
            .await?;
            Some((key.id, encryption::encrypt_text(body, &unwrapped_key)?))
        }
        None => None,
    };

    let transaction = database.begin().await.map_err(internal_error)?;
    load_poll_thread_root(
        &transaction,
        context.channel_id,
        context.poll_id,
        true,
    )
    .await?;
    if let Some(parent_message_id) = request.parent_message_id {
        validate_reply_parent(
            &transaction,
            context.channel_id,
            context.poll_id,
            parent_message_id,
        )
        .await?;
    }
    let reply = messages::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        channel_id: Set(context.channel_id),
        user_id: Set(context.user_id),
        key_id: Set(encrypted.as_ref().map(|(key_id, _)| *key_id)),
        ciphertext: Set(encrypted
            .as_ref()
            .map(|(_, value)| value.ciphertext.clone())),
        iv: Set(encrypted.as_ref().map(|(_, value)| value.iv.clone())),
        tag: Set(encrypted.as_ref().map(|(_, value)| value.tag.clone())),
        thread_poll_id: Set(Some(context.poll_id)),
        parent_message_id: Set(request.parent_message_id),
        ..Default::default()
    }
    .insert(&transaction)
    .await
    .map_err(internal_error)?;
    let image_paths = message_service::attach_message_creation_images(
        &transaction,
        upload_root,
        reply.id,
        images,
    )
    .await?;
    let notifications = notify_poll_thread_reply(
        &transaction,
        &context,
        request.parent_message_id,
        reply.id,
    )
    .await?;
    message_service::commit_message_creation(transaction, image_paths).await?;

    let (reply_count, latest_reply_at) =
        message_service::load_poll_reply_summaries(
            database,
            vec![context.poll_id],
        )
        .await?
        .remove(&context.poll_id)
        .ok_or_else(|| {
            internal_consistency_error("Reply summary not found.")
        })?;
    let reply = message_service::shape_messages(database, vec![reply])
        .await?
        .into_iter()
        .next()
        .ok_or_else(|| internal_consistency_error("Reply not found."))?;

    Ok(WithNotifications::new(
        CreatedReply {
            reply,
            reply_count,
            latest_reply_at: crate::messages::types::serialize_timestamp(
                latest_reply_at,
            ),
        },
        notifications,
    ))
}

async fn notify_poll_thread_reply<C>(
    database: &C,
    context: &CreateReplyContext,
    parent_message_id: Option<Uuid>,
    reply_id: Uuid,
) -> AppResult<Vec<entity::notifications::Model>>
where
    C: ConnectionTrait,
{
    let Some(poll) = polls::Entity::find_by_id(context.poll_id)
        .one(database)
        .await
        .map_err(internal_error)?
    else {
        return Ok(Vec::new());
    };

    let mut recipient_ids = vec![poll.user_id];
    if let Some(parent_message_id) = parent_message_id {
        recipient_ids.extend(
            crate::messages::reply_recipient_ids(
                database,
                &[parent_message_id],
            )
            .await?,
        );
    }

    crate::notifications::create_notifications(
        database,
        crate::notifications::CreateNotificationsRequest {
            kind: NotificationKind::MessageReply,
            server_id: context.server_id,
            channel_id: Some(context.channel_id),
            actor_user_id: Some(context.user_id),
            target: crate::notifications::NotificationTarget::Message(reply_id),
            vote_type: None,
            recipient_ids,
        },
    )
    .await
}

pub(super) async fn broadcast_reply(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    server_id: Uuid,
    channel_id: Uuid,
    poll_id: Uuid,
    created: &CreatedReply,
) -> AppResult<()> {
    let body = serde_json::json!({
        "type": "threadReply",
        "rootKind": "poll",
        "rootId": poll_id,
        "reply": created.reply,
        "replyCount": created.reply_count,
        "latestReplyAt": created.latest_reply_at,
    });
    for member_id in
        channels::get_channel_member_user_ids(database, channel_id).await?
    {
        let topic = PubSubTopic::new_message(server_id, channel_id, member_id)
            .to_string();
        pub_sub_service.publish(&topic, body.clone()).await?;
    }
    Ok(())
}

async fn ensure_text_channel(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
) -> AppResult<()> {
    let channel =
        channels::get_channel(database, server_id, channel_id).await?;
    if channel.channel_type == ChannelType::Text {
        Ok(())
    } else {
        Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Poll threads are only available in text channels.",
        ))
    }
}

async fn load_poll_thread_root<C>(
    database: &C,
    channel_id: Uuid,
    poll_id: Uuid,
    lock: bool,
) -> AppResult<polls::Model>
where
    C: ConnectionTrait,
{
    let query = polls::Entity::find_by_id(poll_id)
        .filter(polls::Column::ChannelId.eq(channel_id))
        .filter(polls::Column::CallId.is_null());
    let poll = if lock {
        query.lock_exclusive().one(database).await
    } else {
        query.one(database).await
    }
    .map_err(internal_error)?
    .ok_or_else(|| ApiError::new(StatusCode::NOT_FOUND, "Poll not found."))?;
    let is_forum_proposal = forum_posts::Entity::find()
        .filter(forum_posts::Column::PollId.eq(poll_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .is_some();
    if is_forum_proposal {
        return Err(ApiError::new(StatusCode::NOT_FOUND, "Poll not found."));
    }
    Ok(poll)
}

async fn load_moved_poll_thread_destination<C>(
    database: &C,
    source_channel_id: Uuid,
    poll_id: Uuid,
) -> AppResult<Option<MovedPollThreadDestination>>
where
    C: ConnectionTrait,
{
    Ok(forum_posts::Entity::find()
        .filter(forum_posts::Column::PollId.eq(poll_id))
        .filter(forum_posts::Column::SourceChannelId.eq(source_channel_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .map(|post| MovedPollThreadDestination {
            destination_channel_id: post.channel_id.to_string(),
            forum_post_id: post.id.to_string(),
        }))
}

async fn validate_reply_parent<C>(
    database: &C,
    channel_id: Uuid,
    poll_id: Uuid,
    parent_message_id: Uuid,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    let parent = messages::Entity::find_by_id(parent_message_id)
        .filter(messages::Column::ChannelId.eq(channel_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Parent message not found.")
        })?;
    if parent.thread_poll_id != Some(poll_id) {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Parent message must belong to the same thread.",
        ));
    }
    Ok(())
}

fn internal_consistency_error(message: &'static str) -> ApiError {
    tracing::error!("poll reply data is inconsistent: {message}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("poll reply operation failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
