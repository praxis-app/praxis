use axum::{
    extract::{Path, Query, State},
    response::Json,
};
use sea_orm::DatabaseConnection;
use std::{path::PathBuf, sync::Arc};

use super::{
    events,
    extractors::{
        ForumAccessContext, ForumPostAccessContext, ForumPostReadContext,
        ForumReadContext, ForumReplyAccessContext,
    },
    moderation, service,
    types::{
        CreateForumPostRequest, CreateForumProposalContext,
        CreateForumReplyRequest, ForumPostContextResponse, ForumPostPath,
        ForumPostPayload, ForumPostsResponse, ForumReplyPath,
        ForumReplyPayload, ListForumPostsQuery, ListForumRepliesQuery,
        RemoveForumContentRequest, UpdateForumPostRequest,
    },
};
use crate::{
    auth::{AuthenticatedUser, HasJwtSecret},
    channels::extractors::HasDatabase,
    common::{
        request::{parse_uuid, JsonOrMultipartFiles},
        response::EmptyResponse,
        storage::upload_root,
        AppResult,
    },
    messages::types::ListRepliesPage,
    moderation::ModerationReasonRequest,
    polls::{self, service::PollImageUploads, types::CreatePollRequest},
    pub_sub::PubSubService,
};

#[derive(Clone, Debug)]
pub(super) struct ForumState {
    database: DatabaseConnection,
    jwt_secret: Arc<str>,
    pub_sub_service: PubSubService,
    upload_root: Arc<PathBuf>,
}

impl ForumState {
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

impl HasJwtSecret for ForumState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

impl HasDatabase for ForumState {
    fn database(&self) -> &DatabaseConnection {
        &self.database
    }
}

pub(super) async fn list_forum_posts(
    State(state): State<ForumState>,
    context: ForumReadContext,
    Query(query): Query<ListForumPostsQuery>,
) -> AppResult<Json<ForumPostsResponse>> {
    let limit = query.limit.unwrap_or(50).min(100);
    let posts = service::list_forum_posts(
        &state.database,
        context.channel_id,
        query.sort.as_deref(),
        query.status.as_deref(),
        query.before.as_deref(),
        limit,
    )
    .await?;
    Ok(Json(posts))
}

pub(super) async fn create_forum_post(
    State(state): State<ForumState>,
    context: ForumAccessContext,
    multipart: JsonOrMultipartFiles<CreateForumPostRequest>,
) -> AppResult<Json<ForumPostPayload>> {
    let (payload, cover_photo, images) = multipart.into_parts();
    let created = service::create_forum_post(
        &state.database,
        &state.upload_root,
        context.server_id,
        context.channel_id,
        context.user_id,
        payload,
        PollImageUploads {
            images,
            cover_photo,
        },
    )
    .await?;
    let post = created.value;
    let proposal_id = post
        .proposal
        .as_ref()
        .and_then(|proposal| proposal.id.parse().ok());
    events::broadcast_forum_post(
        &state.database,
        &state.pub_sub_service,
        context.server_id,
        context.channel_id,
        context.user_id,
        "created",
        &post,
    )
    .await;
    if let Some(proposal_id) = proposal_id {
        if let Err(error) = polls::service::broadcast_poll_update(
            &state.database,
            &state.pub_sub_service,
            context.server_id,
            context.channel_id,
            Some(context.user_id),
            proposal_id,
        )
        .await
        {
            tracing::warn!("failed to broadcast forum proposal: {error}");
        }
    }
    crate::notifications::publish_notifications(
        &state.database,
        &state.pub_sub_service,
        &created.notifications,
    )
    .await;
    Ok(Json(ForumPostPayload { post }))
}

pub(super) async fn create_forum_post_proposal(
    State(state): State<ForumState>,
    context: ForumPostAccessContext,
    multipart: JsonOrMultipartFiles<CreatePollRequest>,
) -> AppResult<Json<ForumPostPayload>> {
    let (payload, cover_photo, images) = multipart.into_parts();
    let created = service::create_forum_post_proposal(
        &state.database,
        &state.upload_root,
        CreateForumProposalContext {
            server_id: context.server_id,
            channel_id: context.channel_id,
            post_id: context.post_id,
            user_id: context.user_id,
        },
        payload,
        PollImageUploads {
            images,
            cover_photo,
        },
    )
    .await?;
    let post = created.value;
    events::broadcast_forum_post(
        &state.database,
        &state.pub_sub_service,
        context.server_id,
        context.channel_id,
        context.user_id,
        "updated",
        &post,
    )
    .await;
    if let Some(proposal_id) = post
        .proposal
        .as_ref()
        .and_then(|proposal| proposal.id.parse().ok())
    {
        if let Err(error) = polls::service::broadcast_poll_update(
            &state.database,
            &state.pub_sub_service,
            context.server_id,
            context.channel_id,
            Some(context.user_id),
            proposal_id,
        )
        .await
        {
            tracing::warn!("failed to broadcast forum proposal: {error}");
        }
    }
    crate::notifications::publish_notifications(
        &state.database,
        &state.pub_sub_service,
        &created.notifications,
    )
    .await;
    Ok(Json(ForumPostPayload { post }))
}

pub(super) async fn list_forum_post_replies(
    State(state): State<ForumState>,
    context: ForumPostReadContext,
    Query(query): Query<ListForumRepliesQuery>,
) -> AppResult<Json<ForumPostContextResponse>> {
    let context_page = service::get_forum_post_replies(
        &state.database,
        context.channel_id,
        context.post_id,
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
        context.user_id,
    )
    .await?;

    Ok(Json(context_page))
}

pub(super) async fn update_forum_post(
    State(state): State<ForumState>,
    context: ForumPostAccessContext,
    Json(payload): Json<UpdateForumPostRequest>,
) -> AppResult<Json<ForumPostPayload>> {
    let post = service::update_forum_post(
        &state.database,
        context.channel_id,
        context.post_id,
        context.user_id,
        payload,
    )
    .await?;
    events::broadcast_forum_post(
        &state.database,
        &state.pub_sub_service,
        context.server_id,
        context.channel_id,
        context.user_id,
        "updated",
        &post,
    )
    .await;
    Ok(Json(ForumPostPayload { post }))
}

pub(super) async fn close_forum_post(
    State(state): State<ForumState>,
    context: ForumPostAccessContext,
) -> AppResult<Json<ForumPostPayload>> {
    let post = service::close_forum_post(
        &state.database,
        context.channel_id,
        context.post_id,
        context.user_id,
    )
    .await?;
    events::broadcast_forum_post(
        &state.database,
        &state.pub_sub_service,
        context.server_id,
        context.channel_id,
        context.user_id,
        "closed",
        &post,
    )
    .await;
    Ok(Json(ForumPostPayload { post }))
}

pub(super) async fn reopen_forum_post(
    State(state): State<ForumState>,
    context: ForumPostAccessContext,
) -> AppResult<Json<ForumPostPayload>> {
    let post = service::reopen_forum_post(
        &state.database,
        context.channel_id,
        context.post_id,
        context.user_id,
    )
    .await?;
    events::broadcast_forum_post(
        &state.database,
        &state.pub_sub_service,
        context.server_id,
        context.channel_id,
        context.user_id,
        "reopened",
        &post,
    )
    .await;
    Ok(Json(ForumPostPayload { post }))
}

pub(super) async fn create_forum_reply(
    State(state): State<ForumState>,
    context: ForumPostAccessContext,
    multipart: JsonOrMultipartFiles<CreateForumReplyRequest>,
) -> AppResult<Json<ForumReplyPayload>> {
    let (payload, images) = multipart.into_payload_and_files();
    let created = service::create_forum_reply(
        &state.database,
        &state.upload_root,
        context.channel_id,
        context.post_id,
        context.user_id,
        payload,
        images,
    )
    .await?;
    events::broadcast_forum_reply(
        &state.database,
        &state.pub_sub_service,
        context.server_id,
        context.channel_id,
        context.user_id,
        "created",
        context.post_id,
        Some(&created.value.reply),
        None,
        &created.value.summary,
    )
    .await;
    crate::notifications::publish_notifications(
        &state.database,
        &state.pub_sub_service,
        &created.notifications,
    )
    .await;
    Ok(Json(ForumReplyPayload {
        reply: created.value.reply,
    }))
}

pub(super) async fn delete_forum_reply(
    State(state): State<ForumState>,
    context: ForumReplyAccessContext,
) -> AppResult<Json<EmptyResponse>> {
    let post = service::delete_forum_reply(
        &state.database,
        context.channel_id,
        context.post_id,
        context.reply_id,
        context.user_id,
    )
    .await?;
    events::broadcast_forum_reply(
        &state.database,
        &state.pub_sub_service,
        context.server_id,
        context.channel_id,
        context.user_id,
        "deleted",
        context.post_id,
        None,
        Some(context.reply_id),
        &post,
    )
    .await;
    Ok(Json(EmptyResponse {}))
}

pub(super) async fn remove_forum_post(
    State(state): State<ForumState>,
    Path(path): Path<ForumPostPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    payload: Option<Json<ModerationReasonRequest>>,
) -> AppResult<Json<ForumPostPayload>> {
    let request = RemoveForumContentRequest {
        server_id: path.server_id,
        channel_id: path.channel_id,
        post_id: path.post_id,
        actor_user_id: user_id,
        reason: payload.and_then(|Json(payload)| payload.reason),
    };
    let post = moderation::remove_forum_post(
        &state.database,
        &state.upload_root,
        &request,
    )
    .await?;
    events::broadcast_forum_post(
        &state.database,
        &state.pub_sub_service,
        request.server_id,
        request.channel_id,
        user_id,
        "removed",
        &post,
    )
    .await;
    Ok(Json(ForumPostPayload { post }))
}

pub(super) async fn remove_forum_reply(
    State(state): State<ForumState>,
    Path(path): Path<ForumReplyPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    payload: Option<Json<ModerationReasonRequest>>,
) -> AppResult<Json<ForumReplyPayload>> {
    let request = RemoveForumContentRequest {
        server_id: path.server_id,
        channel_id: path.channel_id,
        post_id: path.post_id,
        actor_user_id: user_id,
        reason: payload.and_then(|Json(payload)| payload.reason),
    };
    let removed = moderation::remove_forum_reply(
        &state.database,
        &state.upload_root,
        &request,
        path.reply_id,
    )
    .await?;
    events::broadcast_forum_reply(
        &state.database,
        &state.pub_sub_service,
        request.server_id,
        request.channel_id,
        user_id,
        "removed",
        request.post_id,
        Some(&removed.reply),
        Some(path.reply_id),
        &removed.summary,
    )
    .await;
    Ok(Json(ForumReplyPayload {
        reply: removed.reply,
    }))
}
