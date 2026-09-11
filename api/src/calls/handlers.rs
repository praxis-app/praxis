use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    response::Json,
};
use sea_orm::DatabaseConnection;
use std::sync::Arc;

use super::{
    livekit::LiveKitConfig,
    service,
    types::{CallPath, CallPayload, JoinCallResponse},
};
use crate::{
    auth::HasJwtSecret,
    channels::extractors::{ChannelWriteContext, HasDatabase},
    common::{ApiError, AppResult},
    pub_sub::PubSubService,
};

#[derive(Clone, Debug)]
pub(crate) struct CallsState {
    database: DatabaseConnection,
    jwt_secret: Arc<str>,
    pub_sub_service: Option<PubSubService>,
    livekit: Option<LiveKitConfig>,
}

impl CallsState {
    pub(crate) fn new(
        database: DatabaseConnection,
        jwt_secret: String,
        pub_sub_service: Option<PubSubService>,
        livekit: Option<LiveKitConfig>,
    ) -> Self {
        Self {
            database,
            jwt_secret: Arc::<str>::from(jwt_secret),
            livekit,
            pub_sub_service,
        }
    }
}

impl HasJwtSecret for CallsState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

impl HasDatabase for CallsState {
    fn database(&self) -> &DatabaseConnection {
        &self.database
    }
}

pub(crate) async fn start_call(
    State(state): State<CallsState>,
    context: ChannelWriteContext,
) -> AppResult<Json<JoinCallResponse>> {
    let livekit = livekit_config(&state)?;

    let response = service::start_channel_call(
        &state.database,
        livekit,
        context.server_id,
        context.channel_id,
        context.user_id,
    )
    .await?;

    if let Ok(call_id) = response.call.id.parse() {
        match service::get_channel_call_artifact(
            &state.database,
            context.server_id,
            context.channel_id,
            call_id,
        )
        .await
        {
            Ok(call) => {
                if let Err(error) = service::broadcast_call(
                    &state.database,
                    state.pub_sub_service.as_ref(),
                    context.server_id,
                    context.channel_id,
                    Some(context.user_id),
                    &call,
                )
                .await
                {
                    tracing::warn!("failed to broadcast started call: {error}");
                }
            }
            Err(error) => {
                tracing::warn!("failed to load started call artifact: {error}");
            }
        }
    }

    Ok(Json(response))
}

pub(crate) async fn join_call(
    State(state): State<CallsState>,
    Path(path): Path<CallPath>,
    context: ChannelWriteContext,
) -> AppResult<Json<JoinCallResponse>> {
    let livekit = livekit_config(&state)?;

    let response = service::join_channel_call(
        &state.database,
        livekit,
        context.server_id,
        context.channel_id,
        path.call_id,
        context.user_id,
    )
    .await?;

    Ok(Json(response))
}

pub(crate) async fn leave_call(
    State(state): State<CallsState>,
    Path(path): Path<CallPath>,
    context: ChannelWriteContext,
) -> AppResult<Json<CallPayload>> {
    let livekit = livekit_config(&state)?;

    let call = service::leave_channel_call(
        &state.database,
        livekit,
        context.server_id,
        context.channel_id,
        path.call_id,
        context.user_id,
    )
    .await?;

    if call.status == "ended" || call.status == "failed" {
        match service::get_channel_call_artifact(
            &state.database,
            context.server_id,
            context.channel_id,
            path.call_id,
        )
        .await
        {
            Ok(call) => {
                if let Err(error) = service::broadcast_call(
                    &state.database,
                    state.pub_sub_service.as_ref(),
                    context.server_id,
                    context.channel_id,
                    Some(context.user_id),
                    &call,
                )
                .await
                {
                    tracing::warn!("failed to broadcast ended call: {error}");
                }
            }
            Err(error) => {
                tracing::warn!("failed to load ended call artifact: {error}");
            }
        }
    }

    Ok(Json(CallPayload { call }))
}

// TODO: Rename to handle_livekit_webhook
pub(crate) async fn livekit_webhook(
    State(state): State<CallsState>,
    headers: HeaderMap,
    body: String,
) -> AppResult<StatusCode> {
    if state.livekit.is_none() {
        return Ok(StatusCode::NO_CONTENT);
    }

    let livekit = livekit_config(&state)?;
    let authorization = headers
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .ok_or_else(|| {
            ApiError::new(StatusCode::UNAUTHORIZED, "Missing authorization.")
        })?;

    service::handle_livekit_webhook(
        &state.database,
        livekit,
        &body,
        authorization,
    )
    .await?;

    // TODO: Broadcast an updated call artifact when the webhook ends a call so
    // open channel feeds do not show stale active-call state until refresh
    Ok(StatusCode::NO_CONTENT)
}

fn livekit_config(state: &CallsState) -> AppResult<&LiveKitConfig> {
    state.livekit.as_ref().ok_or_else(|| {
        ApiError::new(
            StatusCode::SERVICE_UNAVAILABLE,
            "LiveKit is not configured.",
        )
    })
}
