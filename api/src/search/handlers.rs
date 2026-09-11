use axum::{
    extract::{Path, Query, State},
    http::{header, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use sea_orm::DatabaseConnection;
use std::sync::Arc;
use tokio::sync::{OwnedSemaphorePermit, Semaphore, TryAcquireError};

use super::{
    cursor::CursorKey,
    service,
    types::{SearchPath, SearchQuery},
};
use crate::{
    auth::{AuthenticatedUser, HasJwtSecret},
    common::{ApiError, AppResult},
};

const MAX_CONCURRENT_SCANS: usize = 2;
const RETRY_AFTER_SECONDS: &str = "1";

#[derive(Clone, Debug)]
pub(super) struct SearchState {
    pub(super) database: DatabaseConnection,
    pub(super) cursor_key: CursorKey,
    jwt_secret: Arc<str>,
    scan_semaphore: Arc<Semaphore>,
}

impl SearchState {
    pub(super) fn new(
        database: DatabaseConnection,
        jwt_secret: String,
    ) -> Self {
        Self {
            database,
            cursor_key: CursorKey::derive(&jwt_secret),
            jwt_secret: Arc::<str>::from(jwt_secret),
            scan_semaphore: Arc::new(Semaphore::new(MAX_CONCURRENT_SCANS)),
        }
    }

    pub(super) fn acquire_scan_permit(
        &self,
    ) -> AppResult<OwnedSemaphorePermit> {
        self.scan_semaphore
            .clone()
            .try_acquire_owned()
            .map_err(|error| match error {
                TryAcquireError::NoPermits => ApiError::new(
                    StatusCode::TOO_MANY_REQUESTS,
                    "Too many searches are running. Try again shortly.",
                ),
                TryAcquireError::Closed => ApiError::new(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Internal server error.",
                ),
            })
    }
}

impl HasJwtSecret for SearchState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

pub(super) async fn search(
    State(state): State<SearchState>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    Path(path): Path<SearchPath>,
    Query(query): Query<SearchQuery>,
) -> Response {
    let response =
        match service::search(&state, user_id, path.server_id, query).await {
            Ok(payload) => Json(payload).into_response(),
            Err(error) => error_response(error),
        };

    no_store(response)
}

fn error_response(error: ApiError) -> Response {
    let retry = error.status() == StatusCode::TOO_MANY_REQUESTS;
    let mut response = error.into_response();
    if retry {
        response.headers_mut().insert(
            header::RETRY_AFTER,
            HeaderValue::from_static(RETRY_AFTER_SECONDS),
        );
    }
    response
}

fn no_store(mut response: Response) -> Response {
    response
        .headers_mut()
        .insert(header::CACHE_CONTROL, HeaderValue::from_static("no-store"));
    response
}
