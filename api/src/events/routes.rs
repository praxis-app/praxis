use axum::{routing::get, Router};
use sea_orm::DatabaseConnection;

use super::handlers::{
    clear_rsvp, get_event, get_event_cover_photo, list_events, upsert_rsvp,
    EventsState,
};

pub(crate) fn router(
    database: DatabaseConnection,
    jwt_secret: String,
) -> Router {
    Router::new()
        .route("/", get(list_events))
        .route("/{eventId}", get(get_event))
        .route(
            "/{eventId}/cover-photos/{imageId}",
            get(get_event_cover_photo),
        )
        .route("/{eventId}/rsvp", axum::routing::put(upsert_rsvp))
        .route("/{eventId}/rsvp", axum::routing::delete(clear_rsvp))
        .with_state(EventsState::new(database, jwt_secret))
}
