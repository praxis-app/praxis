use axum::{routing::get, Router};
use sea_orm::DatabaseConnection;

use super::handlers::{
    get_instance_audit_log, get_server_audit_log, AuditLogState,
};

pub(crate) fn router(
    database: DatabaseConnection,
    jwt_secret: String,
) -> Router {
    Router::new()
        .route("/audit-log", get(get_instance_audit_log))
        .route("/servers/{serverId}/audit-log", get(get_server_audit_log))
        .with_state(AuditLogState::new(database, jwt_secret))
}
