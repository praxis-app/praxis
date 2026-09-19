use axum::http::StatusCode;
use jsonwebtoken::{encode, EncodingKey, Header};
use sea_orm::{prelude::Uuid, DatabaseConnection, TransactionTrait};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use super::{
    handlers::AuthState,
    types::{Claims, LoginRequest, SignupRequest},
};
use crate::{
    channels,
    common::{text::normalize_text, ApiError, AppResult},
    instance, servers,
    users::{self, CreateUserError, UserRecord},
};

const ACCESS_TOKEN_TTL: Duration = Duration::from_secs(60 * 60 * 24 * 90);
const MIN_PASSWORD_LENGTH: usize = 8;

pub(super) fn issue_access_token(
    auth_state: &AuthState,
    user_id: Uuid,
) -> AppResult<String> {
    let claims = Claims {
        sub: user_id.to_string(),
        exp: current_unix_timestamp() + ACCESS_TOKEN_TTL.as_secs(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(auth_state.jwt_secret.as_bytes()),
    )
    .map_err(internal_error)
}

// TODO: Argon2 hashing and verification run synchronously in async signup,
// login, and account-upgrade requests. Repeated public requests can occupy all
// Tokio workers and stall unrelated API and background work. Move password work
// to bounded spawn_blocking tasks and rate-limit public auth routes
pub(super) async fn signup(
    database: &DatabaseConnection,
    payload: SignupRequest,
) -> AppResult<UserRecord> {
    let is_first_user = users::is_first_user(database).await?;
    let signup = validate_signup(payload)?;
    let invite = match signup.invite_token.as_deref() {
        Some(invite_token) => Some(
            crate::invites::service::get_invite_by_token(
                database,
                invite_token,
            )
            .await?,
        ),
        None => None,
    };
    let password_hash = password_auth::generate_hash(signup.password);
    let server_id = match &invite {
        Some(invite) => invite.server_id,
        None => servers::default_server_id(database)
            .await
            .map_err(internal_error)?,
    };

    let transaction = database.begin().await.map_err(internal_error)?;

    if let Some(invite_token) = signup.invite_token.as_deref() {
        crate::invites::service::redeem_invite(&transaction, invite_token)
            .await?;
    }

    let user = users::create_user(
        &transaction,
        signup.email,
        signup.name,
        password_hash,
    )
    .await
    .map_err(map_create_user_error)?;

    servers::add_member_to_server(&transaction, server_id, user.id)
        .await
        .map_err(internal_error)?;
    channels::add_member_to_all_server_channels(
        &transaction,
        server_id,
        user.id,
    )
    .await
    .map_err(internal_error)?;

    if is_first_user {
        instance::instance_roles::service::create_admin_instance_role(
            &transaction,
            user.id,
        )
        .await
        .map_err(internal_error)?;
        servers::server_roles::service::create_admin_server_role(
            &transaction,
            server_id,
            user.id,
        )
        .await
        .map_err(internal_error)?;
    }

    transaction.commit().await.map_err(internal_error)?;

    Ok(user)
}

pub(super) async fn create_anon_session(
    database: &DatabaseConnection,
    invite_token: Option<String>,
) -> AppResult<UserRecord> {
    let invite_token = invite_token.ok_or_else(|| {
        ApiError::new(StatusCode::FORBIDDEN, "You need an invite to sign up.")
    })?;
    let invite =
        crate::invites::service::get_invite_by_token(database, &invite_token)
            .await
            .map_err(|_| {
                ApiError::new(StatusCode::FORBIDDEN, "Invalid invite token.")
            })?;

    if !servers::service::is_anonymous_users_enabled(database, invite.server_id)
        .await?
    {
        return Err(ApiError::new(
            StatusCode::FORBIDDEN,
            "Anonymous users are not enabled for this server.",
        ));
    }

    // Spend the invite first: it is what authorizes the session
    let transaction = database.begin().await.map_err(internal_error)?;
    crate::invites::service::redeem_invite(&transaction, &invite_token).await?;
    let user = users::create_anon_user(&transaction, invite.server_id)
        .await
        .map_err(map_create_user_error)?;
    transaction.commit().await.map_err(internal_error)?;

    Ok(user)
}

pub(super) async fn upgrade_anon_session(
    database: &DatabaseConnection,
    user_id: Uuid,
    payload: SignupRequest,
) -> AppResult<UserRecord> {
    let signup = validate_signup(payload)?;
    let user = users::get_user_by_id(database, user_id)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::UNAUTHORIZED, "Authentication required.")
        })?;

    if !user.anonymous {
        return Err(ApiError::new(
            StatusCode::CONFLICT,
            "Account is already registered.",
        ));
    }

    let password_hash = password_auth::generate_hash(signup.password);
    users::upgrade_anon_user(
        database,
        user_id,
        signup.email,
        signup.name,
        password_hash,
    )
    .await
    .map_err(map_create_user_error)
}

pub(super) fn validate_signup(
    mut input: SignupRequest,
) -> AppResult<SignupRequest> {
    input.name = input.name.trim().to_owned();
    input.email = normalize_text(&input.email);

    if input.name.chars().count() < 2 {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Name must be at least 2 characters long.",
        ));
    }

    if !looks_like_email(&input.email) {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Enter a valid email address.",
        ));
    }

    if input.password.chars().count() < MIN_PASSWORD_LENGTH {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            format!("Password must be at least {MIN_PASSWORD_LENGTH} characters long."),
        ));
    }

    Ok(input)
}

pub(super) fn validate_login(
    mut input: LoginRequest,
) -> AppResult<LoginRequest> {
    input.email = normalize_text(&input.email);

    if !looks_like_email(&input.email) {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Enter a valid email address.",
        ));
    }

    if input.password.is_empty() {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Password is required.",
        ));
    }

    Ok(input)
}

pub(super) fn map_create_user_error(error: CreateUserError) -> ApiError {
    match error {
        CreateUserError::DuplicateEmail => ApiError::new(
            StatusCode::CONFLICT,
            "An account with that email already exists.",
        ),
        CreateUserError::Database(error) => internal_error(error),
    }
}

pub(crate) fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}

fn current_unix_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

fn looks_like_email(value: &str) -> bool {
    let mut parts = value.split('@');
    let Some(local_part) = parts.next() else {
        return false;
    };
    let Some(domain) = parts.next() else {
        return false;
    };

    !local_part.is_empty()
        && domain.contains('.')
        && !domain.starts_with('.')
        && !domain.ends_with('.')
        && parts.next().is_none()
}
