use axum::{
    routing::{get, post},
    Router,
};
use sea_orm::DatabaseConnection;

use super::handlers::{
    create_call_message, create_message, create_reply, get_call_message_image,
    get_message_image, list_replies, ChatState,
};
use crate::pub_sub::PubSubService;

pub(crate) fn router(
    database: DatabaseConnection,
    jwt_secret: String,
    pub_sub_service: PubSubService,
) -> Router {
    Router::new()
        .route("/", post(create_message))
        .route(
            "/{rootMessageId}/replies",
            get(list_replies).post(create_reply),
        )
        .route("/{messageId}/images/{imageId}", get(get_message_image))
        .with_state(ChatState::new(database, jwt_secret, pub_sub_service))
}

pub(crate) fn call_messages_router(
    database: DatabaseConnection,
    jwt_secret: String,
    pub_sub_service: PubSubService,
) -> Router {
    Router::new()
        .route("/", post(create_call_message))
        .route("/{messageId}/images/{imageId}", get(get_call_message_image))
        .with_state(ChatState::new(database, jwt_secret, pub_sub_service))
}
