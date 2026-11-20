//! Rejects requests from suspended or deleted accounts on every API route. A router layer
//! runs the check once per request, so no handler can skip it

// TODO: Examine whether other modules warrant their own `middleware.rs`
//
// Use an extractor when a handler needs its result or the check varies by
// route. Use middleware when a check applies to every route under a router
// and hands the handler nothing

use axum::{
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
    Json,
};
use sea_orm::DatabaseConnection;
use std::sync::Arc;

use super::{
    extractors::{authenticate_token, bearer_token},
    service::get_account_revocation,
};

#[derive(Clone, Debug)]
pub(crate) struct ActiveAccountState {
    database: DatabaseConnection,
    jwt_secret: Arc<str>,
}

impl ActiveAccountState {
    pub(crate) fn new(
        database: DatabaseConnection,
        jwt_secret: String,
    ) -> Self {
        Self {
            database,
            jwt_secret: Arc::<str>::from(jwt_secret),
        }
    }
}

pub(crate) async fn require_active_account(
    State(state): State<ActiveAccountState>,
    request: Request,
    next: Next,
) -> Response {
    let user_id = bearer_token(request.headers())
        .and_then(|token| authenticate_token(token, &state.jwt_secret).ok());

    if let Some(user_id) = user_id {
        match get_account_revocation(&state.database, user_id).await {
            Ok(None) => {}
            Ok(Some(revocation)) => {
                return (StatusCode::UNAUTHORIZED, Json(revocation))
                    .into_response()
            }
            Err(error) => return error.into_response(),
        }
    }

    next.run(request).await
}
