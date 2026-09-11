use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
};
use sea_orm::DatabaseConnection;
use std::sync::Arc;

use super::{
    extractors::{
        CanManageChannelContext, CanManageContext, CanReadChannelContext,
        HasDatabase, IsServerAudienceContext,
    },
    service,
    types::{
        ChannelOrderRequest, ChannelPath, ChannelPayload, ChannelRequest,
        ChannelsPayload, ServerPath, UnreadChannelsPayload,
    },
};
use crate::{
    auth::{AuthenticatedUser, HasJwtSecret},
    common::{response::EmptyResponse, AppResult},
};

#[derive(Clone, Debug)]
pub(super) struct ChannelsState {
    database: DatabaseConnection,
    jwt_secret: Arc<str>,
}

impl ChannelsState {
    pub(super) fn new(
        database: DatabaseConnection,
        jwt_secret: String,
    ) -> Self {
        Self {
            database,
            jwt_secret: Arc::<str>::from(jwt_secret),
        }
    }
}

impl HasJwtSecret for ChannelsState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

impl HasDatabase for ChannelsState {
    fn database(&self) -> &DatabaseConnection {
        &self.database
    }
}

pub(super) async fn create_channel(
    State(state): State<ChannelsState>,
    context: CanManageContext,
    Json(payload): Json<ChannelRequest>,
) -> AppResult<Json<ChannelPayload>> {
    let channel =
        service::create_channel(&state.database, context.server_id, payload)
            .await?;
    Ok(Json(ChannelPayload { channel }))
}

pub(super) async fn update_channel(
    State(state): State<ChannelsState>,
    context: CanManageChannelContext,
    Json(payload): Json<ChannelRequest>,
) -> AppResult<Json<EmptyResponse>> {
    service::update_channel(
        &state.database,
        context.server_id,
        context.channel_id,
        payload,
    )
    .await?;
    Ok(Json(EmptyResponse {}))
}

pub(super) async fn update_channel_order(
    State(state): State<ChannelsState>,
    context: CanManageContext,
    Json(payload): Json<ChannelOrderRequest>,
) -> AppResult<StatusCode> {
    service::update_channel_order(&state.database, context.server_id, payload)
        .await?;
    Ok(StatusCode::NO_CONTENT)
}

pub(super) async fn delete_channel(
    State(state): State<ChannelsState>,
    context: CanManageChannelContext,
) -> AppResult<Json<EmptyResponse>> {
    service::delete_channel(
        &state.database,
        context.server_id,
        context.channel_id,
    )
    .await?;
    Ok(Json(EmptyResponse {}))
}

pub(super) async fn get_channels(
    State(state): State<ChannelsState>,
    context: IsServerAudienceContext,
) -> AppResult<Json<ChannelsPayload>> {
    let channels =
        service::get_channels(&state.database, context.server_id).await?;
    Ok(Json(ChannelsPayload { channels }))
}

pub(super) async fn get_joined_channels(
    State(state): State<ChannelsState>,
    Path(path): Path<ServerPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
) -> AppResult<Json<ChannelsPayload>> {
    let channels =
        service::get_joined_channels(&state.database, path.server_id, user_id)
            .await?;
    Ok(Json(ChannelsPayload { channels }))
}

pub(super) async fn get_unread_channels(
    State(state): State<ChannelsState>,
    Path(path): Path<ServerPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
) -> AppResult<Json<UnreadChannelsPayload>> {
    let channel_ids = service::get_unread_channel_ids(
        &state.database,
        path.server_id,
        user_id,
    )
    .await?;
    Ok(Json(UnreadChannelsPayload {
        channel_ids: channel_ids
            .into_iter()
            .map(|channel_id| channel_id.to_string())
            .collect(),
    }))
}

pub(super) async fn mark_channel_read(
    State(state): State<ChannelsState>,
    Path(path): Path<ChannelPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
) -> AppResult<Json<EmptyResponse>> {
    service::mark_channel_read(&state.database, path.channel_id, user_id)
        .await?;
    Ok(Json(EmptyResponse {}))
}

pub(super) async fn get_channel(
    State(state): State<ChannelsState>,
    context: CanReadChannelContext,
) -> AppResult<Json<ChannelPayload>> {
    let channel = service::get_channel_with_server(
        &state.database,
        context.server_id,
        context.channel_id,
    )
    .await?;
    Ok(Json(ChannelPayload { channel }))
}
