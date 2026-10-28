use axum::http::StatusCode;
use entity::{channel_members, server_members, user_images, users};
use sea_orm::{
    prelude::Uuid, ActiveModelTrait, ColumnTrait, ConnectionTrait,
    DatabaseConnection, DbErr, EntityTrait, IntoActiveModel, PaginatorTrait,
    QueryFilter, QueryOrder, Set, SqlErr, TransactionTrait,
};
use std::{collections::BTreeMap, path::Path};
use uuid::Uuid as NativeUuid;

use super::{
    models::UserRecord,
    types::{
        CreateUserError, CurrentUserPermissions, CurrentUserResponse,
        StoredUserImage, UpdateUserProfileRequest, UserImageRef,
        UserProfileResponse,
    },
};
use crate::{
    cache::CacheService,
    common::{
        text::{normalize_text, sanitize_text},
        ApiError, AppResult,
    },
    instance, servers,
};

const PROFILE_PICTURE_KIND: &str = "profile-picture";
const COVER_PHOTO_KIND: &str = "cover-photo";

pub(crate) async fn create_user<C>(
    database: &C,
    email: String,
    name: String,
    password_hash: String,
) -> Result<UserRecord, CreateUserError>
where
    C: ConnectionTrait,
{
    users::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        email: Set(Some(normalize_text(&email))),
        name: Set(name),
        password: Set(Some(password_hash)),
        ..Default::default()
    }
    .insert(database)
    .await
    .map(Into::into)
    .map_err(map_create_user_error)
}

pub(crate) async fn create_anon_user<C>(
    database: &C,
    server_id: Uuid,
) -> Result<UserRecord, CreateUserError>
where
    C: ConnectionTrait,
{
    let user_id = NativeUuid::new_v4();
    let suffix = user_id.simple().to_string()[..8].to_owned();

    let user = users::ActiveModel {
        id: Set(user_id),
        email: Set(None),
        name: Set(format!("anon_{suffix}")),
        password: Set(Some(String::new())),
        anonymous: Set(true),
        ..Default::default()
    }
    .insert(database)
    .await
    .map(UserRecord::from)
    .map_err(map_create_user_error)?;

    crate::servers::service::add_member_to_server(database, server_id, user.id)
        .await
        .map_err(api_error_to_create_user_error)?;
    crate::channels::add_member_to_all_server_channels(
        database, server_id, user.id,
    )
    .await
    .map_err(api_error_to_create_user_error)?;

    Ok(user)
}

pub(crate) async fn upgrade_anon_user(
    database: &DatabaseConnection,
    user_id: Uuid,
    email: String,
    name: String,
    password_hash: String,
) -> Result<UserRecord, CreateUserError> {
    let user = users::Entity::find_by_id(user_id)
        .one(database)
        .await
        .map_err(CreateUserError::Database)?
        .ok_or_else(|| {
            CreateUserError::Database(DbErr::RecordNotFound(
                "User not found.".to_owned(),
            ))
        })?;

    let mut active = user.into_active_model();
    active.email = Set(Some(email));
    active.name = Set(name);
    active.password = Set(Some(password_hash));
    active.anonymous = Set(false);

    active
        .update(database)
        .await
        .map(UserRecord::from)
        .map_err(map_create_user_error)
}

pub(crate) async fn get_user_by_id(
    database: &DatabaseConnection,
    user_id: Uuid,
) -> Result<Option<UserRecord>, DbErr> {
    users::Entity::find_by_id(user_id)
        .one(database)
        .await
        .map(|user| user.map(Into::into))
}

/// Reports whether the account behind a validated JWT is anonymous. Callers
/// that gate a feature on registration own the resulting error, since some
/// rules (test proposals) admit anonymous users conditionally
pub(crate) async fn is_anonymous_user(
    database: &DatabaseConnection,
    user_id: Uuid,
) -> AppResult<bool> {
    let user = get_user_by_id(database, user_id)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::UNAUTHORIZED, "Authentication required.")
        })?;

    Ok(user.anonymous)
}

pub(crate) async fn is_active_user<C>(
    database: &C,
    user_id: Uuid,
) -> AppResult<bool>
where
    C: ConnectionTrait,
{
    let user = users::Entity::find_by_id(user_id)
        .one(database)
        .await
        .map_err(internal_error)?;

    Ok(user.is_some_and(|user| !user.locked))
}

pub(crate) async fn authenticate(
    database: &DatabaseConnection,
    email: String,
    password: String,
) -> Result<Option<UserRecord>, DbErr> {
    let user = users::Entity::find()
        .filter(users::Column::Email.eq(Some(email)))
        .one(database)
        .await?;

    let Some(user) = user.map(UserRecord::from) else {
        return Ok(None);
    };

    Ok(user
        .password_hash
        .as_deref()
        .and_then(|hash| password_auth::verify_password(password, hash).ok())
        .map(|()| user))
}

pub(super) async fn get_current_user(
    database: &DatabaseConnection,
    cache_service: &CacheService,
    user_id: Uuid,
) -> AppResult<CurrentUserResponse> {
    let user = get_user_by_id(database, user_id)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::UNAUTHORIZED, "Authentication required.")
        })?;
    let servers =
        servers::service::get_servers_for_user(database, user_id).await?;
    let current_server =
        servers::service::get_current_server(database, cache_service, user_id)
            .await?;

    Ok(CurrentUserResponse {
        id: user.id.to_string(),
        name: user.name,
        display_name: user.display_name,
        anonymous: user.anonymous,
        permissions: CurrentUserPermissions {
            instance:
                instance::instance_roles::service::get_permissions_by_user(
                    database, user_id,
                )
                .await?,
            servers: servers::server_roles::service::get_permissions_by_user(
                database, user_id,
            )
            .await?,
        },
        profile_picture: get_user_profile_picture(database, user_id).await?,
        current_server,
        servers_count: servers.len(),
    })
}

pub(crate) async fn is_first_user(
    database: &DatabaseConnection,
) -> AppResult<bool> {
    users::Entity::find()
        .count(database)
        .await
        .map(|count| count == 0)
        .map_err(internal_error)
}

pub(super) async fn get_user_profile(
    database: &DatabaseConnection,
    current_user_id: Option<Uuid>,
    user_id: Uuid,
    invite_token: Option<&str>,
) -> AppResult<UserProfileResponse> {
    authorize_user_profile_access(
        database,
        current_user_id,
        user_id,
        invite_token,
    )
    .await?;

    let user = users::Entity::find_by_id(user_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "User not found.")
        })?;

    Ok(UserProfileResponse {
        id: user.id.to_string(),
        name: user.name,
        display_name: user.display_name,
        bio: user.bio,
        profile_picture: get_user_profile_picture(database, user_id).await?,
        cover_photo: get_user_cover_photo(database, user_id).await?,
    })
}

pub(super) async fn update_user_profile(
    database: &DatabaseConnection,
    user_id: Uuid,
    request: UpdateUserProfileRequest,
) -> AppResult<()> {
    let user = users::Entity::find_by_id(user_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "User not found.")
        })?;

    let mut active = user.into_active_model();
    if let Some(name) = request.name {
        active.name = Set(validate_name(&name)?);
    }
    if let Some(display_name) = request.display_name {
        active.display_name = Set(normalize_optional_text(display_name, 30)?);
    }
    if let Some(bio) = request.bio {
        active.bio = Set(normalize_optional_text(bio, 500)?);
    }

    active.update(database).await.map_err(internal_error)?;
    Ok(())
}

pub(crate) async fn get_user_profile_picture(
    database: &DatabaseConnection,
    user_id: Uuid,
) -> AppResult<Option<UserImageRef>> {
    get_latest_user_image(database, user_id, PROFILE_PICTURE_KIND).await
}

pub(super) async fn get_user_cover_photo(
    database: &DatabaseConnection,
    user_id: Uuid,
) -> AppResult<Option<UserImageRef>> {
    get_latest_user_image(database, user_id, COVER_PHOTO_KIND).await
}

pub(crate) async fn get_user_profile_pictures_map(
    database: &DatabaseConnection,
    user_ids: &[Uuid],
) -> AppResult<BTreeMap<Uuid, UserImageRef>> {
    if user_ids.is_empty() {
        return Ok(BTreeMap::new());
    }

    let images = user_images::Entity::find()
        .filter(user_images::Column::UserId.is_in(user_ids.iter().copied()))
        .filter(user_images::Column::Kind.eq(PROFILE_PICTURE_KIND))
        .order_by_asc(user_images::Column::UserId)
        .order_by_desc(user_images::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;

    let mut profile_pictures = BTreeMap::new();
    for image in images {
        profile_pictures
            .entry(image.user_id)
            .or_insert_with(|| shape_image_reference(&image));
    }

    Ok(profile_pictures)
}

pub(super) async fn store_user_image(
    database: &DatabaseConnection,
    upload_root: &Path,
    user_id: Uuid,
    kind: &str,
    bytes: Vec<u8>,
) -> AppResult<UserImageRef> {
    let bytes =
        crate::common::images::normalize_upload(bytes, "User image").await?;

    let kind = match kind {
        PROFILE_PICTURE_KIND | COVER_PHOTO_KIND => kind,
        _ => {
            return Err(ApiError::new(
                StatusCode::BAD_REQUEST,
                "Unsupported image kind.",
            ))
        }
    };

    users::Entity::find_by_id(user_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "User not found.")
        })?;

    let image_id = NativeUuid::new_v4();
    let storage_key = format!("user-images/{image_id}");
    let destination = upload_root.join(&storage_key);
    if let Some(parent) = destination.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(internal_error)?;
    }
    if let Err(error) = tokio::fs::write(&destination, bytes).await {
        let _ = tokio::fs::remove_file(&destination).await;
        return Err(internal_error(error));
    }

    let transaction = match database.begin().await {
        Ok(transaction) => transaction,
        Err(error) => {
            cleanup_user_image(&destination).await;
            return Err(internal_error(error));
        }
    };
    let image = match (user_images::ActiveModel {
        id: Set(image_id),
        user_id: Set(user_id),
        kind: Set(kind.to_owned()),
        storage_key: Set(Some(storage_key)),
        ..Default::default()
    })
    .insert(&transaction)
    .await
    {
        Ok(image) => image,
        Err(error) => {
            cleanup_user_image(&destination).await;
            return Err(internal_error(error));
        }
    };
    if let Err(error) = transaction.commit().await {
        cleanup_user_image(&destination).await;
        return Err(internal_error(error));
    }

    Ok(shape_image_reference(&image))
}

async fn cleanup_user_image(path: &Path) {
    if let Err(error) = tokio::fs::remove_file(path).await {
        tracing::warn!("failed to clean up user image: {error}");
    }
}

pub(super) async fn get_user_image(
    database: &DatabaseConnection,
    upload_root: &Path,
    current_user_id: Option<Uuid>,
    user_id: Uuid,
    image_id: Uuid,
    invite_token: Option<&str>,
) -> AppResult<StoredUserImage> {
    authorize_user_image_access(
        database,
        current_user_id,
        user_id,
        image_id,
        invite_token,
    )
    .await?;

    let image = user_images::Entity::find_by_id(image_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Image not found.")
        })?;

    if image.user_id != user_id {
        return Err(ApiError::new(StatusCode::NOT_FOUND, "Image not found."));
    }

    let storage_key = image.storage_key.ok_or_else(|| {
        ApiError::new(StatusCode::NOT_FOUND, "Image not uploaded yet.")
    })?;
    let bytes = tokio::fs::read(upload_root.join(storage_key))
        .await
        .map_err(internal_error)?;

    Ok(StoredUserImage { bytes })
}

pub(super) async fn upload_user_profile_picture(
    database: &DatabaseConnection,
    upload_root: &Path,
    user_id: Uuid,
    bytes: Vec<u8>,
) -> AppResult<UserImageRef> {
    store_user_image(
        database,
        upload_root,
        user_id,
        PROFILE_PICTURE_KIND,
        bytes,
    )
    .await
}

pub(super) async fn upload_user_cover_photo(
    database: &DatabaseConnection,
    upload_root: &Path,
    user_id: Uuid,
    bytes: Vec<u8>,
) -> AppResult<UserImageRef> {
    store_user_image(database, upload_root, user_id, COVER_PHOTO_KIND, bytes)
        .await
}

pub(super) async fn has_shared_channel(
    database: &DatabaseConnection,
    user_id: Uuid,
    other_user_id: Uuid,
) -> AppResult<bool> {
    let memberships = channel_members::Entity::find()
        .filter(channel_members::Column::UserId.eq(user_id))
        .all(database)
        .await
        .map_err(internal_error)?;
    let channel_ids: Vec<Uuid> = memberships
        .into_iter()
        .map(|item| item.channel_id)
        .collect();

    if channel_ids.is_empty() {
        return Ok(false);
    }

    let shared = channel_members::Entity::find()
        .filter(channel_members::Column::UserId.eq(other_user_id))
        .filter(channel_members::Column::ChannelId.is_in(channel_ids))
        .one(database)
        .await
        .map_err(internal_error)?;

    Ok(shared.is_some())
}

pub(super) async fn is_default_server_member(
    database: &DatabaseConnection,
    user_id: Uuid,
) -> AppResult<bool> {
    let default_server_id =
        servers::service::default_server_id(database).await?;
    let membership = server_members::Entity::find()
        .filter(server_members::Column::ServerId.eq(default_server_id))
        .filter(server_members::Column::UserId.eq(user_id))
        .one(database)
        .await
        .map_err(internal_error)?;

    Ok(membership.is_some())
}

// Follows the same rules `authorize_user_image_access` applies to a user's
// images: a profile is public when its owner belongs to the default server,
// and otherwise visible to the owner, to anyone sharing a channel with them,
// and to callers holding an invite to a server the owner belongs to
async fn authorize_user_profile_access(
    database: &DatabaseConnection,
    current_user_id: Option<Uuid>,
    user_id: Uuid,
    invite_token: Option<&str>,
) -> AppResult<()> {
    if current_user_id == Some(user_id)
        || is_default_server_member(database, user_id).await?
        || is_member_of_invited_server(database, invite_token, user_id).await?
    {
        return Ok(());
    }

    let shared_channel = match current_user_id {
        Some(current_user_id) => {
            has_shared_channel(database, current_user_id, user_id).await?
        }
        None => false,
    };

    if shared_channel {
        Ok(())
    } else {
        Err(ApiError::new(StatusCode::FORBIDDEN, "Forbidden."))
    }
}

async fn authorize_user_image_access(
    database: &DatabaseConnection,
    current_user_id: Option<Uuid>,
    user_id: Uuid,
    image_id: Uuid,
    invite_token: Option<&str>,
) -> AppResult<()> {
    let profile_picture = get_user_profile_picture(database, user_id).await?;
    if profile_picture
        .as_ref()
        .is_some_and(|image| image.id == image_id.to_string())
    {
        return authorize_user_profile_access(
            database,
            current_user_id,
            user_id,
            invite_token,
        )
        .await;
    }

    let invited_server_member = if current_user_id.is_none() {
        is_member_of_invited_server(database, invite_token, user_id).await?
    } else {
        false
    };
    let cover_photo = get_user_cover_photo(database, user_id).await?;
    if cover_photo
        .as_ref()
        .is_some_and(|image| image.id == image_id.to_string())
    {
        let allowed = if current_user_id == Some(user_id) {
            true
        } else if let Some(current_user_id) = current_user_id {
            has_shared_channel(database, current_user_id, user_id).await?
        } else {
            invited_server_member
        };
        return if allowed {
            Ok(())
        } else {
            Err(ApiError::new(StatusCode::FORBIDDEN, "Forbidden."))
        };
    }

    Err(ApiError::new(StatusCode::NOT_FOUND, "Image not found."))
}

async fn is_member_of_invited_server(
    database: &DatabaseConnection,
    invite_token: Option<&str>,
    user_id: Uuid,
) -> AppResult<bool> {
    let Some(invite_token) = invite_token else {
        return Ok(false);
    };
    let Some(server_id) =
        crate::invites::service::valid_invite_server_id(database, invite_token)
            .await?
    else {
        return Ok(false);
    };

    server_members::Entity::find()
        .filter(server_members::Column::ServerId.eq(server_id))
        .filter(server_members::Column::UserId.eq(user_id))
        .one(database)
        .await
        .map_err(internal_error)
        .map(|membership| membership.is_some())
}

fn shape_image_reference(image: &user_images::Model) -> UserImageRef {
    UserImageRef {
        id: image.id.to_string(),
        created_at: image.created_at.to_rfc3339(),
    }
}

async fn get_latest_user_image(
    database: &DatabaseConnection,
    user_id: Uuid,
    kind: &str,
) -> AppResult<Option<UserImageRef>> {
    user_images::Entity::find()
        .filter(user_images::Column::UserId.eq(user_id))
        .filter(user_images::Column::Kind.eq(kind))
        .order_by_desc(user_images::Column::CreatedAt)
        .one(database)
        .await
        .map_err(internal_error)
        .map(|image| image.as_ref().map(shape_image_reference))
}

fn validate_name(name: &str) -> AppResult<String> {
    let normalized = sanitize_text(name);
    let valid = (3..=15).contains(&normalized.chars().count())
        && normalized.chars().all(|ch| {
            ch.is_ascii_lowercase() || ch.is_ascii_digit() || ch == '_'
        });

    if valid {
        Ok(normalized)
    } else {
        Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Name must be 3-15 characters using lowercase letters, numbers, or underscores.",
        ))
    }
}

fn normalize_optional_text(
    value: String,
    max_len: usize,
) -> AppResult<Option<String>> {
    let normalized = sanitize_text(&value);
    if normalized.is_empty() {
        return Ok(None);
    }
    if normalized.chars().count() > max_len {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Profile field is too long.",
        ));
    }
    Ok(Some(normalized))
}

fn map_create_user_error(error: DbErr) -> CreateUserError {
    if matches!(error.sql_err(), Some(SqlErr::UniqueConstraintViolation(_))) {
        return CreateUserError::DuplicateEmail;
    }

    CreateUserError::Database(error)
}

fn api_error_to_create_user_error(error: ApiError) -> CreateUserError {
    CreateUserError::Database(DbErr::Custom(error.to_string()))
}

pub(super) fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("users request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
