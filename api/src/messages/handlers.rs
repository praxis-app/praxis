use axum::{
    extract::{Path, Query, State},
    http::Response,
    response::Json,
};
use sea_orm::DatabaseConnection;
use std::{path::PathBuf, sync::Arc};

use super::{
    moderation, service,
    types::{
        CallMessageImagePath, CallMessagePath, CreateCallMessageContext,
        CreateMessageRequest, CreateReplyContext, CreateReplyRequest,
        ListRepliesPage, ListRepliesQuery, MessageImagePath, MessagePath,
        MessagePayload, RemoveMessageRequest, ThreadPath, ThreadResponse,
    },
};
use crate::{
    auth::{AuthenticatedUser, AuthenticatedUserOptional, HasJwtSecret},
    calls::extractors::CallWriteContext,
    channels::{
        self,
        extractors::{CanReadChannelContext, ChannelWriteContext},
    },
    common::{
        images::safe_image_response,
        request::{parse_uuid, JsonOrMultipartFiles},
        storage::upload_root,
        AppResult,
    },
    invites::InviteAccessToken,
    moderation::ModerationReasonRequest,
    notifications,
    pub_sub::PubSubService,
};

#[derive(Clone, Debug)]
pub(super) struct ChatState {
    pub(super) database: DatabaseConnection,
    jwt_secret: Arc<str>,
    pub_sub_service: PubSubService,
    upload_root: Arc<PathBuf>,
}

impl ChatState {
    pub(super) fn new(
        database: DatabaseConnection,
        jwt_secret: String,
        pub_sub_service: PubSubService,
    ) -> Self {
        Self {
            database,
            pub_sub_service,
            jwt_secret: Arc::<str>::from(jwt_secret),
            upload_root: Arc::new(upload_root()),
        }
    }
}

impl HasJwtSecret for ChatState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

impl channels::extractors::HasDatabase for ChatState {
    fn database(&self) -> &DatabaseConnection {
        &self.database
    }
}

pub(super) async fn create_message(
    State(chat_state): State<ChatState>,
    context: ChannelWriteContext,
    multipart: JsonOrMultipartFiles<CreateMessageRequest>,
) -> AppResult<Json<MessagePayload>> {
    let (payload, images) = multipart.into_payload_and_files();
    let created = service::create_message(
        &chat_state.database,
        &chat_state.upload_root,
        context.server_id,
        context.channel_id,
        context.user_id,
        payload,
        images,
    )
    .await?;
    if let Err(error) = service::broadcast_message(
        &chat_state.database,
        &chat_state.pub_sub_service,
        context.server_id,
        context.channel_id,
        context.user_id,
        &created.value,
    )
    .await
    {
        tracing::warn!("failed to broadcast created message: {error}");
    }
    notifications::publish_notifications(
        &chat_state.database,
        &chat_state.pub_sub_service,
        &created.notifications,
    )
    .await;

    Ok(Json(MessagePayload {
        message: created.value,
    }))
}

pub(super) async fn list_replies(
    State(chat_state): State<ChatState>,
    context: CanReadChannelContext,
    Path(path): Path<ThreadPath>,
    Query(query): Query<ListRepliesQuery>,
) -> AppResult<Json<ThreadResponse>> {
    let thread = service::list_replies(
        &chat_state.database,
        context.server_id,
        context.channel_id,
        path.root_message_id,
        ListRepliesPage {
            before: query.before,
            after: query.after,
            around: query
                .around
                .as_deref()
                .map(|value| parse_uuid(value, "around"))
                .transpose()?,
            limit: query.limit.unwrap_or(50).min(100),
        },
    )
    .await?;

    Ok(Json(thread))
}

pub(super) async fn create_reply(
    State(chat_state): State<ChatState>,
    context: ChannelWriteContext,
    Path(path): Path<ThreadPath>,
    multipart: JsonOrMultipartFiles<CreateReplyRequest>,
) -> AppResult<Json<MessagePayload>> {
    let (payload, images) = multipart.into_payload_and_files();
    let created = service::create_reply(
        &chat_state.database,
        &chat_state.upload_root,
        CreateReplyContext {
            server_id: context.server_id,
            channel_id: context.channel_id,
            root_message_id: path.root_message_id,
            user_id: context.user_id,
        },
        payload,
        images,
    )
    .await?;
    if let Err(error) = service::broadcast_reply(
        &chat_state.database,
        &chat_state.pub_sub_service,
        context.server_id,
        context.channel_id,
        &created.value,
    )
    .await
    {
        tracing::warn!("failed to broadcast created thread reply: {error}");
    }
    notifications::publish_notifications(
        &chat_state.database,
        &chat_state.pub_sub_service,
        &created.notifications,
    )
    .await;

    Ok(Json(MessagePayload {
        message: created.value.reply,
    }))
}

pub(super) async fn create_call_message(
    State(chat_state): State<ChatState>,
    context: CallWriteContext,
    multipart: JsonOrMultipartFiles<CreateMessageRequest>,
) -> AppResult<Json<MessagePayload>> {
    let (payload, images) = multipart.into_payload_and_files();
    let message = service::create_call_message(
        &chat_state.database,
        &chat_state.upload_root,
        CreateCallMessageContext {
            server_id: context.server_id,
            channel_id: context.channel_id,
            call_id: context.call_id,
            user_id: context.user_id,
        },
        payload,
        images,
    )
    .await?;
    if let Err(error) = service::broadcast_message_to_call(
        &chat_state.database,
        &chat_state.pub_sub_service,
        context.server_id,
        context.channel_id,
        context.call_id,
        context.user_id,
        &message,
    )
    .await
    {
        tracing::warn!("failed to broadcast created call message: {error}");
    }

    Ok(Json(MessagePayload { message }))
}

pub(super) async fn get_message_image(
    State(chat_state): State<ChatState>,
    Path(path): Path<MessageImagePath>,
    AuthenticatedUserOptional(user_id): AuthenticatedUserOptional,
    InviteAccessToken(invite_token): InviteAccessToken,
) -> AppResult<Response<axum::body::Body>> {
    let image = service::get_message_image(
        &chat_state.database,
        &chat_state.upload_root,
        path,
        user_id,
        invite_token.as_deref(),
    )
    .await?;
    safe_image_response(image.bytes)
}

pub(super) async fn get_call_message_image(
    State(chat_state): State<ChatState>,
    Path(path): Path<CallMessageImagePath>,
    AuthenticatedUserOptional(user_id): AuthenticatedUserOptional,
    InviteAccessToken(invite_token): InviteAccessToken,
) -> AppResult<Response<axum::body::Body>> {
    let image = service::get_call_message_image(
        &chat_state.database,
        &chat_state.upload_root,
        path,
        user_id,
        invite_token.as_deref(),
    )
    .await?;
    safe_image_response(image.bytes)
}

pub(super) async fn remove_message(
    State(chat_state): State<ChatState>,
    Path(path): Path<MessagePath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    payload: Option<Json<ModerationReasonRequest>>,
) -> AppResult<Json<MessagePayload>> {
    remove_and_broadcast(
        &chat_state,
        RemoveMessageRequest {
            server_id: path.server_id,
            channel_id: path.channel_id,
            call_id: None,
            message_id: path.message_id,
            actor_user_id: user_id,
            reason: payload.and_then(|Json(payload)| payload.reason),
        },
    )
    .await
}

pub(super) async fn remove_call_message(
    State(chat_state): State<ChatState>,
    Path(path): Path<CallMessagePath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    payload: Option<Json<ModerationReasonRequest>>,
) -> AppResult<Json<MessagePayload>> {
    remove_and_broadcast(
        &chat_state,
        RemoveMessageRequest {
            server_id: path.server_id,
            channel_id: path.channel_id,
            call_id: Some(path.call_id),
            message_id: path.message_id,
            actor_user_id: user_id,
            reason: payload.and_then(|Json(payload)| payload.reason),
        },
    )
    .await
}

async fn remove_and_broadcast(
    chat_state: &ChatState,
    request: RemoveMessageRequest,
) -> AppResult<Json<MessagePayload>> {
    let removed = moderation::remove_message(
        &chat_state.database,
        &chat_state.upload_root,
        &request,
    )
    .await?;
    if let Err(error) = moderation::broadcast_removed_message(
        &chat_state.database,
        &chat_state.pub_sub_service,
        &request,
        &removed,
    )
    .await
    {
        tracing::warn!("failed to broadcast removed message: {error}");
    }

    Ok(Json(MessagePayload {
        message: removed.message,
    }))
}
