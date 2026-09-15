use axum::http::StatusCode;
use chrono::Utc;
use entity::{
    channels as channels_entity,
    enums::{ForumPostStatus, NotificationKind, PollStage},
    forum_posts, messages, polls, votes as vote_entities,
};
use sea_orm::{
    prelude::Uuid, sea_query::Expr, ActiveModelTrait, ColumnTrait, Condition,
    ConnectionTrait, DatabaseConnection, EntityTrait, IntoActiveModel,
    ModelTrait, QueryFilter, QueryOrder, QuerySelect, Set, TransactionTrait,
};
use uuid::Uuid as NativeUuid;

use super::{
    responses::{
        shape_forum_post, shape_forum_post_with_replies, shape_post_summaries,
    },
    types::{
        CreateForumPostRequest, CreateForumProposalContext,
        CreateForumReplyRequest, CreatedForumReply, ForumPostContextResponse,
        ForumPostResponse, ForumPostSummaryResponse, ForumPostsResponse,
        UpdateForumPostRequest,
    },
};
use crate::{
    channels,
    common::{
        encryption, pagination::PaginationCursor, text::sanitize_text,
        ApiError, AppResult,
    },
    messages::{self as messages_service, types::ListRepliesPage},
    notifications::WithNotifications,
    polls::service as polls_service,
};

const MAX_POST_TITLE_LENGTH: usize = 100;

pub(super) async fn list_forum_posts(
    database: &DatabaseConnection,
    channel_id: Uuid,
    sort: Option<&str>,
    status: Option<&str>,
    before: Option<&str>,
    limit: u64,
) -> AppResult<ForumPostsResponse> {
    let status = parse_status_filter(status)?;
    let sort = parse_sort(sort)?;
    let cursor = before.map(PaginationCursor::parse).transpose()?;
    let mut select = forum_posts::Entity::find()
        .filter(forum_posts::Column::ChannelId.eq(channel_id));
    if let Some(status) = status {
        select = select.filter(forum_posts::Column::Status.eq(status));
    }
    if let Some(cursor) = cursor {
        select = select.filter(forum_post_cursor_condition(cursor, sort));
    }
    select = match sort {
        ForumPostSort::Recent => select
            .order_by_desc(forum_posts::Column::LatestActivityAt)
            .order_by_desc(forum_posts::Column::Id),
        ForumPostSort::Newest => select
            .order_by_desc(forum_posts::Column::CreatedAt)
            .order_by_desc(forum_posts::Column::Id),
    };

    let mut posts = select
        .limit(limit.saturating_add(1))
        .all(database)
        .await
        .map_err(internal_error)?;
    let has_more = posts.len() > limit as usize;
    if has_more {
        posts.pop();
    }
    let next_cursor = posts.last().map(|post| {
        PaginationCursor {
            created_at: match sort {
                ForumPostSort::Recent => post.latest_activity_at,
                ForumPostSort::Newest => post.created_at,
            },
            id: post.id,
        }
        .encode()
    });
    let posts = shape_post_summaries(database, posts).await?;

    Ok(ForumPostsResponse {
        posts,
        next_cursor,
        has_more,
    })
}

fn forum_post_cursor_condition(
    cursor: PaginationCursor,
    sort: ForumPostSort,
) -> Condition {
    let timestamp_column = match sort {
        ForumPostSort::Recent => forum_posts::Column::LatestActivityAt,
        ForumPostSort::Newest => forum_posts::Column::CreatedAt,
    };

    Condition::any()
        .add(timestamp_column.lt(cursor.created_at))
        .add(
            Condition::all()
                .add(timestamp_column.eq(cursor.created_at))
                .add(forum_posts::Column::Id.lt(cursor.id)),
        )
}

pub(super) async fn create_forum_post(
    database: &DatabaseConnection,
    upload_root: &std::path::Path,
    server_id: Uuid,
    channel_id: Uuid,
    user_id: Uuid,
    request: CreateForumPostRequest,
    uploads: polls_service::CreationUploads,
) -> AppResult<WithNotifications<ForumPostResponse>> {
    let title = validate_title(&request.title)?;
    let body = validate_body(&request.body, "A forum post body is required.")?;
    let prepared_proposal = match request.proposal {
        Some(proposal) => Some(
            polls_service::prepare_forum_proposal(
                database, server_id, channel_id, user_id, proposal,
            )
            .await?,
        ),
        None => None,
    };
    let (key, unwrapped_key) =
        channels::get_unwrapped_channel_key(database, channel_id).await?;
    let encrypted_title = encryption::encrypt_text(&title, &unwrapped_key)?;
    let encrypted_body = encryption::encrypt_text(&body, &unwrapped_key)?;
    let now = Utc::now().fixed_offset();
    let post_id = NativeUuid::new_v4();
    let root_message_id = NativeUuid::new_v4();

    let transaction = database.begin().await.map_err(internal_error)?;
    let proposal = match prepared_proposal {
        Some(prepared) => Some(
            polls_service::insert_prepared_poll(
                &transaction,
                None,
                user_id,
                prepared,
            )
            .await?,
        ),
        None => None,
    };

    messages::ActiveModel {
        id: Set(root_message_id),
        channel_id: Set(channel_id),
        user_id: Set(user_id),
        key_id: Set(Some(key.id)),
        ciphertext: Set(Some(encrypted_body.ciphertext)),
        iv: Set(Some(encrypted_body.iv)),
        tag: Set(Some(encrypted_body.tag)),
        created_at: Set(now),
        updated_at: Set(now),
        ..Default::default()
    }
    .insert(&transaction)
    .await
    .map_err(internal_error)?;

    forum_posts::ActiveModel {
        id: Set(post_id),
        channel_id: Set(channel_id),
        source_channel_id: Set(None),
        user_id: Set(user_id),
        root_message_id: Set(root_message_id),
        poll_id: Set(proposal.as_ref().map(|proposal| proposal.id)),
        ciphertext: Set(encrypted_title.ciphertext),
        iv: Set(encrypted_title.iv),
        tag: Set(encrypted_title.tag),
        key_id: Set(key.id),
        status: Set(ForumPostStatus::Open),
        latest_activity_at: Set(now),
        created_at: Set(now),
        updated_at: Set(now),
    }
    .insert(&transaction)
    .await
    .map_err(internal_error)?;
    let image_paths = match proposal.as_ref() {
        Some(proposal) => {
            polls_service::attach_poll_creation_images(
                &transaction,
                upload_root,
                proposal.id,
                uploads,
            )
            .await?
        }
        None => vec![],
    };
    // A post carrying a proposal is announced as the proposal it introduces
    let notifications = match proposal.as_ref() {
        Some(proposal) => {
            polls_service::notify_new_proposal(
                &transaction,
                server_id,
                channel_id,
                user_id,
                proposal.id,
            )
            .await?
        }
        None => {
            messages_service::notify_new_message(
                &transaction,
                server_id,
                channel_id,
                user_id,
                root_message_id,
            )
            .await?
        }
    };
    polls_service::commit_creation(transaction, image_paths).await?;

    let post =
        get_forum_post(database, channel_id, post_id, Some(user_id)).await?;
    Ok(WithNotifications::new(post, notifications))
}

pub(super) async fn get_forum_post(
    database: &DatabaseConnection,
    channel_id: Uuid,
    post_id: Uuid,
    user_id: Option<Uuid>,
) -> AppResult<ForumPostResponse> {
    shape_forum_post(
        database,
        get_post(database, channel_id, post_id).await?,
        user_id,
    )
    .await
}

/// Loads post context with paginated replies instead of the full discussion
pub(super) async fn get_forum_post_replies(
    database: &DatabaseConnection,
    channel_id: Uuid,
    post_id: Uuid,
    page: ListRepliesPage,
    user_id: Option<Uuid>,
) -> AppResult<ForumPostContextResponse> {
    let post = get_post(database, channel_id, post_id).await?;
    let root_message_id = post.root_message_id;
    let replies_query = || {
        messages::Entity::find()
            .filter(messages::Column::ChannelId.eq(channel_id))
            .filter(messages::Column::ThreadRootId.eq(root_message_id))
    };

    let page = match page.around {
        Some(target_id) => {
            if page.before.is_some() || page.after.is_some() {
                return Err(ApiError::new(
                    StatusCode::BAD_REQUEST,
                    "Use around on its own, without before or after.",
                ));
            }
            let target = replies_query()
                .filter(messages::Column::Id.eq(target_id))
                .one(database)
                .await
                .map_err(internal_error)?
                .ok_or_else(|| {
                    ApiError::new(StatusCode::NOT_FOUND, "Not found.")
                })?;
            messages_service::paginate_replies_around(
                database,
                replies_query,
                target,
            )
            .await?
        }
        None => {
            messages_service::paginate_replies(
                database,
                replies_query(),
                page.before.as_deref(),
                page.after.as_deref(),
                page.limit,
            )
            .await?
        }
    };

    let post =
        shape_forum_post_with_replies(database, post, page.replies, user_id)
            .await?;

    Ok(ForumPostContextResponse {
        post,
        start_cursor: page.start_cursor,
        next_cursor: page.next_cursor,
        has_more: page.has_more,
        has_more_newer: page.has_more_newer,
    })
}

pub(super) async fn update_forum_post(
    database: &DatabaseConnection,
    channel_id: Uuid,
    post_id: Uuid,
    user_id: Uuid,
    request: UpdateForumPostRequest,
) -> AppResult<ForumPostResponse> {
    if request.title.is_none() && request.body.is_none() {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "A forum post update is required.",
        ));
    }

    let title = request.title.as_deref().map(validate_title).transpose()?;
    let body = request
        .body
        .as_deref()
        .map(|body| validate_body(body, "A forum post body is required."))
        .transpose()?;
    let encrypted = if title.is_some() || body.is_some() {
        let (key, unwrapped_key) =
            channels::get_unwrapped_channel_key(database, channel_id).await?;
        let title = title
            .as_deref()
            .map(|title| encryption::encrypt_text(title, &unwrapped_key))
            .transpose()?;
        let body = body
            .as_deref()
            .map(|body| encryption::encrypt_text(body, &unwrapped_key))
            .transpose()?;
        Some((key.id, title, body))
    } else {
        None
    };

    let transaction = database.begin().await.map_err(internal_error)?;
    let post = get_post_for_update(&transaction, channel_id, post_id).await?;
    ensure_owner(post.user_id, user_id, "Only the post author can edit it.")?;
    ensure_post_is_open(&post, "Closed forum posts cannot be edited.")?;
    let root_message_id = post.root_message_id;
    let now = Utc::now().fixed_offset();
    let mut active = post.into_active_model();
    if let Some((key_id, Some(encrypted_title), _)) = encrypted.as_ref() {
        active.key_id = Set(*key_id);
        active.ciphertext = Set(encrypted_title.ciphertext.clone());
        active.iv = Set(encrypted_title.iv.clone());
        active.tag = Set(encrypted_title.tag.clone());
    }
    active.updated_at = Set(now);
    active.update(&transaction).await.map_err(internal_error)?;

    if let Some((key_id, _, Some(encrypted_body))) = encrypted {
        let root = messages::Entity::find_by_id(root_message_id)
            .one(&transaction)
            .await
            .map_err(internal_error)?
            .ok_or_else(|| {
                internal_consistency_error("Post root message not found.")
            })?;
        let mut root = root.into_active_model();
        root.key_id = Set(Some(key_id));
        root.ciphertext = Set(Some(encrypted_body.ciphertext));
        root.iv = Set(Some(encrypted_body.iv));
        root.tag = Set(Some(encrypted_body.tag));
        root.updated_at = Set(now);
        root.update(&transaction).await.map_err(internal_error)?;
    }

    transaction.commit().await.map_err(internal_error)?;
    get_forum_post(database, channel_id, post_id, Some(user_id)).await
}

pub(super) async fn create_forum_post_proposal(
    database: &DatabaseConnection,
    upload_root: &std::path::Path,
    context: CreateForumProposalContext,
    request: crate::polls::types::CreatePollRequest,
    uploads: polls_service::CreationUploads,
) -> AppResult<WithNotifications<ForumPostResponse>> {
    let CreateForumProposalContext {
        server_id,
        channel_id,
        post_id,
        user_id,
    } = context;
    let post = get_post(database, channel_id, post_id).await?;
    ensure_post_accepts_proposal(&post, user_id)?;
    let prepared = polls_service::prepare_forum_proposal(
        database, server_id, channel_id, user_id, request,
    )
    .await?;
    let transaction = database.begin().await.map_err(internal_error)?;
    let post = get_post_for_update(&transaction, channel_id, post_id).await?;
    ensure_post_accepts_proposal(&post, user_id)?;
    let proposal = polls_service::insert_prepared_poll(
        &transaction,
        None,
        user_id,
        prepared,
    )
    .await?;
    let mut active = post.into_active_model();
    active.poll_id = Set(Some(proposal.id));
    active.updated_at = Set(Utc::now().fixed_offset());
    active.update(&transaction).await.map_err(internal_error)?;
    let image_paths = polls_service::attach_poll_creation_images(
        &transaction,
        upload_root,
        proposal.id,
        uploads,
    )
    .await?;
    let notifications = polls_service::notify_new_proposal(
        &transaction,
        server_id,
        channel_id,
        user_id,
        proposal.id,
    )
    .await?;
    polls_service::commit_creation(transaction, image_paths).await?;

    let post =
        get_forum_post(database, channel_id, post_id, Some(user_id)).await?;
    Ok(WithNotifications::new(post, notifications))
}

pub(super) async fn close_forum_post(
    database: &DatabaseConnection,
    channel_id: Uuid,
    post_id: Uuid,
    user_id: Uuid,
) -> AppResult<ForumPostResponse> {
    set_forum_post_status(
        database,
        channel_id,
        post_id,
        user_id,
        ForumPostStatus::Closed,
        "Only the post author can close it.",
    )
    .await
}

pub(super) async fn reopen_forum_post(
    database: &DatabaseConnection,
    channel_id: Uuid,
    post_id: Uuid,
    user_id: Uuid,
) -> AppResult<ForumPostResponse> {
    set_forum_post_status(
        database,
        channel_id,
        post_id,
        user_id,
        ForumPostStatus::Open,
        "Only the post author can reopen it.",
    )
    .await
}

async fn set_forum_post_status(
    database: &DatabaseConnection,
    channel_id: Uuid,
    post_id: Uuid,
    user_id: Uuid,
    status: ForumPostStatus,
    owner_error: &'static str,
) -> AppResult<ForumPostResponse> {
    let transaction = database.begin().await.map_err(internal_error)?;
    let post = get_post_for_update(&transaction, channel_id, post_id).await?;
    ensure_owner(post.user_id, user_id, owner_error)?;
    if status == ForumPostStatus::Closed {
        ensure_post_can_close(&transaction, &post).await?;
    }
    if post.status != status {
        let mut active = post.into_active_model();
        active.status = Set(status);
        active.updated_at = Set(Utc::now().fixed_offset());
        active.update(&transaction).await.map_err(internal_error)?;
    }
    transaction.commit().await.map_err(internal_error)?;
    get_forum_post(database, channel_id, post_id, Some(user_id)).await
}

pub(super) async fn create_forum_reply(
    database: &DatabaseConnection,
    upload_root: &std::path::Path,
    channel_id: Uuid,
    post_id: Uuid,
    user_id: Uuid,
    request: CreateForumReplyRequest,
    images: Vec<Vec<u8>>,
) -> AppResult<WithNotifications<CreatedForumReply>> {
    messages_service::validate_message_content(
        Some(&request.body),
        images.len(),
    )?;
    let body = sanitize_text(&request.body);
    let body = (!body.is_empty()).then_some(body);
    let encrypted = match body.as_deref() {
        Some(body) => {
            let (key, unwrapped_key) =
                channels::get_unwrapped_channel_key(database, channel_id)
                    .await?;
            Some((key.id, encryption::encrypt_text(body, &unwrapped_key)?))
        }
        None => None,
    };
    let reply_id = NativeUuid::new_v4();
    let now = Utc::now().fixed_offset();

    let transaction = database.begin().await.map_err(internal_error)?;
    let post = get_post_for_update(&transaction, channel_id, post_id).await?;
    if post.status == ForumPostStatus::Closed {
        return Err(ApiError::new(
            StatusCode::CONFLICT,
            "Closed forum posts cannot receive replies.",
        ));
    }
    let parent_message_id =
        request.parent_message_id.unwrap_or(post.root_message_id);
    validate_reply_parent(
        &transaction,
        channel_id,
        post.root_message_id,
        parent_message_id,
    )
    .await?;

    let reply = messages::ActiveModel {
        id: Set(reply_id),
        channel_id: Set(channel_id),
        user_id: Set(user_id),
        key_id: Set(encrypted.as_ref().map(|(key_id, _)| *key_id)),
        ciphertext: Set(encrypted
            .as_ref()
            .map(|(_, value)| value.ciphertext.clone())),
        iv: Set(encrypted.as_ref().map(|(_, value)| value.iv.clone())),
        tag: Set(encrypted.as_ref().map(|(_, value)| value.tag.clone())),
        thread_root_id: Set(Some(post.root_message_id)),
        parent_message_id: Set(Some(parent_message_id)),
        created_at: Set(now),
        updated_at: Set(now),
        ..Default::default()
    }
    .insert(&transaction)
    .await
    .map_err(internal_error)?;

    let latest_activity_at = post.latest_activity_at.max(now);
    let post_author_id = post.user_id;
    let mut active = post.into_active_model();
    active.latest_activity_at = Set(latest_activity_at);
    active.update(&transaction).await.map_err(internal_error)?;
    let image_paths = messages_service::attach_message_creation_images(
        &transaction,
        upload_root,
        reply.id,
        images,
    )
    .await?;
    let notifications = notify_forum_reply(
        &transaction,
        channel_id,
        post_author_id,
        parent_message_id,
        user_id,
        reply.id,
    )
    .await?;
    messages_service::commit_message_creation(transaction, image_paths).await?;

    let reply = messages_service::shape_messages(database, vec![reply])
        .await?
        .into_iter()
        .next()
        .ok_or_else(|| internal_consistency_error("Reply not found."))?;
    let post = get_post(database, channel_id, post_id).await?;
    let summary = shape_post_summaries(database, vec![post])
        .await?
        .into_iter()
        .next()
        .ok_or_else(|| internal_consistency_error("Post not found."))?;
    Ok(WithNotifications::new(
        CreatedForumReply { reply, summary },
        notifications,
    ))
}

async fn notify_forum_reply<C>(
    database: &C,
    channel_id: Uuid,
    post_author_id: Uuid,
    parent_message_id: Uuid,
    user_id: Uuid,
    reply_id: Uuid,
) -> AppResult<Vec<entity::notifications::Model>>
where
    C: ConnectionTrait,
{
    let Some(channel) = channels_entity::Entity::find_by_id(channel_id)
        .one(database)
        .await
        .map_err(internal_error)?
    else {
        return Ok(Vec::new());
    };

    let mut recipient_ids = vec![post_author_id];
    recipient_ids.extend(
        messages_service::reply_recipient_ids(database, &[parent_message_id])
            .await?,
    );

    crate::notifications::create_notifications(
        database,
        crate::notifications::CreateNotificationsRequest {
            kind: NotificationKind::ForumReply,
            server_id: channel.server_id,
            channel_id: Some(channel_id),
            actor_user_id: Some(user_id),
            target: crate::notifications::NotificationTarget::Message(reply_id),
            vote_type: None,
            recipient_ids,
        },
    )
    .await
}

pub(super) async fn delete_forum_reply(
    database: &DatabaseConnection,
    channel_id: Uuid,
    post_id: Uuid,
    reply_id: Uuid,
    user_id: Uuid,
) -> AppResult<ForumPostSummaryResponse> {
    let transaction = database.begin().await.map_err(internal_error)?;
    let post = get_post_for_update(&transaction, channel_id, post_id).await?;
    ensure_post_is_open(
        &post,
        "Replies cannot be deleted from closed forum posts.",
    )?;
    let reply = messages::Entity::find_by_id(reply_id)
        .filter(messages::Column::ChannelId.eq(channel_id))
        .filter(messages::Column::ThreadRootId.eq(post.root_message_id))
        .one(&transaction)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Reply not found.")
        })?;
    ensure_owner(
        reply.user_id,
        user_id,
        "Only the reply author can delete it.",
    )?;
    reply.delete(&transaction).await.map_err(internal_error)?;

    refresh_forum_post_activity(&transaction, post).await?;
    transaction.commit().await.map_err(internal_error)?;

    let post = get_post(database, channel_id, post_id).await?;
    shape_post_summaries(database, vec![post])
        .await?
        .into_iter()
        .next()
        .ok_or_else(|| internal_consistency_error("Post not found."))
}

pub(crate) async fn touch_forum_post_activity_for_poll<C>(
    database: &C,
    poll_id: Uuid,
    activity_at: chrono::DateTime<chrono::FixedOffset>,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    forum_posts::Entity::update_many()
        .col_expr(
            forum_posts::Column::LatestActivityAt,
            Expr::value(activity_at),
        )
        .filter(forum_posts::Column::PollId.eq(poll_id))
        .filter(forum_posts::Column::LatestActivityAt.lt(activity_at))
        .exec(database)
        .await
        .map_err(internal_error)?;
    Ok(())
}

pub(crate) async fn refresh_forum_post_activity_for_poll<C>(
    database: &C,
    poll_id: Uuid,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    let post = forum_posts::Entity::find()
        .filter(forum_posts::Column::PollId.eq(poll_id))
        .lock_exclusive()
        .one(database)
        .await
        .map_err(internal_error)?;
    if let Some(post) = post {
        refresh_forum_post_activity(database, post).await?;
    }
    Ok(())
}

async fn refresh_forum_post_activity<C>(
    database: &C,
    post: forum_posts::Model,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    let latest_reply = messages::Entity::find()
        .filter(messages::Column::ThreadRootId.eq(post.root_message_id))
        .order_by_desc(messages::Column::CreatedAt)
        .one(database)
        .await
        .map_err(internal_error)?;
    let latest_vote = match post.poll_id {
        Some(poll_id) => vote_entities::Entity::find()
            .filter(vote_entities::Column::PollId.eq(poll_id))
            .order_by_desc(vote_entities::Column::UpdatedAt)
            .one(database)
            .await
            .map_err(internal_error)?,
        None => None,
    };
    let latest_activity_at = latest_forum_activity(
        post.created_at,
        latest_reply.map(|reply| reply.created_at),
        latest_vote.map(|vote| vote.updated_at),
    );
    let mut active = post.into_active_model();
    active.latest_activity_at = Set(latest_activity_at);
    active.update(database).await.map_err(internal_error)?;
    Ok(())
}

fn latest_forum_activity(
    post_created_at: chrono::DateTime<chrono::FixedOffset>,
    latest_reply_at: Option<chrono::DateTime<chrono::FixedOffset>>,
    latest_vote_at: Option<chrono::DateTime<chrono::FixedOffset>>,
) -> chrono::DateTime<chrono::FixedOffset> {
    [Some(post_created_at), latest_reply_at, latest_vote_at]
        .into_iter()
        .flatten()
        .max()
        .expect("post creation always provides forum activity")
}

async fn get_post<C>(
    database: &C,
    channel_id: Uuid,
    post_id: Uuid,
) -> AppResult<forum_posts::Model>
where
    C: ConnectionTrait,
{
    forum_posts::Entity::find_by_id(post_id)
        .filter(forum_posts::Column::ChannelId.eq(channel_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| ApiError::new(StatusCode::NOT_FOUND, "Post not found."))
}

async fn get_post_for_update<C>(
    database: &C,
    channel_id: Uuid,
    post_id: Uuid,
) -> AppResult<forum_posts::Model>
where
    C: ConnectionTrait,
{
    forum_posts::Entity::find_by_id(post_id)
        .filter(forum_posts::Column::ChannelId.eq(channel_id))
        .lock_exclusive()
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| ApiError::new(StatusCode::NOT_FOUND, "Post not found."))
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
            "Parent message must belong to the same forum post.",
        ));
    }
    Ok(())
}

pub(super) fn validate_title(value: &str) -> AppResult<String> {
    let title = sanitize_text(value);
    let length = title.chars().count();
    if (1..=MAX_POST_TITLE_LENGTH).contains(&length) {
        Ok(title)
    } else {
        Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            format!(
                "Forum post title must be between 1 and {MAX_POST_TITLE_LENGTH} characters."
            ),
        ))
    }
}

pub(super) fn validate_body(
    value: &str,
    message: &'static str,
) -> AppResult<String> {
    let body = sanitize_text(value);
    if body.is_empty() {
        Err(ApiError::new(StatusCode::UNPROCESSABLE_ENTITY, message))
    } else {
        Ok(body)
    }
}

fn ensure_owner(
    owner_id: Uuid,
    user_id: Uuid,
    message: &'static str,
) -> AppResult<()> {
    if owner_id == user_id {
        Ok(())
    } else {
        Err(ApiError::new(StatusCode::FORBIDDEN, message))
    }
}

fn ensure_post_is_open(
    post: &forum_posts::Model,
    message: &'static str,
) -> AppResult<()> {
    if post.status == ForumPostStatus::Open {
        Ok(())
    } else {
        Err(ApiError::new(StatusCode::CONFLICT, message))
    }
}

async fn ensure_post_can_close<C>(
    database: &C,
    post: &forum_posts::Model,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    let Some(poll_id) = post.poll_id else {
        return Ok(());
    };
    let poll = polls::Entity::find_by_id(poll_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            internal_consistency_error("Forum post proposal not found.")
        })?;
    if poll.stage == PollStage::Voting {
        return Err(ApiError::new(
            StatusCode::CONFLICT,
            "Forum posts cannot be closed while their proposal is voting.",
        ));
    }
    Ok(())
}

fn ensure_post_accepts_proposal(
    post: &forum_posts::Model,
    user_id: Uuid,
) -> AppResult<()> {
    ensure_owner(
        post.user_id,
        user_id,
        "Only the post author can create its proposal.",
    )?;
    if post.status == ForumPostStatus::Closed {
        return Err(ApiError::new(
            StatusCode::CONFLICT,
            "Closed forum posts cannot have proposals created.",
        ));
    }
    if post.poll_id.is_some() {
        return Err(ApiError::new(
            StatusCode::CONFLICT,
            "This forum post already has a proposal.",
        ));
    }
    Ok(())
}

#[derive(Clone, Copy)]
enum ForumPostSort {
    Recent,
    Newest,
}

fn parse_sort(value: Option<&str>) -> AppResult<ForumPostSort> {
    match value.unwrap_or("recent") {
        "recent" => Ok(ForumPostSort::Recent),
        "newest" => Ok(ForumPostSort::Newest),
        _ => Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Forum post sort must be recent or newest.",
        )),
    }
}

fn parse_status_filter(
    value: Option<&str>,
) -> AppResult<Option<ForumPostStatus>> {
    match value {
        None => Ok(None),
        Some("open") => Ok(Some(ForumPostStatus::Open)),
        Some("closed") => Ok(Some(ForumPostStatus::Closed)),
        Some(_) => Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Forum post status must be open or closed.",
        )),
    }
}

fn internal_consistency_error(message: &'static str) -> ApiError {
    tracing::error!("forum data is inconsistent: {message}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("forum request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}

#[cfg(test)]
mod tests {
    use chrono::{DateTime, FixedOffset};

    use super::latest_forum_activity;

    fn timestamp(value: &str) -> DateTime<FixedOffset> {
        DateTime::parse_from_rfc3339(value).expect("valid test timestamp")
    }

    #[test]
    fn latest_activity_includes_proposal_votes() {
        let created_at = timestamp("2026-07-20T10:00:00-04:00");
        let reply_at = timestamp("2026-07-20T10:05:00-04:00");
        let vote_at = timestamp("2026-07-20T10:10:00-04:00");

        assert_eq!(
            latest_forum_activity(created_at, Some(reply_at), Some(vote_at)),
            vote_at
        );
    }

    #[test]
    fn later_reply_remains_the_latest_activity() {
        let created_at = timestamp("2026-07-20T10:00:00-04:00");
        let vote_at = timestamp("2026-07-20T10:05:00-04:00");
        let reply_at = timestamp("2026-07-20T10:10:00-04:00");

        assert_eq!(
            latest_forum_activity(created_at, Some(reply_at), Some(vote_at)),
            reply_at
        );
    }
}
