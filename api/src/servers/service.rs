use axum::http::StatusCode;
use chrono::Utc;
use entity::{
    channel_members, event_attendees, events, instance_configs, server_bans,
    server_images, server_members, server_role_members, server_roles, servers,
    users,
};
use sea_orm::{
    prelude::Uuid,
    sea_query::{Expr, NullOrdering, Query},
    ActiveModelTrait, ColumnTrait, ConnectionTrait, DatabaseConnection,
    EntityTrait, IntoActiveModel, ModelTrait, Order, PaginatorTrait,
    QueryFilter, QueryOrder, Set, SqlErr, TransactionTrait,
};
use std::{path::Path, time::Duration};
use uuid::Uuid as NativeUuid;

use super::types::{
    serialize_timestamp, ServerImageRef, ServerRequest, ServerResponse,
    StoredServerImage, UserResponse,
};
use crate::{
    authz::{self, PermissionScope},
    cache::CacheService,
    channels as channels_service,
    common::{ApiError, AppResult},
    instance, users as users_service,
};

// Time-to-live for the cached current-server value. Chosen generously since
// the durable `last_active_at` column remains the source of truth on a miss
const CURRENT_SERVER_CACHE_TTL: Duration =
    Duration::from_secs(60 * 60 * 24 * 7);

// Minimum interval between durable `last_active_at` writes for the same
// server/user pair, so frequent navigation doesn't hit Postgres on every
// request
const CURRENT_SERVER_WRITE_THROTTLE: Duration = Duration::from_secs(60);

pub(crate) use super::server_configs::{
    ensure_server_config, get_server_config, is_anonymous_users_enabled,
    update_server_config,
};

const INITIAL_SERVER_NAME: &str = "praxis";

pub(super) async fn can_update_server(
    database: &DatabaseConnection,
    user_id: Uuid,
    server_id: Uuid,
) -> AppResult<()> {
    // Instance-level authority covers any single server's settings, so fall
    // back to the server-scoped check only when it does not apply
    match can_manage_servers(database, user_id).await {
        Ok(()) => return Ok(()),
        Err(error) if error.status() == StatusCode::FORBIDDEN => {}
        Err(error) => return Err(error),
    }

    authz::can(
        database,
        user_id,
        "manage",
        "ServerConfig",
        PermissionScope::Server(server_id),
    )
    .await
}

// Instance-level authority over servers themselves: creating them and
// designating the instance default. Server-scoped `ServerConfig: manage`
// deliberately does not satisfy this
pub(super) async fn can_manage_servers(
    database: &DatabaseConnection,
    user_id: Uuid,
) -> AppResult<()> {
    authz::can(
        database,
        user_id,
        "manage",
        "Server",
        PermissionScope::Instance,
    )
    .await
}

pub(crate) async fn default_server_id(
    database: &DatabaseConnection,
) -> AppResult<Uuid> {
    let config = instance::get_config_safely(database).await?;
    Ok(config.default_server_id)
}

pub(crate) async fn is_server_audience(
    database: &DatabaseConnection,
    server_id: Uuid,
    user_id: Option<Uuid>,
    invite_token: Option<&str>,
) -> AppResult<()> {
    ensure_server(database, server_id).await?;

    if let Some(user_id) = user_id {
        if is_server_member(database, server_id, user_id).await? {
            return Ok(());
        }
        if is_banned_from_server(database, server_id, user_id).await? {
            return Err(ApiError::new(StatusCode::FORBIDDEN, "Forbidden."));
        }
    }

    if default_server_id(database).await? == server_id {
        return Ok(());
    }

    if let Some(invite_token) = invite_token {
        if crate::invites::service::is_valid_invite_for_server(
            database,
            invite_token,
            server_id,
        )
        .await?
        {
            return Ok(());
        }
    }

    Err(ApiError::new(StatusCode::FORBIDDEN, "Forbidden."))
}

// Like `is_server_audience`, but also admits instance-level `Server: manage`
// holders, who administer servers they may never have joined (see the
// instance "manage servers" admin panel)
pub(super) async fn can_read_server(
    database: &DatabaseConnection,
    server_id: Uuid,
    user_id: Option<Uuid>,
    invite_token: Option<&str>,
) -> AppResult<()> {
    match is_server_audience(database, server_id, user_id, invite_token).await {
        Ok(()) => return Ok(()),
        Err(error) if error.status() == StatusCode::FORBIDDEN => {}
        Err(error) => return Err(error),
    }

    if let Some(user_id) = user_id {
        match can_manage_servers(database, user_id).await {
            Ok(()) => return Ok(()),
            Err(error) if error.status() == StatusCode::FORBIDDEN => {}
            Err(error) => return Err(error),
        }
    }

    Err(ApiError::new(StatusCode::FORBIDDEN, "Forbidden."))
}

pub(super) async fn get_servers(
    database: &DatabaseConnection,
) -> AppResult<Vec<ServerResponse>> {
    let default_server_id = default_server_id(database).await?;
    let servers = servers::Entity::find()
        .order_by_desc(servers::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;

    let mut responses = Vec::with_capacity(servers.len());
    for server in servers {
        responses.push(
            shape_server(database, server, default_server_id, false, true)
                .await?,
        );
    }

    Ok(responses)
}

pub(crate) async fn get_servers_for_user(
    database: &DatabaseConnection,
    user_id: Uuid,
) -> AppResult<Vec<ServerResponse>> {
    let default_server_id = default_server_id(database).await?;
    let memberships = server_members::Entity::find()
        .filter(server_members::Column::UserId.eq(user_id))
        .order_by_desc(server_members::Column::LastActiveAt)
        .all(database)
        .await
        .map_err(internal_error)?;
    let server_ids: Vec<Uuid> = memberships
        .iter()
        .map(|membership| membership.server_id)
        .collect();

    if server_ids.is_empty() {
        return Ok(vec![]);
    }

    let servers = servers::Entity::find()
        .filter(servers::Column::Id.is_in(server_ids))
        .order_by_desc(servers::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;

    let mut responses = Vec::with_capacity(servers.len());
    for server in servers {
        responses.push(
            shape_server(database, server, default_server_id, false, true)
                .await?,
        );
    }

    Ok(responses)
}

pub(crate) async fn get_current_server(
    database: &DatabaseConnection,
    cache_service: &CacheService,
    user_id: Uuid,
) -> AppResult<Option<ServerResponse>> {
    let default_server_id = default_server_id(database).await?;

    let cached_server_id =
        match cached_current_server_id(cache_service, user_id).await {
            Some(server_id)
                if is_server_member(database, server_id, user_id).await? =>
            {
                Some(server_id)
            }
            _ => None,
        };
    let server_id = match cached_server_id {
        Some(server_id) => Some(server_id),
        None => server_members::Entity::find()
            .filter(server_members::Column::UserId.eq(user_id))
            .order_by_with_nulls(
                server_members::Column::LastActiveAt,
                Order::Desc,
                NullOrdering::Last,
            )
            .one(database)
            .await
            .map_err(internal_error)?
            .map(|membership| membership.server_id),
    }
    .unwrap_or(default_server_id);

    let Some(server) = servers::Entity::find_by_id(server_id)
        .one(database)
        .await
        .map_err(internal_error)?
    else {
        return Ok(None);
    };

    shape_server(database, server, default_server_id, true, false)
        .await
        .map(Some)
}

pub(super) async fn get_server_by_id(
    database: &DatabaseConnection,
    server_id: Uuid,
    include_general_channel: bool,
) -> AppResult<ServerResponse> {
    let default_server_id = default_server_id(database).await?;
    let server = get_server(database, server_id).await?;
    shape_server(
        database,
        server,
        default_server_id,
        include_general_channel,
        false,
    )
    .await
}

// Unlike its `ServerPath` siblings, this cannot be gated by `CanReadServerContext`:
// the server id is not known until the slug is resolved, so the access check
// lives here, immediately after the lookup and before anything is shaped
pub(super) async fn get_server_by_slug(
    database: &DatabaseConnection,
    slug: &str,
    user_id: Uuid,
    invite_token: Option<&str>,
) -> AppResult<ServerResponse> {
    let server = servers::Entity::find()
        .filter(servers::Column::Slug.eq(slug))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Server not found.")
        })?;

    can_read_server(database, server.id, Some(user_id), invite_token).await?;

    let default_server_id = default_server_id(database).await?;
    shape_server(database, server, default_server_id, true, false).await
}

pub(super) async fn get_default_server(
    database: &DatabaseConnection,
) -> AppResult<ServerResponse> {
    let default_server_id = default_server_id(database).await?;
    let server = get_server(database, default_server_id).await?;
    shape_server(database, server, default_server_id, true, true).await
}

pub(super) async fn get_server_by_invite_token(
    database: &DatabaseConnection,
    invite_token: &str,
) -> AppResult<ServerResponse> {
    let invite =
        crate::invites::service::get_invite_by_token(database, invite_token)
            .await?;
    let default_server_id = default_server_id(database).await?;
    let server = get_server(database, invite.server_id).await?;
    shape_server(database, server, default_server_id, true, true).await
}

pub(super) async fn create_server(
    database: &DatabaseConnection,
    upload_root: &Path,
    request: ServerRequest,
    current_user_id: Uuid,
    image: Option<Vec<u8>>,
) -> AppResult<ServerResponse> {
    let image = normalize_server_image(image).await?;
    let (name, slug, description) = validate_server_request(&request)?;
    let server_id = NativeUuid::new_v4();

    let server = servers::ActiveModel {
        id: Set(server_id),
        name: Set(name),
        slug: Set(slug),
        description: Set(description),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(map_write_error)?;

    ensure_server_config(database, server.id).await?;
    add_server_members(database, server.id, &[current_user_id]).await?;
    super::server_roles::service::create_admin_server_role(
        database,
        server.id,
        current_user_id,
    )
    .await?;
    channels_service::create_general_channel(database, server.id).await?;

    if request.is_default_server.unwrap_or(false) {
        set_default_server(database, server.id).await?;
    }

    if let Some(image) = image {
        store_server_image(database, upload_root, server.id, image).await?;
    }

    let default_server_id = default_server_id(database).await?;
    shape_server(database, server, default_server_id, false, false).await
}

pub(super) async fn update_server(
    database: &DatabaseConnection,
    upload_root: &Path,
    server_id: Uuid,
    user_id: Uuid,
    request: ServerRequest,
    image: Option<Vec<u8>>,
) -> AppResult<ServerResponse> {
    // The caller already holds authority over this server, but the default
    // server is instance-wide state and needs instance-level authority
    if request.is_default_server.unwrap_or(false) {
        can_manage_servers(database, user_id).await?;
    }

    let image = normalize_server_image(image).await?;
    let (name, slug, description) = validate_server_request(&request)?;
    let server = get_server(database, server_id).await?;
    let mut active = server.into_active_model();
    active.name = Set(name);
    active.slug = Set(slug);
    active.description = Set(description);
    let server = active.update(database).await.map_err(map_write_error)?;

    if request.is_default_server.unwrap_or(false) {
        set_default_server(database, server.id).await?;
    }

    if let Some(image) = image {
        store_server_image(database, upload_root, server.id, image).await?;
    }

    let default_server_id = default_server_id(database).await?;
    shape_server(database, server, default_server_id, false, false).await
}

pub(super) async fn delete_server(
    database: &DatabaseConnection,
    upload_root: &Path,
    server_id: Uuid,
) -> AppResult<()> {
    let server = get_server(database, server_id).await?;
    let server_count = servers::Entity::find()
        .count(database)
        .await
        .map_err(internal_error)?;
    if server_count <= 1 {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "There must be at least one server per instance.",
        ));
    }

    if server.id == default_server_id(database).await? {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "The default server cannot be deleted.",
        ));
    }

    let images = server_images::Entity::find()
        .filter(server_images::Column::ServerId.eq(server_id))
        .all(database)
        .await
        .map_err(internal_error)?;
    server.delete(database).await.map_err(internal_error)?;
    cleanup_server_image_files(upload_root, &images).await;
    Ok(())
}

// The membership roster in join order. Callers that need to scope a list of
// users to one server should start here rather than querying `users` directly
pub(super) async fn get_server_member_user_ids(
    database: &DatabaseConnection,
    server_id: Uuid,
) -> AppResult<Vec<Uuid>> {
    let memberships = server_members::Entity::find()
        .filter(server_members::Column::ServerId.eq(server_id))
        .order_by_asc(server_members::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;

    Ok(memberships
        .into_iter()
        .map(|membership| membership.user_id)
        .collect())
}

pub(super) async fn get_server_members(
    database: &DatabaseConnection,
    server_id: Uuid,
) -> AppResult<Vec<UserResponse>> {
    get_server(database, server_id).await?;
    let user_ids = get_server_member_user_ids(database, server_id).await?;

    if user_ids.is_empty() {
        return Ok(vec![]);
    }

    let users = users::Entity::find()
        .filter(users::Column::Id.is_in(user_ids.clone()))
        .all(database)
        .await
        .map_err(internal_error)?;
    let profile_pictures =
        users_service::get_user_profile_pictures_map(database, &user_ids)
            .await?;

    Ok(users
        .into_iter()
        .map(|user| {
            let user_id = user.id;
            shape_user(user, profile_pictures.get(&user_id).cloned())
        })
        .collect())
}

pub(super) async fn get_users_eligible_for_server(
    database: &DatabaseConnection,
    server_id: Uuid,
) -> AppResult<Vec<UserResponse>> {
    get_server(database, server_id).await?;
    let memberships = server_members::Entity::find()
        .filter(server_members::Column::ServerId.eq(server_id))
        .all(database)
        .await
        .map_err(internal_error)?;
    let member_ids: Vec<Uuid> = memberships
        .iter()
        .map(|membership| membership.user_id)
        .collect();

    let mut query = users::Entity::find();
    if !member_ids.is_empty() {
        query = query.filter(users::Column::Id.is_not_in(member_ids));
    }

    let users = query.all(database).await.map_err(internal_error)?;
    let user_ids: Vec<Uuid> = users.iter().map(|user| user.id).collect();
    let profile_pictures =
        users_service::get_user_profile_pictures_map(database, &user_ids)
            .await?;

    Ok(users
        .into_iter()
        .map(|user| {
            let user_id = user.id;
            shape_user(user, profile_pictures.get(&user_id).cloned())
        })
        .collect())
}

pub(super) async fn add_server_members(
    database: &DatabaseConnection,
    server_id: Uuid,
    user_ids: &[Uuid],
) -> AppResult<()> {
    let transaction = database.begin().await.map_err(internal_error)?;
    add_server_members_in_transaction(&transaction, server_id, user_ids)
        .await?;
    transaction.commit().await.map_err(internal_error)?;
    Ok(())
}

async fn add_server_members_in_transaction<C>(
    database: &C,
    server_id: Uuid,
    user_ids: &[Uuid],
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    get_server(database, server_id).await?;

    for user_id in user_ids {
        if users::Entity::find_by_id(*user_id)
            .one(database)
            .await
            .map_err(internal_error)?
            .is_none()
        {
            continue;
        }

        add_member_to_server(database, server_id, *user_id).await?;
        channels_service::add_member_to_all_server_channels(
            database, server_id, *user_id,
        )
        .await?;
    }

    Ok(())
}

// The single source of truth for server membership. Anything that grants
// server-scoped standing — roles, invites, read access — must agree on it
pub(crate) async fn is_server_member<C>(
    database: &C,
    server_id: Uuid,
    user_id: Uuid,
) -> AppResult<bool>
where
    C: ConnectionTrait,
{
    let membership = server_members::Entity::find()
        .filter(server_members::Column::ServerId.eq(server_id))
        .filter(server_members::Column::UserId.eq(user_id))
        .one(database)
        .await
        .map_err(internal_error)?;

    Ok(membership.is_some())
}

pub(crate) async fn add_member_to_server<C>(
    database: &C,
    server_id: Uuid,
    user_id: Uuid,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    channels_service::lock_server_electorate(database, server_id).await?;

    if is_server_member(database, server_id, user_id).await? {
        return Ok(());
    }
    if is_banned_from_server(database, server_id, user_id).await? {
        return Err(ApiError::new(
            StatusCode::FORBIDDEN,
            "User is banned from this server.",
        ));
    }

    server_members::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        server_id: Set(server_id),
        user_id: Set(user_id),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)?;

    Ok(())
}

pub(crate) async fn is_banned_from_server<C>(
    database: &C,
    server_id: Uuid,
    user_id: Uuid,
) -> AppResult<bool>
where
    C: ConnectionTrait,
{
    let ban = server_bans::Entity::find()
        .filter(server_bans::Column::ServerId.eq(server_id))
        .filter(server_bans::Column::UserId.eq(user_id))
        .one(database)
        .await
        .map_err(internal_error)?;

    Ok(ban.is_some())
}

pub(super) async fn remove_server_members(
    database: &DatabaseConnection,
    server_id: Uuid,
    user_ids: &[Uuid],
) -> AppResult<()> {
    get_server(database, server_id).await?;
    if user_ids.is_empty() {
        return Ok(());
    }

    let transaction = database.begin().await.map_err(internal_error)?;
    remove_server_members_in_transaction(&transaction, server_id, user_ids)
        .await?;
    transaction.commit().await.map_err(internal_error)?;
    Ok(())
}

pub(crate) async fn remove_server_members_in_transaction<C>(
    database: &C,
    server_id: Uuid,
    user_ids: &[Uuid],
) -> AppResult<u64>
where
    C: ConnectionTrait,
{
    let channel_ids =
        channels_service::lock_server_electorate(database, server_id).await?;

    let removed = server_members::Entity::delete_many()
        .filter(server_members::Column::ServerId.eq(server_id))
        .filter(server_members::Column::UserId.is_in(user_ids.to_vec()))
        .exec(database)
        .await
        .map_err(internal_error)?
        .rows_affected;

    if !channel_ids.is_empty() {
        channel_members::Entity::delete_many()
            .filter(channel_members::Column::ChannelId.is_in(channel_ids))
            .filter(channel_members::Column::UserId.is_in(user_ids.to_vec()))
            .exec(database)
            .await
            .map_err(internal_error)?;
    }

    let server_role_ids = Query::select()
        .column(server_roles::Column::Id)
        .from(server_roles::Entity)
        .and_where(server_roles::Column::ServerId.eq(server_id))
        .to_owned();
    server_role_members::Entity::delete_many()
        .filter(
            server_role_members::Column::ServerRoleId
                .in_subquery(server_role_ids),
        )
        .filter(server_role_members::Column::UserId.is_in(user_ids.to_vec()))
        .exec(database)
        .await
        .map_err(internal_error)?;

    // Attendance is membership owned: departed hosts are removed too, while
    // the ratified event itself remains available to the server
    let server_event_ids = Query::select()
        .column(events::Column::Id)
        .from(events::Entity)
        .and_where(events::Column::ServerId.eq(server_id))
        .to_owned();
    event_attendees::Entity::delete_many()
        .filter(event_attendees::Column::EventId.in_subquery(server_event_ids))
        .filter(event_attendees::Column::UserId.is_in(user_ids.to_vec()))
        .exec(database)
        .await
        .map_err(internal_error)?;

    Ok(removed)
}

pub(super) async fn join_server(
    database: &DatabaseConnection,
    server_id: Uuid,
    user_id: Uuid,
    invite_token: &str,
) -> AppResult<()> {
    let invite =
        crate::invites::service::get_invite_by_token(database, invite_token)
            .await?;
    if invite.server_id != server_id {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Invalid invite token.",
        ));
    }

    // Spend the invite before granting membership. The other order lets a
    // caller that loses the race for the last use still end up a member
    let transaction = database.begin().await.map_err(internal_error)?;
    crate::invites::service::redeem_invite(&transaction, invite_token).await?;
    add_server_members_in_transaction(&transaction, server_id, &[user_id])
        .await?;
    transaction.commit().await.map_err(internal_error)?;

    Ok(())
}

async fn shape_server(
    database: &DatabaseConnection,
    server: servers::Model,
    default_server_id: Uuid,
    include_general_channel: bool,
    include_member_count: bool,
) -> AppResult<ServerResponse> {
    let general_channel_id = if include_general_channel {
        channels_service::general_channel_id(database, server.id)
            .await?
            .map(|id| id.to_string())
    } else {
        None
    };

    let member_count = if include_member_count {
        Some(
            server_members::Entity::find()
                .filter(server_members::Column::ServerId.eq(server.id))
                .count(database)
                .await
                .map_err(internal_error)?,
        )
    } else {
        None
    };

    Ok(ServerResponse {
        id: server.id.to_string(),
        name: server.name,
        slug: server.slug,
        description: server.description,
        image: get_latest_server_image(database, server.id).await?,
        is_default_server: Some(server.id == default_server_id),
        general_channel_id,
        member_count,
        created_at: serialize_timestamp(server.created_at),
        updated_at: serialize_timestamp(server.updated_at),
    })
}

async fn get_latest_server_image(
    database: &DatabaseConnection,
    server_id: Uuid,
) -> AppResult<Option<ServerImageRef>> {
    server_images::Entity::find()
        .filter(server_images::Column::ServerId.eq(server_id))
        .order_by_desc(server_images::Column::CreatedAt)
        .one(database)
        .await
        .map_err(internal_error)
        .map(|image| image.map(|image| shape_server_image(&image)))
}

/// Validates and compresses an upload before any database write
async fn normalize_server_image(
    image: Option<Vec<u8>>,
) -> AppResult<Option<Vec<u8>>> {
    let Some(bytes) = image else {
        return Ok(None);
    };
    crate::common::images::normalize_upload(bytes, "Server image")
        .await
        .map(Some)
}

/// Expects bytes already normalized by [`normalize_server_image`]
async fn store_server_image(
    database: &DatabaseConnection,
    upload_root: &Path,
    server_id: Uuid,
    bytes: Vec<u8>,
) -> AppResult<ServerImageRef> {
    get_server(database, server_id).await?;
    let previous_images = server_images::Entity::find()
        .filter(server_images::Column::ServerId.eq(server_id))
        .all(database)
        .await
        .map_err(internal_error)?;

    let image_id = NativeUuid::new_v4();
    let storage_key = format!("server-images/{image_id}");
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
            cleanup_server_image_path(&destination).await;
            return Err(internal_error(error));
        }
    };
    let image = match (server_images::ActiveModel {
        id: Set(image_id),
        server_id: Set(server_id),
        storage_key: Set(storage_key),
        ..Default::default()
    })
    .insert(&transaction)
    .await
    {
        Ok(image) => image,
        Err(error) => {
            cleanup_server_image_path(&destination).await;
            return Err(internal_error(error));
        }
    };

    if !previous_images.is_empty() {
        let previous_image_ids = previous_images
            .iter()
            .map(|image| image.id)
            .collect::<Vec<_>>();
        if let Err(error) = server_images::Entity::delete_many()
            .filter(server_images::Column::Id.is_in(previous_image_ids))
            .exec(&transaction)
            .await
        {
            cleanup_server_image_path(&destination).await;
            return Err(internal_error(error));
        }
    }

    if let Err(error) = transaction.commit().await {
        cleanup_server_image_path(&destination).await;
        return Err(internal_error(error));
    }

    cleanup_server_image_files(upload_root, &previous_images).await;

    Ok(shape_server_image(&image))
}

async fn cleanup_server_image_files(
    upload_root: &Path,
    images: &[server_images::Model],
) {
    for image in images {
        cleanup_server_image_path(&upload_root.join(&image.storage_key)).await;
    }
}

async fn cleanup_server_image_path(path: &Path) {
    if let Err(error) = tokio::fs::remove_file(path).await {
        if error.kind() != std::io::ErrorKind::NotFound {
            tracing::warn!(
                path = %path.display(),
                "failed to clean up server image: {error}"
            );
        }
    }
}

pub(super) async fn get_server_image(
    database: &DatabaseConnection,
    upload_root: &Path,
    server_id: Uuid,
    image_id: Uuid,
    user_id: Option<Uuid>,
    invite_token: Option<&str>,
) -> AppResult<StoredServerImage> {
    is_server_audience(database, server_id, user_id, invite_token).await?;
    let image = server_images::Entity::find_by_id(image_id)
        .filter(server_images::Column::ServerId.eq(server_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Image not found.")
        })?;
    let bytes = tokio::fs::read(upload_root.join(image.storage_key))
        .await
        .map_err(|_| {
            ApiError::new(StatusCode::NOT_FOUND, "Image file not found.")
        })?;

    Ok(StoredServerImage { bytes })
}

fn shape_server_image(image: &server_images::Model) -> ServerImageRef {
    ServerImageRef {
        id: image.id.to_string(),
        created_at: serialize_timestamp(image.created_at),
    }
}

pub(super) fn shape_user(
    user: users::Model,
    profile_picture: Option<users_service::UserImageRef>,
) -> UserResponse {
    UserResponse {
        id: user.id.to_string(),
        name: user.name,
        display_name: user.display_name,
        profile_picture,
    }
}

pub(crate) async fn get_server<C>(
    database: &C,
    server_id: Uuid,
) -> AppResult<servers::Model>
where
    C: ConnectionTrait,
{
    servers::Entity::find_by_id(server_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Server not found.")
        })
}

pub(crate) async fn ensure_server(
    database: &DatabaseConnection,
    server_id: Uuid,
) -> AppResult<()> {
    get_server(database, server_id).await.map(|_| ())
}

async fn set_default_server(
    database: &DatabaseConnection,
    server_id: Uuid,
) -> AppResult<()> {
    get_server(database, server_id).await?;

    let config = instance::get_config(database).await?;

    if let Some(config) = config {
        let mut active = config.into_active_model();
        active.default_server_id = Set(server_id);
        active.update(database).await.map_err(internal_error)?;
    } else {
        instance_configs::ActiveModel {
            id: Set(NativeUuid::new_v4()),
            default_server_id: Set(server_id),
            ..Default::default()
        }
        .insert(database)
        .await
        .map_err(internal_error)?;
    }

    Ok(())
}

pub(crate) async fn create_initial_server(
    database: &DatabaseConnection,
) -> AppResult<servers::Model> {
    if let Some(server) = servers::Entity::find()
        .filter(servers::Column::Slug.eq(INITIAL_SERVER_NAME))
        .one(database)
        .await
        .map_err(internal_error)?
    {
        ensure_server_config(database, server.id).await?;
        channels_service::create_general_channel(database, server.id).await?;
        return Ok(server);
    }

    let server = servers::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        name: Set(INITIAL_SERVER_NAME.to_owned()),
        slug: Set(INITIAL_SERVER_NAME.to_owned()),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(map_write_error)?;

    ensure_server_config(database, server.id).await?;
    channels_service::create_general_channel(database, server.id).await?;

    Ok(server)
}

// Records the server the user last viewed, so slug-less routes such as `/`
// can resolve back to it. Tracked per user, not per session, so tabs and
// devices share one value and the most recent view wins. Best-effort: a
// client that navigates away mid-request may not have its visit recorded
pub(super) async fn set_current_server(
    database: &DatabaseConnection,
    cache_service: &CacheService,
    server_id: Uuid,
    user_id: Uuid,
) -> AppResult<()> {
    if let Err(error) = cache_service
        .set(
            current_server_cache_key(user_id),
            server_id.to_string(),
            CURRENT_SERVER_CACHE_TTL,
        )
        .await
    {
        tracing::warn!("failed to cache current server: {error}");
    }

    let throttle_key = current_server_write_throttle_key(server_id, user_id);
    let recently_written = match cache_service.get(&throttle_key).await {
        Ok(value) => value.is_some(),
        Err(error) => {
            tracing::warn!(
                "failed to read current server write throttle: {error}"
            );
            false
        }
    };
    if recently_written {
        return Ok(());
    }

    server_members::Entity::update_many()
        .col_expr(
            server_members::Column::LastActiveAt,
            Expr::value(Utc::now().fixed_offset()),
        )
        .filter(server_members::Column::ServerId.eq(server_id))
        .filter(server_members::Column::UserId.eq(user_id))
        .exec(database)
        .await
        .map_err(internal_error)?;

    if let Err(error) = cache_service
        .set(throttle_key, String::new(), CURRENT_SERVER_WRITE_THROTTLE)
        .await
    {
        tracing::warn!("failed to set current server write throttle: {error}");
    }

    Ok(())
}

async fn cached_current_server_id(
    cache_service: &CacheService,
    user_id: Uuid,
) -> Option<Uuid> {
    match cache_service.get(&current_server_cache_key(user_id)).await {
        Ok(value) => value.and_then(|value| value.parse().ok()),
        Err(error) => {
            tracing::warn!("failed to read cached current server: {error}");
            None
        }
    }
}

fn current_server_cache_key(user_id: Uuid) -> String {
    format!("current-server:{user_id}")
}

fn current_server_write_throttle_key(server_id: Uuid, user_id: Uuid) -> String {
    format!("current-server-write:{server_id}:{user_id}")
}

fn validate_server_request(
    request: &ServerRequest,
) -> AppResult<(String, String, Option<String>)> {
    let name = request.name.trim().to_owned();
    let slug = request.slug.trim().to_ascii_lowercase();
    let description = request
        .description
        .as_ref()
        .map(|value| value.trim().to_owned())
        .filter(|value| !value.is_empty());

    if !(2..=30).contains(&name.chars().count()) {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Server name must be between 2 and 30 characters.",
        ));
    }
    if !(2..=30).contains(&slug.chars().count()) || !valid_slug(&slug) {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Server slug is invalid.",
        ));
    }
    if description
        .as_ref()
        .map(|value| value.chars().count() > 255)
        .unwrap_or(false)
    {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Server description must be at most 255 characters.",
        ));
    }

    Ok((name, slug, description))
}

fn valid_slug(value: &str) -> bool {
    let bytes = value.as_bytes();
    if bytes.first() == Some(&b'-') || bytes.last() == Some(&b'-') {
        return false;
    }

    bytes.iter().all(|byte| {
        byte.is_ascii_lowercase() || byte.is_ascii_digit() || *byte == b'-'
    }) && !value.contains("--")
}

fn map_write_error(error: sea_orm::DbErr) -> ApiError {
    if matches!(error.sql_err(), Some(SqlErr::UniqueConstraintViolation(_))) {
        return ApiError::new(StatusCode::CONFLICT, "Server already exists.");
    }

    internal_error(error)
}

pub(super) fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("server request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
