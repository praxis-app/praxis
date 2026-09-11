use axum::{
    routing::{delete, get, put},
    Router,
};
use sea_orm::DatabaseConnection;

use super::handlers::{
    clear_notifications, delete_notification, get_unread_count,
    list_notifications, mark_all_read, mark_read, mark_unread,
    NotificationsState,
};

pub(crate) fn router(
    database: DatabaseConnection,
    jwt_secret: String,
) -> Router {
    Router::new()
        .route("/", get(list_notifications))
        .route("/", delete(clear_notifications))
        .route("/unread-count", get(get_unread_count))
        .route("/read-all", put(mark_all_read))
        .route("/{notificationId}", delete(delete_notification))
        .route("/{notificationId}/read", put(mark_read))
        .route("/{notificationId}/unread", put(mark_unread))
        .with_state(NotificationsState::new(database, jwt_secret))
}
