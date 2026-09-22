//! Translates poll HTTP requests into service calls, shapes HTTP responses, and
//! coordinates request-lifecycle concerns such as broadcasts

use axum::{
    extract::{Path, Query, State},
    http::{Response, StatusCode},
    response::{IntoResponse, Json},
};
use sea_orm::DatabaseConnection;
use std::{path::PathBuf, sync::Arc};

use super::{
    extractors::PollDeleteContext,
    service::{self, PollImageUploads},
    types::{
        ActiveDecisionsResponse, CallDecisionResponse, CreatePollContext,
        CreatePollRequest, DeletePollResponse, ListActiveDecisionsQuery,
        PollActionEventCoverPhotoPath, PollImagePath, PollPath, PollPayload,
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
        request::{parse_uuid, JsonOrMultipartFiles},
        storage::upload_root,
        AppResult,
    },
    invites::InviteAccessToken,
    pub_sub::PubSubService,
    servers::types::ServerPath,
};

use crate::messages::types::{
    CreateReplyRequest, ListRepliesPage, ListRepliesQuery, MessagePayload,
};

#[derive(Clone, Debug)]
pub(crate) struct PollsState {
    pub(crate) database: DatabaseConnection,
    jwt_secret: Arc<str>,
    pub(crate) pub_sub_service: PubSubService,
    upload_root: Arc<PathBuf>,
}

impl PollsState {
    pub(super) fn new(
        database: DatabaseConnection,
        jwt_secret: String,
        pub_sub_service: PubSubService,
    ) -> Self {
        Self {
            database,
            jwt_secret: Arc::<str>::from(jwt_secret),
            pub_sub_service,
            upload_root: Arc::new(upload_root()),
        }
    }
}

impl HasJwtSecret for PollsState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

impl channels::extractors::HasDatabase for PollsState {
    fn database(&self) -> &DatabaseConnection {
        &self.database
    }
}

pub(super) async fn create_poll(
    State(state): State<PollsState>,
    context: ChannelWriteContext,
    multipart: JsonOrMultipartFiles<CreatePollRequest>,
) -> AppResult<Json<PollPayload>> {
    let (payload, cover_photo, images) = multipart.into_parts();
    let created = service::create_poll(
        &state.database,
        &state.upload_root,
        CreatePollContext {
            server_id: context.server_id,
            channel_id: context.channel_id,
            user_id: context.user_id,
        },
        payload,
        PollImageUploads {
            images,
            cover_photo,
        },
    )
    .await?;
    let poll = created.value;

    if let Err(error) = service::broadcast_poll_update(
        &state.database,
        &state.pub_sub_service,
        context.server_id,
        context.channel_id,
        Some(context.user_id),
        poll.id.parse().expect("created poll id is valid"),
    )
    .await
    {
        tracing::warn!("failed to broadcast created poll: {error}");
    }
    crate::notifications::publish_notifications(
        &state.database,
        &state.pub_sub_service,
        &created.notifications,
    )
    .await;

    Ok(Json(PollPayload { poll }))
}

pub(super) async fn list_replies(
    State(state): State<PollsState>,
    context: CanReadChannelContext,
    Path(path): Path<PollPath>,
    Query(query): Query<ListRepliesQuery>,
) -> AppResult<Response<axum::body::Body>> {
    let result = super::replies::list_replies(
        &state.database,
        super::replies::ListRepliesContext {
            server_id: context.server_id,
            channel_id: context.channel_id,
            poll_id: path.poll_id,
            current_user_id: context.user_id,
        },
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
    Ok(match result {
        super::replies::PollThreadLookup::Thread(thread) => {
            Json(thread).into_response()
        }
        super::replies::PollThreadLookup::Moved(moved) => {
            (StatusCode::GONE, Json(moved)).into_response()
        }
    })
}

pub(super) async fn create_reply(
    State(state): State<PollsState>,
    context: ChannelWriteContext,
    Path(path): Path<PollPath>,
    multipart: JsonOrMultipartFiles<CreateReplyRequest>,
) -> AppResult<Json<MessagePayload>> {
    let (payload, images) = multipart.into_payload_and_files();
    let created = super::replies::create_reply(
        &state.database,
        &state.upload_root,
        super::replies::CreateReplyContext {
            server_id: context.server_id,
            channel_id: context.channel_id,
            poll_id: path.poll_id,
            user_id: context.user_id,
        },
        payload,
        images,
    )
    .await?;
    if let Err(error) = super::replies::broadcast_reply(
        &state.database,
        &state.pub_sub_service,
        context.server_id,
        context.channel_id,
        path.poll_id,
        &created.value,
    )
    .await
    {
        tracing::warn!(
            "failed to broadcast created poll thread reply: {error}"
        );
    }
    crate::notifications::publish_notifications(
        &state.database,
        &state.pub_sub_service,
        &created.notifications,
    )
    .await;
    Ok(Json(MessagePayload {
        message: created.value.reply,
    }))
}

pub(super) async fn move_proposal_to_forum(
    State(state): State<PollsState>,
    Path(path): Path<PollPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    Json(payload): Json<crate::forum::types::MoveProposalToForumRequest>,
) -> AppResult<Json<crate::forum::types::MoveProposalToForumResponse>> {
    let result = crate::forum::proposal_moves::move_proposal_to_forum(
        &state.database,
        path.server_id,
        path.channel_id,
        path.poll_id,
        user_id,
        payload,
    )
    .await?;
    let destination_channel_id = result.value.destination_channel_id;

    crate::forum::events::broadcast_proposal_forum_reference(
        &state.database,
        &state.pub_sub_service,
        path.server_id,
        path.channel_id,
        user_id,
        &result.value.source_reference,
    )
    .await;
    crate::forum::events::broadcast_forum_post(
        &state.database,
        &state.pub_sub_service,
        path.server_id,
        destination_channel_id,
        user_id,
        "created",
        &result.value.post,
    )
    .await;
    if let Err(error) = service::broadcast_poll_update(
        &state.database,
        &state.pub_sub_service,
        path.server_id,
        destination_channel_id,
        Some(user_id),
        path.poll_id,
    )
    .await
    {
        tracing::warn!("failed to broadcast moved proposal: {error}");
    }
    crate::notifications::publish_notifications(
        &state.database,
        &state.pub_sub_service,
        &result.notifications,
    )
    .await;

    Ok(Json(result.value))
}

pub(super) async fn create_call_poll(
    State(state): State<PollsState>,
    context: CallWriteContext,
    multipart: JsonOrMultipartFiles<CreatePollRequest>,
) -> AppResult<Json<PollPayload>> {
    let (payload, cover_photo, images) = multipart.into_parts();
    let poll = service::create_call_poll(
        &state.database,
        &state.upload_root,
        CreatePollContext {
            server_id: context.server_id,
            channel_id: context.channel_id,
            user_id: context.user_id,
        },
        context.call_id,
        payload,
        PollImageUploads {
            images,
            cover_photo,
        },
    )
    .await?;

    if let Err(error) = service::broadcast_poll_update(
        &state.database,
        &state.pub_sub_service,
        context.server_id,
        context.channel_id,
        Some(context.user_id),
        poll.id.parse().expect("created poll id is valid"),
    )
    .await
    {
        tracing::warn!("failed to broadcast created in-call poll: {error}");
    }

    Ok(Json(PollPayload { poll }))
}

pub(super) async fn get_call_decision(
    State(state): State<PollsState>,
    context: CallWriteContext,
) -> AppResult<Json<CallDecisionResponse>> {
    let decision = service::get_call_decision(
        &state.database,
        context.server_id,
        context.channel_id,
        context.call_id,
        context.user_id,
    )
    .await?;

    Ok(Json(decision))
}

pub(super) async fn get_active_decisions(
    State(state): State<PollsState>,
    Path(path): Path<ServerPath>,
    AuthenticatedUserOptional(user_id): AuthenticatedUserOptional,
    InviteAccessToken(invite_token): InviteAccessToken,
    Query(query): Query<ListActiveDecisionsQuery>,
) -> AppResult<Json<ActiveDecisionsResponse>> {
    let limit = query.limit.unwrap_or(50).min(100);
    let decisions = service::get_active_decisions(
        &state.database,
        path.server_id,
        user_id,
        invite_token.as_deref(),
        query.before.as_deref(),
        limit,
    )
    .await?;

    Ok(Json(decisions))
}

pub(super) async fn get_poll_action_event_cover_photo(
    State(state): State<PollsState>,
    Path(path): Path<PollActionEventCoverPhotoPath>,
    AuthenticatedUserOptional(user_id): AuthenticatedUserOptional,
    InviteAccessToken(invite_token): InviteAccessToken,
) -> AppResult<Response<axum::body::Body>> {
    let image = service::get_poll_action_event_cover_photo(
        &state.database,
        &state.upload_root,
        path,
        user_id,
        invite_token.as_deref(),
    )
    .await?;

    crate::common::images::safe_image_response(image.bytes)
}

pub(super) async fn get_poll_image(
    State(state): State<PollsState>,
    Path(path): Path<PollImagePath>,
    AuthenticatedUserOptional(user_id): AuthenticatedUserOptional,
    InviteAccessToken(invite_token): InviteAccessToken,
) -> AppResult<Response<axum::body::Body>> {
    let image = service::get_poll_image(
        &state.database,
        &state.upload_root,
        path,
        user_id,
        invite_token.as_deref(),
    )
    .await?;

    crate::common::images::safe_image_response(image.bytes)
}

pub(super) async fn delete_poll(
    State(state): State<PollsState>,
    context: PollDeleteContext,
) -> AppResult<Json<DeletePollResponse>> {
    let result = service::delete_poll(
        &state.database,
        &state.upload_root,
        &context.poll,
    )
    .await?;

    Ok(Json(DeletePollResponse {
        affected: result.rows_affected,
    }))
}
