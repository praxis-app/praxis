// TODO: Continue splitting focused modules under `api/src/messages`, leaving
// message creation and the shared validators here:
//
//   images.rs      attachment writes and image serving
//   responses.rs   model-to-DTO shaping
//   broadcasts.rs  pub/sub fan-out
//   feed.rs        channel and call feeds, plus their cursors

use axum::http::StatusCode;
use entity::{
    enums::NotificationKind, message_images, messages, notifications, users,
};
use sea_orm::{
    prelude::{DateTimeWithTimeZone, Uuid},
    ActiveModelTrait, ColumnTrait, Condition, ConnectionTrait,
    DatabaseConnection, EntityTrait, QueryFilter, QueryOrder, QuerySelect, Set,
    TransactionTrait,
};
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
};
use uuid::Uuid as NativeUuid;

pub(super) use super::replies::{broadcast_reply, create_reply, list_replies};
use super::types::{
    serialize_timestamp, CreateMessageRequest, ImageResponse, MessageResponse,
    MessageUser, StoredImage,
};
use crate::{
    channels,
    common::{
        encryption,
        pagination::{PaginationCursor, PaginationDirection},
        request::MAX_ATTACHMENT_FILES,
        text::sanitize_text,
        ApiError, AppResult,
    },
    notifications::{self as notifications_service, WithNotifications},
    pub_sub::{PubSubService, PubSubTopic},
    users as users_service,
};

/// Set only for top-level channel messages; call messages notify nobody
struct CreateMessageContext {
    notified_server_id: Option<Uuid>,
    channel_id: Uuid,
    call_id: Option<Uuid>,
    user_id: Uuid,
}

pub(crate) async fn get_channel_message_feed(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    cursor: Option<PaginationCursor>,
    direction: PaginationDirection,
    limit: u64,
) -> AppResult<Vec<MessageResponse>> {
    channels::get_channel(database, server_id, channel_id).await?;

    let mut query = messages::Entity::find()
        .filter(messages::Column::ChannelId.eq(channel_id))
        .filter(messages::Column::CallId.is_null())
        .filter(messages::Column::ThreadRootId.is_null())
        .filter(messages::Column::ThreadPollId.is_null());
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
    let messages = query
        .limit(limit)
        .all(database)
        .await
        .map_err(internal_error)?;

    shape_messages(database, messages).await
}

pub(crate) async fn get_channel_message_target(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    message_id: Uuid,
) -> AppResult<Option<MessageResponse>> {
    channels::get_channel(database, server_id, channel_id).await?;

    let message = messages::Entity::find_by_id(message_id)
        .filter(messages::Column::ChannelId.eq(channel_id))
        .filter(messages::Column::CallId.is_null())
        .filter(messages::Column::ThreadRootId.is_null())
        .filter(messages::Column::ThreadPollId.is_null())
        .one(database)
        .await
        .map_err(internal_error)?;
    let Some(message) = message else {
        return Ok(None);
    };

    Ok(shape_messages(database, vec![message])
        .await?
        .into_iter()
        .next())
}

pub(crate) async fn get_call_message_target(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    call_id: Uuid,
    message_id: Uuid,
) -> AppResult<Option<MessageResponse>> {
    crate::calls::service::get_call(database, server_id, channel_id, call_id)
        .await?;

    let message = messages::Entity::find_by_id(message_id)
        .filter(messages::Column::ChannelId.eq(channel_id))
        .filter(messages::Column::CallId.eq(call_id))
        .filter(messages::Column::ThreadRootId.is_null())
        .filter(messages::Column::ThreadPollId.is_null())
        .one(database)
        .await
        .map_err(internal_error)?;
    let Some(message) = message else {
        return Ok(None);
    };

    Ok(shape_messages(database, vec![message])
        .await?
        .into_iter()
        .next())
}

pub(crate) async fn get_call_message_feed(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    call_id: Uuid,
    cursor: Option<PaginationCursor>,
    direction: PaginationDirection,
    limit: u64,
) -> AppResult<Vec<MessageResponse>> {
    crate::calls::service::get_call(database, server_id, channel_id, call_id)
        .await?;

    let mut query = messages::Entity::find()
        .filter(messages::Column::ChannelId.eq(channel_id))
        .filter(messages::Column::CallId.eq(call_id))
        .filter(messages::Column::ThreadRootId.is_null())
        .filter(messages::Column::ThreadPollId.is_null());
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
    let messages = query
        .limit(limit)
        .all(database)
        .await
        .map_err(internal_error)?;

    shape_messages(database, messages).await
}

pub(crate) fn cursor_condition(
    cursor: PaginationCursor,
    direction: PaginationDirection,
) -> Condition {
    let timestamp_comparison = match direction {
        PaginationDirection::Older => {
            messages::Column::CreatedAt.lt(cursor.created_at)
        }
        PaginationDirection::Newer => {
            messages::Column::CreatedAt.gt(cursor.created_at)
        }
    };
    let id_comparison = match direction {
        PaginationDirection::Older => messages::Column::Id.lt(cursor.id),
        PaginationDirection::Newer => messages::Column::Id.gt(cursor.id),
    };

    Condition::any().add(timestamp_comparison).add(
        Condition::all()
            .add(messages::Column::CreatedAt.eq(cursor.created_at))
            .add(id_comparison),
    )
}

pub(super) async fn create_message(
    database: &DatabaseConnection,
    upload_root: &Path,
    server_id: Uuid,
    channel_id: Uuid,
    user_id: Uuid,
    request: CreateMessageRequest,
    images: Vec<Vec<u8>>,
) -> AppResult<WithNotifications<MessageResponse>> {
    create_message_record(
        database,
        upload_root,
        CreateMessageContext {
            notified_server_id: Some(server_id),
            channel_id,
            call_id: None,
            user_id,
        },
        request,
        images,
    )
    .await
}

pub(super) async fn create_call_message(
    database: &DatabaseConnection,
    upload_root: &Path,
    server_id: Uuid,
    channel_id: Uuid,
    call_id: Uuid,
    user_id: Uuid,
    request: CreateMessageRequest,
    images: Vec<Vec<u8>>,
) -> AppResult<MessageResponse> {
    crate::calls::service::get_call(database, server_id, channel_id, call_id)
        .await?;
    create_message_record(
        database,
        upload_root,
        CreateMessageContext {
            notified_server_id: None,
            channel_id,
            call_id: Some(call_id),
            user_id,
        },
        request,
        images,
    )
    .await
    .map(|created| created.value)
}

pub(super) async fn broadcast_message(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    server_id: Uuid,
    channel_id: Uuid,
    sender_id: Uuid,
    message: &MessageResponse,
) -> AppResult<()> {
    let body = serde_json::json!({
        "type": "message",
        "message": message,
    });

    broadcast_to_channel_members(
        database,
        pub_sub_service,
        server_id,
        channel_id,
        sender_id,
        body,
    )
    .await
}

pub(super) async fn broadcast_message_to_call(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    server_id: Uuid,
    channel_id: Uuid,
    call_id: Uuid,
    sender_id: Uuid,
    message: &MessageResponse,
) -> AppResult<()> {
    let body = serde_json::json!({
        "type": "message",
        "message": message,
    });

    broadcast_to_call_members(
        database,
        pub_sub_service,
        server_id,
        channel_id,
        call_id,
        sender_id,
        body,
    )
    .await
}

async fn create_message_record(
    database: &DatabaseConnection,
    upload_root: &Path,
    context: CreateMessageContext,
    request: CreateMessageRequest,
    images: Vec<Vec<u8>>,
) -> AppResult<WithNotifications<MessageResponse>> {
    let CreateMessageContext {
        notified_server_id,
        channel_id,
        call_id,
        user_id,
    } = context;
    validate_message_content(request.body.as_deref(), images.len())?;

    let body = request
        .body
        .map(|value| sanitize_text(&value))
        .filter(|value| !value.is_empty());

    let encrypted = match body.as_deref() {
        Some(body) => {
            let (key, unwrapped_key) =
                channels::get_unwrapped_channel_key(database, channel_id)
                    .await?;
            Some((key.id, encryption::encrypt_text(body, &unwrapped_key)?))
        }
        None => None,
    };

    let transaction = database.begin().await.map_err(internal_error)?;
    let message = messages::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        channel_id: Set(channel_id),
        call_id: Set(call_id),
        user_id: Set(user_id),
        key_id: Set(encrypted.as_ref().map(|(key_id, _)| *key_id)),
        ciphertext: Set(encrypted
            .as_ref()
            .map(|(_, value)| value.ciphertext.clone())),
        iv: Set(encrypted.as_ref().map(|(_, value)| value.iv.clone())),
        tag: Set(encrypted.as_ref().map(|(_, value)| value.tag.clone())),
        ..Default::default()
    }
    .insert(&transaction)
    .await
    .map_err(internal_error)?;
    let image_paths = attach_message_creation_images(
        &transaction,
        upload_root,
        message.id,
        images,
    )
    .await?;
    let notifications = match notified_server_id {
        Some(server_id) => {
            notify_new_message(
                &transaction,
                server_id,
                channel_id,
                user_id,
                message.id,
            )
            .await?
        }
        None => Vec::new(),
    };
    commit_message_creation(transaction, image_paths).await?;

    let message = shape_messages(database, vec![message])
        .await?
        .into_iter()
        .next()
        .ok_or_else(|| internal_consistency_error("Message not found."))?;

    Ok(WithNotifications::new(message, notifications))
}

pub(crate) async fn notify_new_message<C>(
    database: &C,
    server_id: Uuid,
    channel_id: Uuid,
    sender_id: Uuid,
    message_id: Uuid,
) -> AppResult<Vec<notifications::Model>>
where
    C: ConnectionTrait,
{
    let recipient_ids =
        channels::get_channel_member_user_ids(database, channel_id).await?;

    notifications_service::create_notifications(
        database,
        notifications_service::CreateNotificationsRequest {
            kind: NotificationKind::NewMessage,
            server_id,
            channel_id: Some(channel_id),
            actor_user_id: Some(sender_id),
            target: notifications_service::NotificationTarget::Message(
                message_id,
            ),
            vote_type: None,
            recipient_ids,
        },
    )
    .await
}

pub(crate) async fn shape_messages(
    database: &DatabaseConnection,
    messages: Vec<messages::Model>,
) -> AppResult<Vec<MessageResponse>> {
    let message_ids: Vec<Uuid> =
        messages.iter().map(|message| message.id).collect();

    let root_ids = messages
        .iter()
        .filter(|message| {
            message.thread_root_id.is_none() && message.thread_poll_id.is_none()
        })
        .map(|message| message.id)
        .collect::<Vec<_>>();
    let reply_summaries =
        super::replies::load_reply_summaries(database, root_ids.clone())
            .await?;
    let reply_participants =
        super::replies::load_reply_participants(database, root_ids).await?;

    let mut user_ids: Vec<Uuid> =
        messages.iter().map(|message| message.user_id).collect();
    user_ids.extend(
        reply_participants
            .values()
            .flat_map(|participant_ids| participant_ids.iter().copied()),
    );
    user_ids.sort_unstable();
    user_ids.dedup();

    let users_by_id: HashMap<Uuid, users::Model> = users::Entity::find()
        .filter(users::Column::Id.is_in(user_ids.clone()))
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .map(|user| (user.id, user))
        .collect();
    let profile_pictures =
        users_service::get_user_profile_pictures_map(database, &user_ids)
            .await?;
    let mut images_by_message: HashMap<Uuid, Vec<message_images::Model>> =
        HashMap::new();
    for image in message_images::Entity::find()
        .filter(message_images::Column::MessageId.is_in(message_ids))
        .order_by_asc(message_images::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?
    {
        images_by_message
            .entry(image.message_id)
            .or_default()
            .push(image);
    }
    let key_ids = messages
        .iter()
        .filter_map(|message| message.key_id)
        .collect::<Vec<_>>();
    let key_map =
        channels::get_unwrapped_channel_key_map(database, key_ids).await?;
    Ok(messages
        .into_iter()
        .map(|message| {
            shape_message(
                &message,
                &users_by_id,
                &profile_pictures,
                images_by_message
                    .get(&message.id)
                    .map(Vec::as_slice)
                    .unwrap_or_default()
                    .iter(),
                decrypt_message_body(&message, &key_map),
                reply_summaries.get(&message.id),
                reply_participants
                    .get(&message.id)
                    .map(Vec::as_slice)
                    .unwrap_or_default(),
            )
        })
        .collect())
}

pub(crate) async fn attach_message_creation_images<C: ConnectionTrait>(
    database: &C,
    upload_root: &Path,
    message_id: Uuid,
    images: Vec<Vec<u8>>,
) -> AppResult<Vec<PathBuf>> {
    if images.len() > MAX_ATTACHMENT_FILES {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            format!(
                "A message can include at most {MAX_ATTACHMENT_FILES} images."
            ),
        ));
    }
    let mut normalized = Vec::with_capacity(images.len());
    for bytes in images {
        normalized.push(
            crate::common::images::normalize_upload(bytes, "Message image")
                .await?,
        );
    }

    let mut paths = vec![];
    for bytes in normalized {
        let image_id = NativeUuid::new_v4();
        let storage_key = format!("message-images/{image_id}");
        let destination = upload_root.join(&storage_key);

        if let Some(parent) = destination.parent() {
            if let Err(error) = tokio::fs::create_dir_all(parent).await {
                cleanup_image_paths(paths).await;
                return Err(internal_error(error));
            }
        }

        if let Err(error) = tokio::fs::write(&destination, bytes).await {
            let _ = tokio::fs::remove_file(&destination).await;
            cleanup_image_paths(paths).await;
            return Err(internal_error(error));
        }

        let insert_result = message_images::ActiveModel {
            id: Set(image_id),
            message_id: Set(message_id),
            storage_key: Set(Some(storage_key)),
            ..Default::default()
        }
        .insert(database)
        .await;
        if let Err(error) = insert_result {
            if let Err(cleanup_error) =
                tokio::fs::remove_file(&destination).await
            {
                tracing::warn!(
                    "failed to clean up message image after database error: {cleanup_error}"
                );
            }
            cleanup_image_paths(paths).await;
            return Err(internal_error(error));
        }
        paths.push(destination);
    }

    Ok(paths)
}

pub(crate) async fn commit_message_creation(
    transaction: sea_orm::DatabaseTransaction,
    image_paths: Vec<PathBuf>,
) -> AppResult<()> {
    if let Err(error) = transaction.commit().await {
        cleanup_image_paths(image_paths).await;
        return Err(internal_error(error));
    }
    Ok(())
}

async fn cleanup_image_paths(paths: Vec<PathBuf>) {
    for path in paths {
        if let Err(error) = tokio::fs::remove_file(path).await {
            tracing::warn!("failed to clean up message image: {error}");
        }
    }
}

pub(super) async fn get_message_image(
    database: &DatabaseConnection,
    upload_root: &Path,
    server_id: Uuid,
    channel_id: Uuid,
    message_id: Uuid,
    image_id: Uuid,
    user_id: Option<Uuid>,
    invite_token: Option<&str>,
) -> AppResult<StoredImage> {
    let message = messages::Entity::find_by_id(message_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Message not found.")
        })?;

    if message.channel_id != channel_id {
        return Err(ApiError::new(StatusCode::NOT_FOUND, "Message not found."));
    }

    channels::can_read_channel(
        database,
        server_id,
        channel_id,
        user_id,
        invite_token,
    )
    .await?;

    load_message_image(database, upload_root, message_id, image_id).await
}

async fn load_message_image(
    database: &DatabaseConnection,
    upload_root: &Path,
    message_id: Uuid,
    image_id: Uuid,
) -> AppResult<StoredImage> {
    let image = message_images::Entity::find_by_id(image_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Image not found.")
        })?;

    if image.message_id != message_id {
        return Err(ApiError::new(StatusCode::NOT_FOUND, "Image not found."));
    }

    let storage_key = image.storage_key.ok_or_else(|| {
        ApiError::new(StatusCode::NOT_FOUND, "Image not uploaded yet.")
    })?;
    let bytes = tokio::fs::read(resolve_upload_path(upload_root, &storage_key))
        .await
        .map_err(internal_error)?;

    Ok(StoredImage { bytes })
}

pub(super) async fn get_call_message_image(
    database: &DatabaseConnection,
    upload_root: &Path,
    server_id: Uuid,
    channel_id: Uuid,
    call_id: Uuid,
    message_id: Uuid,
    image_id: Uuid,
    user_id: Option<Uuid>,
    invite_token: Option<&str>,
) -> AppResult<StoredImage> {
    load_call_message(database, server_id, channel_id, call_id, message_id)
        .await?;
    channels::can_read_channel(
        database,
        server_id,
        channel_id,
        user_id,
        invite_token,
    )
    .await?;
    load_message_image(database, upload_root, message_id, image_id).await
}

pub(super) async fn load_message(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    message_id: Uuid,
) -> AppResult<messages::Model> {
    let message = messages::Entity::find_by_id(message_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Message not found.")
        })?;

    if message.channel_id != channel_id {
        return Err(ApiError::new(StatusCode::NOT_FOUND, "Message not found."));
    }

    channels::get_channel(database, server_id, channel_id).await?;

    Ok(message)
}

pub(super) async fn load_call_message(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    call_id: Uuid,
    message_id: Uuid,
) -> AppResult<messages::Model> {
    crate::calls::service::get_call(database, server_id, channel_id, call_id)
        .await?;
    let message =
        load_message(database, server_id, channel_id, message_id).await?;

    if message.call_id != Some(call_id) {
        return Err(ApiError::new(StatusCode::NOT_FOUND, "Message not found."));
    }

    Ok(message)
}

fn resolve_upload_path(upload_root: &Path, storage_key: &str) -> PathBuf {
    upload_root.join(storage_key)
}

fn shape_message<'a>(
    message: &messages::Model,
    users_by_id: &HashMap<Uuid, users::Model>,
    profile_pictures: &std::collections::BTreeMap<
        Uuid,
        crate::users::UserImageRef,
    >,
    images: impl Iterator<Item = &'a message_images::Model>,
    body: Option<String>,
    reply_summary: Option<&(usize, DateTimeWithTimeZone)>,
    reply_participant_ids: &[Uuid],
) -> MessageResponse {
    MessageResponse {
        id: message.id.to_string(),
        body,
        images: images
            .map(|image| shape_image(image, image.storage_key.is_none()))
            .collect(),
        user: users_by_id
            .get(&message.user_id)
            .map(|user| shape_message_user(user, profile_pictures)),
        user_id: Some(message.user_id.to_string()),
        bot_id: None,
        bot: None,
        command_status: None,
        thread_root_id: message.thread_root_id.map(|id| id.to_string()),
        thread_poll_id: message.thread_poll_id.map(|id| id.to_string()),
        parent_message_id: message.parent_message_id.map(|id| id.to_string()),
        reply_count: reply_summary.map(|(count, _)| *count).unwrap_or_default(),
        reply_users: reply_participant_ids
            .iter()
            .filter_map(|user_id| {
                users_by_id
                    .get(user_id)
                    .map(|user| shape_message_user(user, profile_pictures))
            })
            .collect(),
        latest_reply_at: reply_summary
            .map(|(_, created_at)| serialize_timestamp(*created_at)),
        created_at: serialize_timestamp(message.created_at),
    }
}

fn shape_message_user(
    user: &users::Model,
    profile_pictures: &std::collections::BTreeMap<
        Uuid,
        crate::users::UserImageRef,
    >,
) -> MessageUser {
    MessageUser {
        id: user.id.to_string(),
        name: user.name.clone(),
        display_name: user.display_name.clone(),
        profile_picture: profile_pictures.get(&user.id).cloned(),
    }
}

fn shape_image(
    image: &message_images::Model,
    is_placeholder: bool,
) -> ImageResponse {
    ImageResponse {
        id: image.id.to_string(),
        is_placeholder: is_placeholder.then_some(true),
        created_at: serialize_timestamp(image.created_at),
    }
}

fn decrypt_message_body(
    message: &messages::Model,
    key_map: &std::collections::HashMap<Uuid, Vec<u8>>,
) -> Option<String> {
    let (Some(ciphertext), Some(iv), Some(tag), Some(key_id)) = (
        message.ciphertext.as_ref(),
        message.iv.as_ref(),
        message.tag.as_ref(),
        message.key_id,
    ) else {
        return None;
    };
    let key = key_map.get(&key_id)?;
    encryption::decrypt_text(ciphertext, iv, tag, key).ok()
}

pub(crate) fn validate_message_content(
    body: Option<&str>,
    image_count: usize,
) -> AppResult<()> {
    if image_count > MAX_ATTACHMENT_FILES {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            format!(
                "A message can include at most {MAX_ATTACHMENT_FILES} images."
            ),
        ));
    }

    let has_body = body
        .map(|body| !sanitize_text(body).is_empty())
        .unwrap_or(false);

    if has_body || image_count > 0 {
        Ok(())
    } else {
        Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "A message must include text or at least one image.",
        ))
    }
}

pub(super) fn internal_consistency_error(message: &'static str) -> ApiError {
    tracing::error!("message data is inconsistent: {message}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}

async fn broadcast_to_call_members(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    server_id: Uuid,
    channel_id: Uuid,
    call_id: Uuid,
    sender_id: Uuid,
    body: serde_json::Value,
) -> AppResult<()> {
    let members =
        channels::get_channel_member_user_ids(database, channel_id).await?;

    for member_id in members {
        if member_id == sender_id {
            continue;
        }

        let topic = PubSubTopic::call_message(
            server_id, channel_id, call_id, member_id,
        )
        .to_string();
        pub_sub_service.publish(&topic, body.clone()).await?;
    }

    Ok(())
}

async fn broadcast_to_channel_members(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    server_id: Uuid,
    channel_id: Uuid,
    sender_id: Uuid,
    body: serde_json::Value,
) -> AppResult<()> {
    let members =
        channels::get_channel_member_user_ids(database, channel_id).await?;

    for member_id in members {
        if member_id == sender_id {
            continue;
        }

        let topic = PubSubTopic::new_message(server_id, channel_id, member_id)
            .to_string();
        pub_sub_service.publish(&topic, body.clone()).await?;
    }

    Ok(())
}

pub(super) fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("chat request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
