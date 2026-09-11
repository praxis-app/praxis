use axum::http::StatusCode;
use chrono::Utc;
use entity::{
    channel_keys, channel_members, channels, enums::ChannelType, messages,
    polls, server_members, servers,
};
use sea_orm::{
    prelude::Uuid,
    sea_query::{
        Alias, BinOper, DynIden, Expr, IntoIden, Query, SelectStatement,
    },
    ActiveModelTrait, ColumnTrait, Condition, ConnectionTrait,
    DatabaseConnection, EntityTrait, IntoActiveModel, ModelTrait, QueryFilter,
    QueryOrder, QuerySelect, Set, TransactionTrait,
};
use std::collections::{HashMap, HashSet};
use uuid::Uuid as NativeUuid;

use super::types::{
    ChannelOrderRequest, ChannelRequest, ChannelResponse, ChannelServer,
};
use crate::{
    authz::{self, PermissionScope},
    common::{encryption, text::sanitize_text, ApiError, AppResult},
    servers as servers_service,
};

pub(super) async fn get_channels(
    database: &DatabaseConnection,
    server_id: Uuid,
) -> AppResult<Vec<ChannelResponse>> {
    let server = servers_service::load_server(database, server_id).await?;
    let channels = channels::Entity::find()
        .filter(channels::Column::ServerId.eq(server_id))
        .order_by_asc(channels::Column::SortOrder)
        .order_by_asc(channels::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;

    Ok(channels
        .into_iter()
        .map(|channel| shape_channel(channel, &server))
        .collect())
}

pub(super) async fn get_joined_channels(
    database: &DatabaseConnection,
    server_id: Uuid,
    user_id: Uuid,
) -> AppResult<Vec<ChannelResponse>> {
    servers_service::ensure_server(database, server_id).await?;

    let server = servers_service::load_server(database, server_id).await?;
    let memberships = channel_members::Entity::find()
        .filter(channel_members::Column::UserId.eq(user_id))
        .all(database)
        .await
        .map_err(internal_error)?;

    let channel_ids: Vec<Uuid> = memberships
        .into_iter()
        .map(|member| member.channel_id)
        .collect();

    if channel_ids.is_empty() {
        return Ok(vec![]);
    }

    let channels = channels::Entity::find()
        .filter(channels::Column::ServerId.eq(server_id))
        .filter(channels::Column::Id.is_in(channel_ids))
        .order_by_asc(channels::Column::SortOrder)
        .order_by_asc(channels::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;

    Ok(channels
        .into_iter()
        .map(|channel| shape_channel(channel, &server))
        .collect())
}

pub(super) async fn get_unread_channel_ids(
    database: &DatabaseConnection,
    server_id: Uuid,
    user_id: Uuid,
) -> AppResult<Vec<Uuid>> {
    let server_channel_ids = server_channel_ids(database, server_id).await?;
    if server_channel_ids.is_empty() {
        return Ok(vec![]);
    }

    unread_channels_select(server_channel_ids, user_id)
        .into_tuple::<Uuid>()
        .all(database)
        .await
        .map_err(internal_error)
}

/// Each channel needs only a yes/no answer, so the backlog is never read back
fn unread_channels_select(
    server_channel_ids: Vec<Uuid>,
    user_id: Uuid,
) -> sea_orm::Select<channel_members::Entity> {
    let unread_messages = Alias::new("unread_messages");
    let unread_polls = Alias::new("unread_polls");

    let has_unread_message = unread_activity_exists(
        Query::select()
            .expr(Expr::val(1))
            .from_as(messages::Entity, unread_messages.clone())
            .and_where(
                Expr::col((unread_messages.clone(), messages::Column::CallId))
                    .is_null(),
            )
            .take(),
        unread_messages,
        messages::Column::ChannelId.into_iden(),
        messages::Column::UserId.into_iden(),
        messages::Column::CreatedAt.into_iden(),
        user_id,
    );

    let has_unread_poll = unread_activity_exists(
        Query::select()
            .expr(Expr::val(1))
            .from_as(polls::Entity, unread_polls.clone())
            .take(),
        unread_polls,
        polls::Column::ChannelId.into_iden(),
        polls::Column::UserId.into_iden(),
        polls::Column::CreatedAt.into_iden(),
        user_id,
    );

    channel_members::Entity::find()
        .select_only()
        .column(channel_members::Column::ChannelId)
        .filter(channel_members::Column::UserId.eq(user_id))
        .filter(channel_members::Column::ChannelId.is_in(server_channel_ids))
        .filter(
            Condition::any()
                .add(Expr::exists(has_unread_message))
                .add(Expr::exists(has_unread_poll)),
        )
}

fn unread_activity_exists(
    mut select: SelectStatement,
    alias: Alias,
    channel_column: DynIden,
    user_column: DynIden,
    created_at_column: DynIden,
    user_id: Uuid,
) -> SelectStatement {
    select
        .and_where(Expr::col((alias.clone(), channel_column)).equals((
            channel_members::Entity,
            channel_members::Column::ChannelId,
        )))
        .and_where(Expr::col((alias.clone(), user_column)).ne(user_id))
        .cond_where(
            Condition::any()
                .add(
                    Expr::col((
                        channel_members::Entity,
                        channel_members::Column::LastReadAt,
                    ))
                    .is_null(),
                )
                .add(Expr::col((alias, created_at_column)).binary(
                    BinOper::GreaterThan,
                    Expr::col((
                        channel_members::Entity,
                        channel_members::Column::LastReadAt,
                    )),
                )),
        )
        .take()
}

pub(super) async fn mark_channel_read(
    database: &DatabaseConnection,
    channel_id: Uuid,
    user_id: Uuid,
) -> AppResult<()> {
    channel_members::Entity::update_many()
        .col_expr(
            channel_members::Column::LastReadAt,
            Expr::value(Utc::now().fixed_offset()),
        )
        .filter(channel_members::Column::ChannelId.eq(channel_id))
        .filter(channel_members::Column::UserId.eq(user_id))
        .exec(database)
        .await
        .map_err(internal_error)?;

    Ok(())
}

async fn server_channel_ids(
    database: &DatabaseConnection,
    server_id: Uuid,
) -> AppResult<Vec<Uuid>> {
    channels::Entity::find()
        .select_only()
        .column(channels::Column::Id)
        .filter(channels::Column::ServerId.eq(server_id))
        .into_tuple::<Uuid>()
        .all(database)
        .await
        .map_err(internal_error)
}

pub(super) async fn get_channel_with_server(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
) -> AppResult<ChannelResponse> {
    let server = servers_service::load_server(database, server_id).await?;
    let channel = get_channel(database, server_id, channel_id).await?;
    Ok(shape_channel(channel, &server))
}

pub(super) async fn create_channel(
    database: &DatabaseConnection,
    server_id: Uuid,
    request: ChannelRequest,
) -> AppResult<ChannelResponse> {
    let server = servers_service::load_server(database, server_id).await?;
    let (name, description, channel_type) = validate_channel_request(request)?;
    let sort_order = next_sort_order(database, server_id).await?;

    let channel = channels::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        server_id: Set(server_id),
        name: Set(name),
        description: Set(description),
        channel_type: Set(channel_type),
        sort_order: Set(sort_order),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)?;
    create_channel_key(database, channel.id).await?;

    let server_members = server_members::Entity::find()
        .filter(server_members::Column::ServerId.eq(server_id))
        .all(database)
        .await
        .map_err(internal_error)?;

    for member in server_members {
        let _ = channel_members::ActiveModel {
            id: Set(NativeUuid::new_v4()),
            channel_id: Set(channel.id),
            user_id: Set(member.user_id),
            ..Default::default()
        }
        .insert(database)
        .await;
    }

    Ok(shape_channel(channel, &server))
}

pub(super) async fn update_channel_order(
    database: &DatabaseConnection,
    server_id: Uuid,
    request: ChannelOrderRequest,
) -> AppResult<()> {
    let channels = channels::Entity::find()
        .filter(channels::Column::ServerId.eq(server_id))
        .all(database)
        .await
        .map_err(internal_error)?;
    let existing_ids = channels
        .into_iter()
        .map(|channel| channel.id)
        .collect::<HashSet<_>>();
    let requested_ids =
        request.channel_ids.iter().copied().collect::<HashSet<_>>();

    if request.channel_ids.len() != existing_ids.len()
        || requested_ids.len() != request.channel_ids.len()
        || requested_ids != existing_ids
    {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Channel order must include every server channel exactly once.",
        ));
    }

    let mut updates = request
        .channel_ids
        .into_iter()
        .enumerate()
        .map(|(sort_order, channel_id)| (channel_id, sort_order as i32))
        .collect::<Vec<_>>();
    updates.sort_by_key(|(channel_id, _sort_order)| *channel_id);

    let transaction = database.begin().await.map_err(internal_error)?;
    for (channel_id, sort_order) in updates {
        channels::Entity::update_many()
            .col_expr(channels::Column::SortOrder, Expr::value(sort_order))
            .filter(channels::Column::ServerId.eq(server_id))
            .filter(channels::Column::Id.eq(channel_id))
            .exec(&transaction)
            .await
            .map_err(internal_error)?;
    }
    transaction.commit().await.map_err(internal_error)
}

pub(super) async fn update_channel(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    request: ChannelRequest,
) -> AppResult<()> {
    let (name, description, _) = validate_channel_request(request)?;
    let channel = get_channel(database, server_id, channel_id).await?;
    let mut active = channel.into_active_model();
    active.name = Set(name);
    active.description = Set(description);
    active.update(database).await.map_err(internal_error)?;
    Ok(())
}

pub(super) async fn delete_channel(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
) -> AppResult<()> {
    let channel = get_channel(database, server_id, channel_id).await?;
    channel.delete(database).await.map_err(internal_error)?;
    Ok(())
}

pub(crate) async fn get_channel(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
) -> AppResult<channels::Model> {
    channels::Entity::find_by_id(channel_id)
        .filter(channels::Column::ServerId.eq(server_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Channel not found.")
        })
}

pub(crate) async fn is_channel_member<C>(
    database: &C,
    channel_id: Uuid,
    user_id: Uuid,
) -> AppResult<bool>
where
    C: ConnectionTrait,
{
    let membership = channel_members::Entity::find()
        .filter(channel_members::Column::ChannelId.eq(channel_id))
        .filter(channel_members::Column::UserId.eq(user_id))
        .one(database)
        .await
        .map_err(internal_error)?;

    Ok(membership.is_some())
}

pub(crate) async fn ensure_channel_member<C>(
    database: &C,
    channel_id: Uuid,
    user_id: Uuid,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    if is_channel_member(database, channel_id, user_id).await? {
        Ok(())
    } else {
        Err(ApiError::new(StatusCode::FORBIDDEN, "Forbidden."))
    }
}

pub(crate) async fn can_read_channel(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    user_id: Option<Uuid>,
    invite_token: Option<&str>,
) -> AppResult<()> {
    get_channel(database, server_id, channel_id).await?;

    // Membership is one way in, not the only one. Signing in must never take
    // away access an anonymous caller would have had, so this falls through to
    // the same public and invite paths as `is_server_audience`
    if let Some(user_id) = user_id {
        if is_channel_member(database, channel_id, user_id).await? {
            return Ok(());
        }
    }

    if servers_service::default_server_id(database).await? == server_id {
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

pub(crate) async fn get_channel_member_user_ids<C>(
    database: &C,
    channel_id: Uuid,
) -> AppResult<Vec<Uuid>>
where
    C: ConnectionTrait,
{
    let members = channel_members::Entity::find()
        .filter(channel_members::Column::ChannelId.eq(channel_id))
        .all(database)
        .await
        .map_err(internal_error)?;

    Ok(members.into_iter().map(|member| member.user_id).collect())
}

pub(crate) async fn add_member_to_all_server_channels<C>(
    database: &C,
    server_id: Uuid,
    user_id: Uuid,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    let server_channels = channels::Entity::find()
        .filter(channels::Column::ServerId.eq(server_id))
        .all(database)
        .await
        .map_err(internal_error)?;
    let channel_ids: Vec<Uuid> =
        server_channels.iter().map(|channel| channel.id).collect();

    if channel_ids.is_empty() {
        return Ok(());
    }

    let existing_memberships = channel_members::Entity::find()
        .filter(channel_members::Column::UserId.eq(user_id))
        .filter(channel_members::Column::ChannelId.is_in(channel_ids.clone()))
        .all(database)
        .await
        .map_err(internal_error)?;
    let existing_channel_ids: std::collections::HashSet<Uuid> =
        existing_memberships
            .into_iter()
            .map(|membership| membership.channel_id)
            .collect();

    for channel in server_channels {
        if existing_channel_ids.contains(&channel.id) {
            continue;
        }

        channel_members::ActiveModel {
            id: Set(NativeUuid::new_v4()),
            channel_id: Set(channel.id),
            user_id: Set(user_id),
            ..Default::default()
        }
        .insert(database)
        .await
        .map_err(internal_error)?;
    }

    Ok(())
}

pub(crate) async fn create_general_channel(
    database: &DatabaseConnection,
    server_id: Uuid,
) -> AppResult<()> {
    let existing = channels::Entity::find()
        .filter(channels::Column::ServerId.eq(server_id))
        .filter(channels::Column::Name.eq("general"))
        .one(database)
        .await
        .map_err(internal_error)?;

    if existing.is_some() {
        return Ok(());
    }

    let channel = channels::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        server_id: Set(server_id),
        name: Set("general".to_owned()),
        sort_order: Set(next_sort_order(database, server_id).await?),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)?;
    create_channel_key(database, channel.id).await?;

    let members = server_members::Entity::find()
        .filter(server_members::Column::ServerId.eq(server_id))
        .all(database)
        .await
        .map_err(internal_error)?;
    for member in members {
        channel_members::ActiveModel {
            id: Set(NativeUuid::new_v4()),
            channel_id: Set(channel.id),
            user_id: Set(member.user_id),
            ..Default::default()
        }
        .insert(database)
        .await
        .map_err(internal_error)?;
    }

    Ok(())
}

async fn next_sort_order<C>(database: &C, server_id: Uuid) -> AppResult<i32>
where
    C: ConnectionTrait,
{
    let last_channel = channels::Entity::find()
        .filter(channels::Column::ServerId.eq(server_id))
        .order_by_desc(channels::Column::SortOrder)
        .one(database)
        .await
        .map_err(internal_error)?;

    Ok(last_channel.map_or(0, |channel| channel.sort_order + 1))
}

pub(super) async fn can_manage_channels(
    database: &DatabaseConnection,
    user_id: Uuid,
    server_id: Uuid,
) -> AppResult<()> {
    authz::can(
        database,
        user_id,
        "manage",
        "Channel",
        PermissionScope::Server(server_id),
    )
    .await
}

pub(crate) async fn general_channel_id(
    database: &DatabaseConnection,
    server_id: Uuid,
) -> AppResult<Option<Uuid>> {
    let channel = channels::Entity::find()
        .filter(channels::Column::ServerId.eq(server_id))
        .filter(channels::Column::Name.eq("general"))
        .one(database)
        .await
        .map_err(internal_error)?;
    Ok(channel.map(|channel| channel.id))
}

pub(crate) async fn get_unwrapped_channel_key(
    database: &DatabaseConnection,
    channel_id: Uuid,
) -> AppResult<(channel_keys::Model, Vec<u8>)> {
    let key = channel_keys::Entity::find()
        .filter(channel_keys::Column::ChannelId.eq(channel_id))
        .order_by_desc(channel_keys::Column::CreatedAt)
        .one(database)
        .await
        .map_err(internal_error)?;

    let key = match key {
        Some(key) => key,
        None => create_channel_key(database, channel_id).await?,
    };
    let unwrapped =
        encryption::unwrap_channel_key(&key.wrapped_key, &key.iv, &key.tag)?;
    Ok((key, unwrapped))
}

pub(crate) async fn get_unwrapped_channel_key_map<C>(
    database: &C,
    key_ids: Vec<Uuid>,
) -> AppResult<HashMap<Uuid, Vec<u8>>>
where
    C: ConnectionTrait,
{
    if key_ids.is_empty() {
        return Ok(HashMap::new());
    }

    let keys = channel_keys::Entity::find()
        .filter(channel_keys::Column::Id.is_in(key_ids))
        .all(database)
        .await
        .map_err(internal_error)?;
    let mut result = HashMap::with_capacity(keys.len());

    for key in keys {
        result.insert(
            key.id,
            encryption::unwrap_channel_key(
                &key.wrapped_key,
                &key.iv,
                &key.tag,
            )?,
        );
    }

    Ok(result)
}

async fn create_channel_key(
    database: &DatabaseConnection,
    channel_id: Uuid,
) -> AppResult<channel_keys::Model> {
    let encrypted = encryption::generate_channel_key()?;
    channel_keys::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        wrapped_key: Set(encrypted.ciphertext),
        iv: Set(encrypted.iv),
        tag: Set(encrypted.tag),
        channel_id: Set(channel_id),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)
}

fn shape_channel(
    channel: channels::Model,
    server: &servers::Model,
) -> ChannelResponse {
    ChannelResponse {
        id: channel.id.to_string(),
        name: channel.name,
        description: channel.description,
        channel_type: channel.channel_type,
        server: ChannelServer {
            id: server.id.to_string(),
            slug: server.slug.clone(),
        },
    }
}

fn validate_channel_request(
    request: ChannelRequest,
) -> AppResult<(String, Option<String>, ChannelType)> {
    let name = sanitize_text(&request.name).to_ascii_lowercase();
    if !(2..=30).contains(&name.chars().count()) {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Channel name must be between 2 and 30 characters.",
        ));
    }

    let description = request
        .description
        .map(|value| sanitize_text(&value))
        .filter(|value| !value.is_empty());

    if description
        .as_ref()
        .map(|value| value.chars().count() > 255)
        .unwrap_or(false)
    {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Channel description must be at most 255 characters.",
        ));
    }

    let channel_type = request.channel_type.unwrap_or(ChannelType::Text);

    Ok((name, description, channel_type))
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("channel request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
