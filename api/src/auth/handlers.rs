use axum::{extract::State, response::Json};
use sea_orm::DatabaseConnection;
use std::sync::Arc;

use super::{
    service::{
        create_anon_session as create_anon_session_user, internal_error,
        issue_access_token, signup as signup_user,
        upgrade_anon_session as upgrade_anon_session_user, validate_login,
    },
    types::{
        CreateAnonSessionRequest, LoginRequest, SessionResponse, SignupRequest,
    },
};
use crate::{
    auth::{AuthenticatedUser, HasJwtSecret},
    common::{ApiError, AppResult},
    users,
};

#[derive(Clone, Debug)]
pub(super) struct AuthState {
    pub(super) database: DatabaseConnection,
    pub(super) jwt_secret: Arc<str>,
}

impl AuthState {
    pub(super) fn new(
        database: DatabaseConnection,
        jwt_secret: String,
    ) -> Self {
        Self {
            database,
            jwt_secret: Arc::<str>::from(jwt_secret),
        }
    }
}

impl HasJwtSecret for AuthState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

pub(super) async fn signup(
    State(auth_state): State<AuthState>,
    Json(payload): Json<SignupRequest>,
) -> AppResult<(axum::http::StatusCode, Json<SessionResponse>)> {
    let user = signup_user(&auth_state.database, payload).await?;
    let access_token = issue_access_token(&auth_state, user.id)?;

    Ok((
        axum::http::StatusCode::CREATED,
        Json(SessionResponse {
            user: Some(user.into()),
            access_token: Some(access_token),
        }),
    ))
}

pub(super) async fn login(
    State(auth_state): State<AuthState>,
    Json(payload): Json<LoginRequest>,
) -> AppResult<Json<SessionResponse>> {
    let login = validate_login(payload)?;
    let user =
        users::authenticate(&auth_state.database, login.email, login.password)
            .await
            .map_err(internal_error)?
            .ok_or_else(|| {
                ApiError::new(
                    axum::http::StatusCode::UNAUTHORIZED,
                    "Invalid email or password.",
                )
            })?;

    let access_token = issue_access_token(&auth_state, user.id)?;

    Ok(Json(SessionResponse {
        user: Some(user.into()),
        access_token: Some(access_token),
    }))
}

pub(super) async fn create_anon_session(
    State(auth_state): State<AuthState>,
    Json(payload): Json<CreateAnonSessionRequest>,
) -> AppResult<Json<SessionResponse>> {
    let user =
        create_anon_session_user(&auth_state.database, payload.invite_token)
            .await?;
    let access_token = issue_access_token(&auth_state, user.id)?;

    Ok(Json(SessionResponse {
        user: Some(user.into()),
        access_token: Some(access_token),
    }))
}

pub(super) async fn upgrade_anon_session(
    State(auth_state): State<AuthState>,
    AuthenticatedUser(user_id): AuthenticatedUser,
    Json(payload): Json<SignupRequest>,
) -> AppResult<axum::http::StatusCode> {
    upgrade_anon_session_user(&auth_state.database, user_id, payload).await?;
    Ok(axum::http::StatusCode::NO_CONTENT)
}

pub(super) async fn logout() -> Json<SessionResponse> {
    Json(SessionResponse {
        user: None,
        access_token: None,
    })
}
