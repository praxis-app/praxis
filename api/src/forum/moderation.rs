use axum::http::StatusCode;
use chrono::Utc;
use entity::{
    enums::{
        ChannelType, ModerationAction, ModerationTargetKind, NotificationKind,
    },
    forum_posts, messages,
};
use sea_orm::{
    prelude::Uuid, sea_query::Expr, ActiveModelTrait, ColumnTrait,
    ConnectionTrait, DatabaseConnection, EntityTrait, IntoActiveModel,
    QueryFilter, QuerySelect, Set, TransactionTrait,
};
use std::path::Path;

use super::{
    responses::shape_post_summaries,
    service::{get_forum_post, get_post, get_post_for_update},
    types::{CreatedForumReply, ForumPostResponse, RemoveForumContentRequest},
};
use crate::{
    channels,
    common::{storage::remove_stored_files, ApiError, AppResult},
    messages as messages_service,
    moderation::{self, ModerationNotice, ModerationRecord},
    notifications::WithNotifications,
};

pub(crate) async fn erase_user_forum_posts<C>(
    database: &C,
    user_id: Uuid,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    let now = Utc::now().fixed_offset();
    forum_posts::Entity::update_many()
        .col_expr(
            forum_posts::Column::Ciphertext,
            Expr::value(None::<Vec<u8>>),
        )
        .col_expr(forum_posts::Column::Iv, Expr::value(None::<Vec<u8>>))
        .col_expr(forum_posts::Column::Tag, Expr::value(None::<Vec<u8>>))
        .col_expr(forum_posts::Column::ModeratedAt, Expr::value(now))
        .col_expr(forum_posts::Column::UpdatedAt, Expr::value(now))
        .filter(forum_posts::Column::UserId.eq(user_id))
        .filter(forum_posts::Column::PollId.is_null())
        .filter(forum_posts::Column::ModeratedAt.is_null())
        .exec(database)
        .await
        .map_err(internal_error)?;
    Ok(())
}

pub(super) async fn remove_forum_post(
    database: &DatabaseConnection,
    upload_root: &Path,
    request: &RemoveForumContentRequest,
) -> AppResult<WithNotifications<ForumPostResponse>> {
    let reason = authorize_removal(database, request).await?;

    let transaction = database.begin().await.map_err(internal_error)?;
    let post =
        get_post_for_update(&transaction, request.channel_id, request.post_id)
            .await?;
    if post.poll_id.is_some() {
        return Err(ApiError::new(
            StatusCode::CONFLICT,
            "Forum posts linked to a proposal cannot be removed.",
        ));
    }

    let (storage_keys, notifications) = if post.moderated_at.is_none() {
        let root_message_id = post.root_message_id;
        let author_id = post.user_id;
        let now = Utc::now().fixed_offset();
        let mut active = post.into_active_model();
        active.ciphertext = Set(None);
        active.iv = Set(None);
        active.tag = Set(None);
        active.moderated_at = Set(Some(now));
        active.updated_at = Set(now);
        active.update(&transaction).await.map_err(internal_error)?;
        let storage_keys =
            messages_service::erase_messages(&transaction, &[root_message_id])
                .await?;
        let moderation_action_id = moderation::record_action(
            &transaction,
            ModerationRecord::direct(
                request.actor_user_id,
                ModerationAction::RemoveForumPost,
                ModerationTargetKind::ForumPost,
                request.post_id,
                Some(request.server_id),
                reason,
            )
            .with_channel(request.channel_id)
            .with_target_label("Forum post"),
        )
        .await?;
        let notifications = moderation::notify_moderated_user(
            &transaction,
            ModerationNotice {
                kind: NotificationKind::ForumPostRemoved,
                server_id: request.server_id,
                channel_id: Some(request.channel_id),
                moderation_action_id,
                actor_user_id: request.actor_user_id,
                recipient_user_id: author_id,
            },
        )
        .await?;
        (storage_keys, notifications)
    } else {
        (vec![], vec![])
    };
    transaction.commit().await.map_err(internal_error)?;
    remove_stored_files(upload_root, &storage_keys).await;

    let post = get_forum_post(
        database,
        request.channel_id,
        request.post_id,
        Some(request.actor_user_id),
    )
    .await?;
    Ok(WithNotifications::new(post, notifications))
}

pub(super) async fn remove_forum_reply(
    database: &DatabaseConnection,
    upload_root: &Path,
    request: &RemoveForumContentRequest,
    reply_id: Uuid,
) -> AppResult<WithNotifications<CreatedForumReply>> {
    let reason = authorize_removal(database, request).await?;

    let transaction = database.begin().await.map_err(internal_error)?;
    let post =
        get_post_for_update(&transaction, request.channel_id, request.post_id)
            .await?;
    let reply = messages::Entity::find_by_id(reply_id)
        .filter(messages::Column::ChannelId.eq(request.channel_id))
        .filter(messages::Column::ThreadRootId.eq(post.root_message_id))
        .lock_exclusive()
        .one(&transaction)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Reply not found.")
        })?;

    let (storage_keys, notifications) = if reply.moderated_at.is_none() {
        let storage_keys =
            messages_service::erase_messages(&transaction, &[reply.id]).await?;
        let moderation_action_id = moderation::record_action(
            &transaction,
            ModerationRecord::direct(
                request.actor_user_id,
                ModerationAction::RemoveMessage,
                ModerationTargetKind::Message,
                reply.id,
                Some(request.server_id),
                reason,
            )
            .with_channel(request.channel_id)
            .with_target_label("Forum reply"),
        )
        .await?;
        let notifications = moderation::notify_moderated_user(
            &transaction,
            ModerationNotice {
                kind: NotificationKind::MessageRemoved,
                server_id: request.server_id,
                channel_id: Some(request.channel_id),
                moderation_action_id,
                actor_user_id: request.actor_user_id,
                recipient_user_id: reply.user_id,
            },
        )
        .await?;
        (storage_keys, notifications)
    } else {
        (vec![], vec![])
    };
    transaction.commit().await.map_err(internal_error)?;
    remove_stored_files(upload_root, &storage_keys).await;

    let reply = messages::Entity::find_by_id(reply_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Reply not found.")
        })?;
    let reply = messages_service::shape_messages(database, vec![reply])
        .await?
        .into_iter()
        .next()
        .ok_or_else(|| internal_error("removed reply was not shaped"))?;
    let post = get_post(database, request.channel_id, request.post_id).await?;
    let summary = shape_post_summaries(database, vec![post])
        .await?
        .into_iter()
        .next()
        .ok_or_else(|| internal_error("forum post was not shaped"))?;

    Ok(WithNotifications::new(
        CreatedForumReply { reply, summary },
        notifications,
    ))
}

async fn authorize_removal(
    database: &DatabaseConnection,
    request: &RemoveForumContentRequest,
) -> AppResult<Option<String>> {
    moderation::can_moderate_content(
        database,
        request.actor_user_id,
        request.server_id,
    )
    .await?;
    let reason = moderation::normalize_reason(request.reason.as_deref(), true)?;
    let channel =
        channels::get_channel(database, request.server_id, request.channel_id)
            .await?;
    if channel.channel_type != ChannelType::Forum {
        return Err(ApiError::new(
            StatusCode::NOT_FOUND,
            "Forum channel not found.",
        ));
    }
    Ok(reason)
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("forum moderation failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
