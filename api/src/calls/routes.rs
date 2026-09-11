use axum::{routing::post, Router};
use sea_orm::DatabaseConnection;

use super::{
    handlers::{
        join_call, leave_call, livekit_webhook, start_call, CallsState,
    },
    livekit::LiveKitConfig,
};
use crate::{feeds, messages, polls, pub_sub::PubSubService};

pub(crate) fn livekit_webhook_router(
    database: DatabaseConnection,
    jwt_secret: String,
    livekit: Option<LiveKitConfig>,
) -> Router {
    Router::new()
        .route("/livekit/webhook", post(livekit_webhook))
        .with_state(CallsState::new(database, jwt_secret, None, livekit))
}

pub(crate) fn router(
    database: DatabaseConnection,
    jwt_secret: String,
    pub_sub_service: PubSubService,
    livekit: Option<LiveKitConfig>,
) -> Router {
    let calls_router = Router::new()
        .route("/", post(start_call))
        .route("/{callId}/join", post(join_call))
        .route("/{callId}/leave", post(leave_call))
        .with_state(CallsState::new(
            database.clone(),
            jwt_secret.clone(),
            Some(pub_sub_service.clone()),
            livekit.clone(),
        ));

    calls_router
        .nest(
            "/{callId}/feed",
            feeds::call_feed_router(database.clone(), jwt_secret.clone()),
        )
        .nest(
            "/{callId}/messages",
            messages::call_messages_router(
                database.clone(),
                jwt_secret.clone(),
                pub_sub_service.clone(),
            ),
        )
        .nest(
            "/{callId}/polls",
            polls::call_polls_router(
                database.clone(),
                jwt_secret.clone(),
                pub_sub_service.clone(),
            ),
        )
        .nest(
            "/{callId}/decisions",
            polls::call_decisions_router(database, jwt_secret, pub_sub_service),
        )
}
