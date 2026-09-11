use axum::{
    extract::{Path, Query, State},
    http::Response,
    response::Json,
};
use sea_orm::DatabaseConnection;
use std::{path::PathBuf, sync::Arc};

use super::{
    service,
    types::{
        EventCoverPhotoPath, EventPath, EventPayload, EventsResponse,
        ListEventsQuery, UpsertEventRsvpRequest,
    },
};
use crate::{
    auth::{AuthenticatedUser, AuthenticatedUserOptional, HasJwtSecret},
    common::AppResult,
    invites::InviteAccessToken,
};

#[derive(Clone, Debug)]
pub(super) struct EventsState {
    database: DatabaseConnection,
    jwt_secret: Arc<str>,
    upload_root: Arc<PathBuf>,
}

impl EventsState {
    pub(super) fn new(
        database: DatabaseConnection,
        jwt_secret: String,
    ) -> Self {
        Self {
            database,
            jwt_secret: Arc::<str>::from(jwt_secret),
            upload_root: Arc::new(crate::common::storage::upload_root()),
        }
    }
}

impl HasJwtSecret for EventsState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

pub(super) async fn list_events(
    State(state): State<EventsState>,
    Path(path): Path<crate::servers::types::ServerPath>,
    AuthenticatedUserOptional(user_id): AuthenticatedUserOptional,
    InviteAccessToken(invite_token): InviteAccessToken,
    Query(query): Query<ListEventsQuery>,
) -> AppResult<Json<EventsResponse>> {
    service::list_events(
        &state.database,
        path.server_id,
        user_id,
        invite_token.as_deref(),
        query,
    )
    .await
    .map(Json)
}

pub(super) async fn get_event(
    State(state): State<EventsState>,
    Path(path): Path<EventPath>,
    AuthenticatedUserOptional(user_id): AuthenticatedUserOptional,
    InviteAccessToken(invite_token): InviteAccessToken,
) -> AppResult<Json<EventPayload>> {
    service::get_event(
        &state.database,
        path.server_id,
        path.event_id,
        user_id,
        invite_token.as_deref(),
    )
    .await
    .map(|event| Json(EventPayload { event }))
}

pub(super) async fn upsert_rsvp(
    State(state): State<EventsState>,
    Path(path): Path<EventPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    Json(payload): Json<UpsertEventRsvpRequest>,
) -> AppResult<Json<EventPayload>> {
    service::upsert_rsvp(
        &state.database,
        path.server_id,
        path.event_id,
        user_id,
        payload.status,
    )
    .await
    .map(|event| Json(EventPayload { event }))
}

pub(super) async fn clear_rsvp(
    State(state): State<EventsState>,
    Path(path): Path<EventPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
) -> AppResult<Json<EventPayload>> {
    service::clear_rsvp(&state.database, path.server_id, path.event_id, user_id)
        .await
        .map(|event| Json(EventPayload { event }))
}

pub(super) async fn get_event_cover_photo(
    State(state): State<EventsState>,
    Path(path): Path<EventCoverPhotoPath>,
    AuthenticatedUserOptional(user_id): AuthenticatedUserOptional,
    InviteAccessToken(invite_token): InviteAccessToken,
) -> AppResult<Response<axum::body::Body>> {
    let image = service::get_event_cover_photo(
        &state.database,
        &state.upload_root,
        path.server_id,
        path.event_id,
        path.image_id,
        user_id,
        invite_token.as_deref(),
    )
    .await?;

    crate::common::images::safe_image_response(image.bytes)
}
