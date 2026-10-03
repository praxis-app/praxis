use axum::{
    extract::{Path, Query, State},
    response::Json,
};
use sea_orm::DatabaseConnection;
use std::sync::Arc;

use super::{
    service,
    types::{AuditLogQuery, AuditLogResponse},
};
use crate::{
    auth::{AuthenticatedUser, HasJwtSecret},
    common::AppResult,
    servers::types::ServerPath,
};

#[derive(Clone, Debug)]
pub(super) struct AuditLogState {
    database: DatabaseConnection,
    jwt_secret: Arc<str>,
}

impl AuditLogState {
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

impl HasJwtSecret for AuditLogState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

pub(super) async fn get_instance_audit_log(
    State(state): State<AuditLogState>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    Query(query): Query<AuditLogQuery>,
) -> AppResult<Json<AuditLogResponse>> {
    let response =
        service::get_audit_log(&state.database, user_id, None, query).await?;
    Ok(Json(response))
}

pub(super) async fn get_server_audit_log(
    State(state): State<AuditLogState>,
    Path(path): Path<ServerPath>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    Query(query): Query<AuditLogQuery>,
) -> AppResult<Json<AuditLogResponse>> {
    let response = service::get_audit_log(
        &state.database,
        user_id,
        Some(path.server_id),
        query,
    )
    .await?;
    Ok(Json(response))
}
