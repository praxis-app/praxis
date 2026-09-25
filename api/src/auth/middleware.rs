use axum::{
    extract::{Request, State},
    middleware::Next,
    response::{IntoResponse, Response},
};
use sea_orm::DatabaseConnection;
use std::sync::Arc;

use super::{
    extractors::{authenticate_token, bearer_token},
    service::account_suspended,
};
use crate::users;

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
        match users::is_active_user(&state.database, user_id).await {
            Ok(true) => {}
            Ok(false) => return account_suspended().into_response(),
            Err(error) => return error.into_response(),
        }
    }

    next.run(request).await
}
