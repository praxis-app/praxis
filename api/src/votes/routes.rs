use axum::{
    routing::{post, put},
    Router,
};

use super::handlers::{create_vote, delete_vote, update_vote};
use crate::polls::handlers::PollsState;

pub(crate) fn router() -> Router<PollsState> {
    Router::new()
        .route("/", post(create_vote))
        .route("/{voteId}", put(update_vote).delete(delete_vote))
}
