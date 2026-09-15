use axum::http::StatusCode;
use entity::{
    enums::{ChannelType, NotificationKind},
    forum_posts, messages,
};
use sea_orm::{
    prelude::{DateTimeWithTimeZone, Uuid},
    sea_query::Expr,
    ActiveModelTrait, ColumnTrait, ConnectionTrait, DatabaseConnection,
    EntityTrait, FromQueryResult, QueryFilter, QueryOrder, QuerySelect, Set,
    TransactionTrait,
};
use std::{collections::HashMap, path::Path};
use uuid::Uuid as NativeUuid;

use super::{
    service::{
        attach_message_creation_images, commit_message_creation,
        cursor_condition, internal_consistency_error, internal_error,
        shape_messages, validate_message_content,
    },
    types::{
        serialize_timestamp, CreateReplyContext, CreateReplyRequest,
        ListRepliesPage, MessageResponse, ThreadResponse,
    },
};
use crate::{
    channels,
    common::{
        encryption,
        pagination::{PaginationCursor, PaginationDirection},
        text::sanitize_text,
        ApiError, AppResult,
    },
    notifications::WithNotifications,
    pub_sub::{PubSubService, PubSubTopic},
};

#[derive(Debug)]
pub(crate) struct CreatedReply {
    pub(crate) reply: MessageResponse,
    pub(crate) reply_count: usize,
    pub(crate) latest_reply_at: String,
}

#[derive(FromQueryResult)]
struct ReplySummary {
    thread_root_id: Option<Uuid>,
    reply_count: i64,
    latest_reply_at: Option<DateTimeWithTimeZone>,
}

#[derive(FromQueryResult)]
struct ReplyParticipant {
    thread_root_id: Option<Uuid>,
    user_id: Uuid,
    latest_reply_at: DateTimeWithTimeZone,
}

#[derive(FromQueryResult)]
struct PollReplySummary {
    thread_poll_id: Option<Uuid>,
    reply_count: i64,
    latest_reply_at: Option<DateTimeWithTimeZone>,
}

#[derive(FromQueryResult)]
struct PollReplyParticipant {
    thread_poll_id: Option<Uuid>,
    user_id: Uuid,
    latest_reply_at: DateTimeWithTimeZone,
}

// Return up to 25 older and 25 newer replies beside the target
const AROUND_NEIGHBORS_PER_SIDE: u64 = 25;

pub(crate) struct ReplyPage {
    pub(crate) replies: Vec<messages::Model>,
    pub(crate) start_cursor: Option<String>,
    pub(crate) next_cursor: Option<String>,
    pub(crate) has_more: bool,
    pub(crate) has_more_newer: bool,
}

pub(crate) async fn paginate_replies(
    database: &DatabaseConnection,
    replies_query: sea_orm::Select<messages::Entity>,
    before: Option<&str>,
    after: Option<&str>,
    limit: u64,
) -> AppResult<ReplyPage> {
    let (cursor, direction) = match (before, after) {
        (Some(_), Some(_)) => {
            return Err(ApiError::new(
                StatusCode::BAD_REQUEST,
                "Use either before or after, not both.",
            ))
        }
        (Some(before), None) => (
            Some(PaginationCursor::parse(before)?),
            PaginationDirection::Older,
        ),
        (None, Some(after)) => (
            Some(PaginationCursor::parse(after)?),
            PaginationDirection::Newer,
        ),
        (None, None) => (None, PaginationDirection::Older),
    };

    let mut query = replies_query;
    if let Some(cursor) = cursor {
        query = query.filter(cursor_condition(cursor, direction));
    }
    query = match direction {
        PaginationDirection::Older => query
            .order_by_desc(messages::Column::CreatedAt)
            .order_by_desc(messages::Column::Id),
        PaginationDirection::Newer => query
            .order_by_asc(messages::Column::CreatedAt)
            .order_by_asc(messages::Column::Id),
    };
    let mut replies = query
        .limit(limit.saturating_add(1))
        .all(database)
        .await
        .map_err(internal_error)?;

    let has_more_in_direction = replies.len() > limit as usize;
    if has_more_in_direction {
        replies.pop();
    }
    if direction == PaginationDirection::Older {
        replies.reverse();
    }

    let (has_more, has_more_newer) = match direction {
        PaginationDirection::Older => (has_more_in_direction, cursor.is_some()),
        PaginationDirection::Newer => (true, has_more_in_direction),
    };

    Ok(reply_page(replies, has_more, has_more_newer))
}

/// Loads a target reply and its nearest older/newer replies
pub(crate) async fn paginate_replies_around<F>(
    database: &DatabaseConnection,
    replies_query: F,
    target: messages::Model,
) -> AppResult<ReplyPage>
where
    F: Fn() -> sea_orm::Select<messages::Entity>,
{
    let anchor = PaginationCursor {
        created_at: target.created_at,
        id: target.id,
    };

    let mut older = replies_query()
        .filter(cursor_condition(anchor, PaginationDirection::Older))
        .order_by_desc(messages::Column::CreatedAt)
        .order_by_desc(messages::Column::Id)
        .limit(AROUND_NEIGHBORS_PER_SIDE + 1)
        .all(database)
        .await
        .map_err(internal_error)?;
    let has_more = older.len() > AROUND_NEIGHBORS_PER_SIDE as usize;
    older.truncate(AROUND_NEIGHBORS_PER_SIDE as usize);
    older.reverse();

    let mut newer = replies_query()
        .filter(cursor_condition(anchor, PaginationDirection::Newer))
        .order_by_asc(messages::Column::CreatedAt)
        .order_by_asc(messages::Column::Id)
        .limit(AROUND_NEIGHBORS_PER_SIDE + 1)
        .all(database)
        .await
        .map_err(internal_error)?;
    let has_more_newer = newer.len() > AROUND_NEIGHBORS_PER_SIDE as usize;
    newer.truncate(AROUND_NEIGHBORS_PER_SIDE as usize);

    let mut replies = older;
    replies.push(target);
    replies.extend(newer);

    Ok(reply_page(replies, has_more, has_more_newer))
}

fn reply_page(
    replies: Vec<messages::Model>,
    has_more: bool,
    has_more_newer: bool,
) -> ReplyPage {
    ReplyPage {
        start_cursor: replies.last().map(message_cursor),
        next_cursor: replies.first().map(message_cursor),
        replies,
        has_more,
        has_more_newer,
    }
}

pub(super) async fn list_replies(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    root_message_id: Uuid,
    page: ListRepliesPage,
) -> AppResult<ThreadResponse> {
    ensure_text_channel(database, server_id, channel_id).await?;
    let root = get_thread_root(database, channel_id, root_message_id).await?;

    let replies = match page.around {
        Some(target_id) => {
            if page.before.is_some() || page.after.is_some() {
                return Err(ApiError::new(
                    StatusCode::BAD_REQUEST,
                    "Use around on its own, without before or after.",
                ));
            }
            let target = get_thread_reply(
                database,
                channel_id,
                root_message_id,
                target_id,
            )
            .await?;
            paginate_replies_around(
                database,
                || thread_replies_query(channel_id, root_message_id),
                target,
            )
            .await?
        }
        None => {
            paginate_replies(
                database,
                thread_replies_query(channel_id, root_message_id),
                page.before.as_deref(),
                page.after.as_deref(),
                page.limit,
            )
            .await?
        }
    };

    let mut shaped = shape_messages(database, {
        let mut records = Vec::with_capacity(replies.replies.len() + 1);
        records.push(root);
        records.extend(replies.replies);
        records
    })
    .await?
    .into_iter();
    let root = shaped.next().ok_or_else(|| {
        internal_consistency_error("Thread root message not found.")
    })?;

    Ok(ThreadResponse {
        root,
        replies: shaped.collect(),
        start_cursor: replies.start_cursor,
        next_cursor: replies.next_cursor,
        has_more: replies.has_more,
        has_more_newer: replies.has_more_newer,
    })
}

async fn get_thread_reply(
    database: &DatabaseConnection,
    channel_id: Uuid,
    root_message_id: Uuid,
    reply_id: Uuid,
) -> AppResult<messages::Model> {
    messages::Entity::find_by_id(reply_id)
        .filter(messages::Column::ChannelId.eq(channel_id))
        .filter(messages::Column::ThreadRootId.eq(root_message_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(reply_unavailable)
}

fn thread_replies_query(
    channel_id: Uuid,
    root_message_id: Uuid,
) -> sea_orm::Select<messages::Entity> {
    messages::Entity::find()
        .filter(messages::Column::ChannelId.eq(channel_id))
        .filter(messages::Column::ThreadRootId.eq(root_message_id))
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
    validate_message_content(request.body.as_deref(), images.len())?;
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
    get_thread_root(&transaction, context.channel_id, context.root_message_id)
        .await?;
    let parent_message_id =
        request.parent_message_id.unwrap_or(context.root_message_id);
    validate_reply_parent(
        &transaction,
        context.channel_id,
        context.root_message_id,
        parent_message_id,
    )
    .await?;
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
        thread_root_id: Set(Some(context.root_message_id)),
        parent_message_id: Set(Some(parent_message_id)),
        ..Default::default()
    }
    .insert(&transaction)
    .await
    .map_err(internal_error)?;
    let image_paths = attach_message_creation_images(
        &transaction,
        upload_root,
        reply.id,
        images,
    )
    .await?;
    let notifications = notify_thread_reply(
        &transaction,
        &context,
        parent_message_id,
        reply.id,
    )
    .await?;
    commit_message_creation(transaction, image_paths).await?;

    let (reply_count, latest_reply_at) =
        get_reply_summaries(database, vec![context.root_message_id])
            .await?
            .remove(&context.root_message_id)
            .ok_or_else(|| {
                internal_consistency_error("Reply summary not found.")
            })?;
    let latest_reply_at = serialize_timestamp(latest_reply_at);
    let reply = shape_messages(database, vec![reply])
        .await?
        .into_iter()
        .next()
        .ok_or_else(|| internal_consistency_error("Reply not found."))?;

    Ok(WithNotifications::new(
        CreatedReply {
            reply,
            reply_count,
            latest_reply_at,
        },
        notifications,
    ))
}

async fn notify_thread_reply<C>(
    database: &C,
    context: &CreateReplyContext,
    parent_message_id: Uuid,
    reply_id: Uuid,
) -> AppResult<Vec<entity::notifications::Model>>
where
    C: ConnectionTrait,
{
    let recipient_ids = reply_recipient_ids(
        database,
        &[context.root_message_id, parent_message_id],
    )
    .await?;

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

pub(crate) async fn reply_recipient_ids<C>(
    database: &C,
    message_ids: &[Uuid],
) -> AppResult<Vec<Uuid>>
where
    C: ConnectionTrait,
{
    Ok(messages::Entity::find()
        .filter(messages::Column::Id.is_in(message_ids.iter().copied()))
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .map(|message| message.user_id)
        .collect())
}

pub(super) async fn broadcast_reply(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    server_id: Uuid,
    channel_id: Uuid,
    created: &CreatedReply,
) -> AppResult<()> {
    let body = serde_json::json!({
        "type": "threadReply",
        "rootKind": "message",
        "rootId": created.reply.thread_root_id,
        "rootMessageId": created.reply.thread_root_id,
        "reply": created.reply,
        "replyCount": created.reply_count,
        "latestReplyAt": created.latest_reply_at,
    });
    let members =
        channels::get_channel_member_user_ids(database, channel_id).await?;
    for member_id in members {
        let topic = PubSubTopic::new_message(server_id, channel_id, member_id)
            .to_string();
        pub_sub_service.publish(&topic, body.clone()).await?;
    }
    Ok(())
}

pub(super) async fn get_reply_summaries(
    database: &DatabaseConnection,
    root_ids: Vec<Uuid>,
) -> AppResult<HashMap<Uuid, (usize, DateTimeWithTimeZone)>> {
    if root_ids.is_empty() {
        return Ok(HashMap::new());
    }
    Ok(messages::Entity::find()
        .select_only()
        .column(messages::Column::ThreadRootId)
        .column_as(Expr::col(messages::Column::Id).count(), "reply_count")
        .column_as(
            Expr::col(messages::Column::CreatedAt).max(),
            "latest_reply_at",
        )
        .filter(messages::Column::ThreadRootId.is_in(root_ids))
        .group_by(messages::Column::ThreadRootId)
        .into_model::<ReplySummary>()
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .filter_map(|summary| {
            Some((
                summary.thread_root_id?,
                (summary.reply_count as usize, summary.latest_reply_at?),
            ))
        })
        .collect())
}

pub(super) async fn get_reply_participants(
    database: &DatabaseConnection,
    root_ids: Vec<Uuid>,
) -> AppResult<HashMap<Uuid, Vec<Uuid>>> {
    if root_ids.is_empty() {
        return Ok(HashMap::new());
    }

    let mut participants = messages::Entity::find()
        .select_only()
        .column(messages::Column::ThreadRootId)
        .column(messages::Column::UserId)
        .column_as(
            Expr::col(messages::Column::CreatedAt).max(),
            "latest_reply_at",
        )
        .filter(messages::Column::ThreadRootId.is_in(root_ids))
        .group_by(messages::Column::ThreadRootId)
        .group_by(messages::Column::UserId)
        .into_model::<ReplyParticipant>()
        .all(database)
        .await
        .map_err(internal_error)?;
    participants.sort_by(|left, right| {
        right.latest_reply_at.cmp(&left.latest_reply_at)
    });

    let mut participants_by_root: HashMap<Uuid, Vec<Uuid>> = HashMap::new();
    for participant in participants {
        let Some(root_id) = participant.thread_root_id else {
            continue;
        };
        let root_participants =
            participants_by_root.entry(root_id).or_default();
        if root_participants.len() < 3 {
            root_participants.push(participant.user_id);
        }
    }
    Ok(participants_by_root)
}

pub(crate) async fn get_poll_reply_summaries(
    database: &DatabaseConnection,
    poll_ids: Vec<Uuid>,
) -> AppResult<HashMap<Uuid, (usize, DateTimeWithTimeZone)>> {
    if poll_ids.is_empty() {
        return Ok(HashMap::new());
    }
    Ok(messages::Entity::find()
        .select_only()
        .column(messages::Column::ThreadPollId)
        .column_as(Expr::col(messages::Column::Id).count(), "reply_count")
        .column_as(
            Expr::col(messages::Column::CreatedAt).max(),
            "latest_reply_at",
        )
        .filter(messages::Column::ThreadPollId.is_in(poll_ids))
        .group_by(messages::Column::ThreadPollId)
        .into_model::<PollReplySummary>()
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .filter_map(|summary| {
            Some((
                summary.thread_poll_id?,
                (summary.reply_count as usize, summary.latest_reply_at?),
            ))
        })
        .collect())
}

pub(crate) async fn get_poll_reply_participants(
    database: &DatabaseConnection,
    poll_ids: Vec<Uuid>,
) -> AppResult<HashMap<Uuid, Vec<Uuid>>> {
    if poll_ids.is_empty() {
        return Ok(HashMap::new());
    }
    let mut participants = messages::Entity::find()
        .select_only()
        .column(messages::Column::ThreadPollId)
        .column(messages::Column::UserId)
        .column_as(
            Expr::col(messages::Column::CreatedAt).max(),
            "latest_reply_at",
        )
        .filter(messages::Column::ThreadPollId.is_in(poll_ids))
        .group_by(messages::Column::ThreadPollId)
        .group_by(messages::Column::UserId)
        .into_model::<PollReplyParticipant>()
        .all(database)
        .await
        .map_err(internal_error)?;
    participants.sort_by(|left, right| {
        right.latest_reply_at.cmp(&left.latest_reply_at)
    });

    let mut participants_by_poll: HashMap<Uuid, Vec<Uuid>> = HashMap::new();
    for participant in participants {
        let Some(poll_id) = participant.thread_poll_id else {
            continue;
        };
        let poll_participants =
            participants_by_poll.entry(poll_id).or_default();
        if poll_participants.len() < 3 {
            poll_participants.push(participant.user_id);
        }
    }
    Ok(participants_by_poll)
}

async fn ensure_text_channel(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
) -> AppResult<()> {
    let channel =
        channels::get_channel(database, server_id, channel_id).await?;
    if channel.channel_type != ChannelType::Text {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Message threads are only available in text channels.",
        ));
    }
    Ok(())
}

async fn get_thread_root<C>(
    database: &C,
    channel_id: Uuid,
    root_message_id: Uuid,
) -> AppResult<messages::Model>
where
    C: ConnectionTrait,
{
    let root = messages::Entity::find_by_id(root_message_id)
        .filter(messages::Column::ChannelId.eq(channel_id))
        .filter(messages::Column::ThreadRootId.is_null())
        .filter(messages::Column::ThreadPollId.is_null())
        .filter(messages::Column::CallId.is_null())
        .filter(messages::Column::BotId.is_null())
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Thread root not found.")
        })?;
    let is_forum_root = forum_posts::Entity::find()
        .filter(forum_posts::Column::RootMessageId.eq(root_message_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .is_some();
    if is_forum_root {
        return Err(ApiError::new(
            StatusCode::NOT_FOUND,
            "Thread root not found.",
        ));
    }
    Ok(root)
}

async fn validate_reply_parent<C>(
    database: &C,
    channel_id: Uuid,
    root_message_id: Uuid,
    parent_message_id: Uuid,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    let parent = messages::Entity::find_by_id(parent_message_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Parent message not found.")
        })?;
    if parent.channel_id != channel_id
        || (parent.id != root_message_id
            && parent.thread_root_id != Some(root_message_id))
    {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Parent message must belong to the same thread.",
        ));
    }
    Ok(())
}

fn message_cursor(message: &messages::Model) -> String {
    PaginationCursor {
        created_at: message.created_at,
        id: message.id,
    }
    .encode()
}
