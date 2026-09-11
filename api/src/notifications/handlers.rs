use axum::{
    extract::{Path, Query, State},
    response::Json,
};
use sea_orm::DatabaseConnection;
use std::sync::Arc;

use super::{
    service,
    types::{
        ListNotificationsQuery, NotificationPath, NotificationPayload,
        NotificationsResponse, UnreadCountResponse,
    },
};
use crate::{
    auth::{AuthenticatedUser, HasJwtSecret},
    common::AppResult,
    servers::types::ServerPath,
};

#[derive(Clone, Debug)]
pub(super) struct NotificationsState {
    database: DatabaseConnection,
    jwt_secret: Arc<str>,
}

impl NotificationsState {
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

impl HasJwtSecret for NotificationsState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

pub(super) async fn list_notifications(
    State(state): State<NotificationsState>,
    Path(path): Path<ServerPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    Query(query): Query<ListNotificationsQuery>,
) -> AppResult<Json<NotificationsResponse>> {
    service::list_notifications(&state.database, path.server_id, user_id, query)
        .await
        .map(Json)
}

pub(super) async fn get_unread_count(
    State(state): State<NotificationsState>,
    Path(path): Path<ServerPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
) -> AppResult<Json<UnreadCountResponse>> {
    service::get_unread_count(&state.database, path.server_id, user_id)
        .await
        .map(Json)
}

pub(super) async fn mark_read(
    State(state): State<NotificationsState>,
    Path(path): Path<NotificationPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
) -> AppResult<Json<NotificationPayload>> {
    set_read_state(state, path, user_id, true).await
}

pub(super) async fn mark_unread(
    State(state): State<NotificationsState>,
    Path(path): Path<NotificationPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
) -> AppResult<Json<NotificationPayload>> {
    set_read_state(state, path, user_id, false).await
}

pub(super) async fn mark_all_read(
    State(state): State<NotificationsState>,
    Path(path): Path<ServerPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
) -> AppResult<Json<UnreadCountResponse>> {
    service::mark_all_read(&state.database, path.server_id, user_id)
        .await
        .map(Json)
}

pub(super) async fn delete_notification(
    State(state): State<NotificationsState>,
    Path(path): Path<NotificationPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
) -> AppResult<Json<serde_json::Value>> {
    service::delete_notification(
        &state.database,
        path.server_id,
        user_id,
        path.notification_id,
    )
    .await
    .map(|_| Json(serde_json::json!({ "success": true })))
}

pub(super) async fn clear_notifications(
    State(state): State<NotificationsState>,
    Path(path): Path<ServerPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
) -> AppResult<Json<serde_json::Value>> {
    service::clear_notifications(&state.database, path.server_id, user_id)
        .await
        .map(|_| Json(serde_json::json!({ "success": true })))
}

async fn set_read_state(
    state: NotificationsState,
    path: NotificationPath,
    user_id: sea_orm::prelude::Uuid,
    read: bool,
) -> AppResult<Json<NotificationPayload>> {
    service::set_read_state(
        &state.database,
        path.server_id,
        user_id,
        path.notification_id,
        read,
    )
    .await
    .map(|change| Json(NotificationPayload::from(change)))
}
