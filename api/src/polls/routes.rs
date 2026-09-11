use axum::{
    routing::{delete, get, post},
    Router,
};
use sea_orm::DatabaseConnection;

use super::handlers::{
    create_call_poll, create_poll, create_reply, delete_poll,
    get_active_decisions, get_call_decision, get_poll_action_event_cover_photo,
    get_poll_image, list_replies, move_proposal_to_forum, PollsState,
};
use crate::{pub_sub::PubSubService, votes};

pub(crate) fn router(
    database: DatabaseConnection,
    jwt_secret: String,
    pub_sub_service: PubSubService,
) -> Router {
    Router::new()
        .route("/", post(create_poll))
        .route("/{pollId}", delete(delete_poll))
        .route("/{pollId}/replies", get(list_replies).post(create_reply))
        .route("/{pollId}/images/{imageId}", get(get_poll_image))
        .route("/{pollId}/move-to-forum", post(move_proposal_to_forum))
        .route(
            "/{pollId}/event-cover-photos/{imageId}",
            get(get_poll_action_event_cover_photo),
        )
        .route(
            "/{pollId}/options/{pollOptionId}/voters",
            get(votes::handlers::get_voters_by_poll_option),
        )
        .nest("/{pollId}/votes", votes::routes::router())
        .with_state(PollsState::new(database, jwt_secret, pub_sub_service))
}

pub(crate) fn call_polls_router(
    database: DatabaseConnection,
    jwt_secret: String,
    pub_sub_service: PubSubService,
) -> Router {
    Router::new()
        .route("/", post(create_call_poll))
        .with_state(PollsState::new(database, jwt_secret, pub_sub_service))
}

pub(crate) fn call_decisions_router(
    database: DatabaseConnection,
    jwt_secret: String,
    pub_sub_service: PubSubService,
) -> Router {
    Router::new()
        .route("/", get(get_call_decision))
        .with_state(PollsState::new(database, jwt_secret, pub_sub_service))
}

pub(crate) fn active_decisions_router(
    database: DatabaseConnection,
    jwt_secret: String,
    pub_sub_service: PubSubService,
) -> Router {
    Router::new()
        .route("/", get(get_active_decisions))
        .with_state(PollsState::new(database, jwt_secret, pub_sub_service))
}
