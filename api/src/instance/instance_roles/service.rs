use axum::http::StatusCode;
use entity::{
    enums::{InstanceAbilitySubject, InstanceRoleAbilityAction},
    instance_role_members, instance_role_permissions, instance_roles, users,
};
use sea_orm::{
    prelude::Uuid, ActiveModelTrait, ColumnTrait, ConnectionTrait,
    DatabaseConnection, EntityTrait, IntoActiveModel, QueryFilter, QueryOrder,
    Set, SqlErr,
};
use std::collections::BTreeMap;
use uuid::Uuid as NativeUuid;

use super::types::{InstanceRoleResponse, RoleRequest};
use crate::{
    authz::{
        validate_permissions, PermissionRule, ADMIN_ROLE_NAME,
        DEFAULT_ROLE_COLOR,
    },
    common::{text::sanitize_text, ApiError, AppResult},
    servers::types::UserResponse,
    users as users_service,
};

const INSTANCE_SUBJECTS: &[&str] =
    &["InstanceConfig", "InstanceRole", "Server", "all"];

pub(super) async fn get_instance_role(
    database: &DatabaseConnection,
    role_id: Uuid,
) -> AppResult<InstanceRoleResponse> {
    let role = load_instance_role(database, role_id).await?;
    shape_instance_role(database, role).await
}

pub(super) async fn get_instance_roles(
    database: &DatabaseConnection,
) -> AppResult<Vec<InstanceRoleResponse>> {
    let roles = instance_roles::Entity::find()
        .order_by_asc(instance_roles::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;
    let mut responses = Vec::with_capacity(roles.len());
    for role in roles {
        responses.push(shape_instance_role(database, role).await?);
    }
    Ok(responses)
}

pub(crate) async fn get_permissions_by_user<C: ConnectionTrait>(
    database: &C,
    user_id: Uuid,
) -> AppResult<Vec<PermissionRule>> {
    let memberships = instance_role_members::Entity::find()
        .filter(instance_role_members::Column::UserId.eq(user_id))
        .all(database)
        .await
        .map_err(internal_error)?;
    let role_ids: Vec<Uuid> = memberships
        .iter()
        .map(|item| item.instance_role_id)
        .collect();
    if role_ids.is_empty() {
        return Ok(vec![]);
    }

    let permissions = instance_role_permissions::Entity::find()
        .filter(
            instance_role_permissions::Column::InstanceRoleId.is_in(role_ids),
        )
        .all(database)
        .await
        .map_err(internal_error)?;
    Ok(group_permissions(permissions))
}

pub(super) async fn get_users_eligible_for_instance_role(
    database: &DatabaseConnection,
    role_id: Uuid,
) -> AppResult<Vec<UserResponse>> {
    load_instance_role(database, role_id).await?;
    let memberships = instance_role_members::Entity::find()
        .filter(instance_role_members::Column::InstanceRoleId.eq(role_id))
        .all(database)
        .await
        .map_err(internal_error)?;
    let member_ids: Vec<Uuid> =
        memberships.iter().map(|item| item.user_id).collect();

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

pub(super) async fn create_instance_role(
    database: &DatabaseConnection,
    request: RoleRequest,
) -> AppResult<InstanceRoleResponse> {
    let (name, color) = validate_role_request(request)?;
    let role = instance_roles::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        name: Set(name),
        color: Set(color),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(map_write_error)?;
    shape_instance_role(database, role).await
}

pub(crate) async fn create_admin_instance_role<C>(
    database: &C,
    user_id: Uuid,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    let role = instance_roles::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        name: Set(ADMIN_ROLE_NAME.to_owned()),
        color: Set(DEFAULT_ROLE_COLOR.to_owned()),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(map_write_error)?;

    set_permissions(
        database,
        role.id,
        &[
            PermissionRule {
                subject: "InstanceConfig".to_owned(),
                action: vec!["manage".to_owned()],
            },
            PermissionRule {
                subject: "InstanceRole".to_owned(),
                action: vec!["manage".to_owned()],
            },
            PermissionRule {
                subject: "Server".to_owned(),
                action: vec!["manage".to_owned()],
            },
            PermissionRule {
                subject: "all".to_owned(),
                action: vec!["manage".to_owned()],
            },
        ],
    )
    .await?;
    add_member(database, role.id, user_id).await
}

pub(super) async fn update_instance_role(
    database: &DatabaseConnection,
    role_id: Uuid,
    request: RoleRequest,
) -> AppResult<()> {
    let (name, color) = validate_role_request(request)?;
    let role = load_instance_role(database, role_id).await?;
    let mut active = role.into_active_model();
    active.name = Set(name);
    active.color = Set(color);
    active.update(database).await.map_err(map_write_error)?;
    Ok(())
}

pub(super) async fn update_instance_role_permissions(
    database: &DatabaseConnection,
    role_id: Uuid,
    permissions: Vec<PermissionRule>,
) -> AppResult<()> {
    validate_permissions(&permissions, INSTANCE_SUBJECTS)?;
    load_instance_role(database, role_id).await?;
    set_permissions(database, role_id, &permissions).await
}

pub(super) async fn add_instance_role_members(
    database: &DatabaseConnection,
    role_id: Uuid,
    user_ids: &[Uuid],
) -> AppResult<()> {
    load_instance_role(database, role_id).await?;
    for user_id in user_ids {
        if users::Entity::find_by_id(*user_id)
            .one(database)
            .await
            .map_err(internal_error)?
            .is_some()
        {
            add_member(database, role_id, *user_id).await?;
        }
    }
    Ok(())
}

pub(super) async fn remove_instance_role_member(
    database: &DatabaseConnection,
    role_id: Uuid,
    user_id: Uuid,
) -> AppResult<()> {
    load_instance_role(database, role_id).await?;
    instance_role_members::Entity::delete_many()
        .filter(instance_role_members::Column::InstanceRoleId.eq(role_id))
        .filter(instance_role_members::Column::UserId.eq(user_id))
        .exec(database)
        .await
        .map_err(internal_error)?;
    Ok(())
}

pub(super) async fn delete_instance_role(
    database: &DatabaseConnection,
    role_id: Uuid,
) -> AppResult<()> {
    let role = load_instance_role(database, role_id).await?;
    instance_roles::Entity::delete_by_id(role.id)
        .exec(database)
        .await
        .map_err(internal_error)?;
    Ok(())
}

async fn shape_instance_role(
    database: &DatabaseConnection,
    role: instance_roles::Model,
) -> AppResult<InstanceRoleResponse> {
    let permissions = instance_role_permissions::Entity::find()
        .filter(instance_role_permissions::Column::InstanceRoleId.eq(role.id))
        .order_by_asc(instance_role_permissions::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;
    let members = get_role_members(database, role.id).await?;
    let member_count = members.len();
    Ok(InstanceRoleResponse {
        id: role.id.to_string(),
        name: role.name,
        color: role.color,
        permissions: group_permissions(permissions),
        member_count,
        members,
    })
}

async fn get_role_members(
    database: &DatabaseConnection,
    role_id: Uuid,
) -> AppResult<Vec<UserResponse>> {
    let memberships = instance_role_members::Entity::find()
        .filter(instance_role_members::Column::InstanceRoleId.eq(role_id))
        .order_by_asc(instance_role_members::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;
    let user_ids: Vec<Uuid> =
        memberships.iter().map(|item| item.user_id).collect();
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

fn group_permissions(
    permissions: Vec<instance_role_permissions::Model>,
) -> Vec<PermissionRule> {
    let mut grouped: BTreeMap<String, Vec<String>> = BTreeMap::new();
    for permission in permissions {
        let actions =
            grouped.entry(permission.subject.to_string()).or_default();
        let action = permission.action.to_string();
        if !actions.contains(&action) {
            actions.push(action);
        }
    }
    grouped
        .into_iter()
        .map(|(subject, action)| PermissionRule { subject, action })
        .collect()
}

async fn set_permissions<C>(
    database: &C,
    role_id: Uuid,
    permissions: &[PermissionRule],
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    instance_role_permissions::Entity::delete_many()
        .filter(instance_role_permissions::Column::InstanceRoleId.eq(role_id))
        .exec(database)
        .await
        .map_err(internal_error)?;

    for permission in permissions {
        for action in &permission.action {
            instance_role_permissions::ActiveModel {
                id: Set(NativeUuid::new_v4()),
                instance_role_id: Set(role_id),
                subject: Set(parse_instance_subject(&permission.subject)?),
                action: Set(parse_instance_action(action)?),
                ..Default::default()
            }
            .insert(database)
            .await
            .map_err(map_write_error)?;
        }
    }
    Ok(())
}

fn parse_instance_subject(value: &str) -> AppResult<InstanceAbilitySubject> {
    value.parse().map_err(|_| {
        ApiError::new(StatusCode::BAD_REQUEST, "Permission subject is invalid.")
    })
}

fn parse_instance_action(value: &str) -> AppResult<InstanceRoleAbilityAction> {
    value.parse().map_err(|_| {
        ApiError::new(StatusCode::BAD_REQUEST, "Permission action is invalid.")
    })
}

async fn add_member<C>(
    database: &C,
    role_id: Uuid,
    user_id: Uuid,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    let exists = instance_role_members::Entity::find()
        .filter(instance_role_members::Column::InstanceRoleId.eq(role_id))
        .filter(instance_role_members::Column::UserId.eq(user_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .is_some();
    if exists {
        return Ok(());
    }

    instance_role_members::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        instance_role_id: Set(role_id),
        user_id: Set(user_id),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)?;
    Ok(())
}

async fn load_instance_role(
    database: &DatabaseConnection,
    role_id: Uuid,
) -> AppResult<instance_roles::Model> {
    instance_roles::Entity::find_by_id(role_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Instance role not found.")
        })
}

fn validate_role_request(request: RoleRequest) -> AppResult<(String, String)> {
    let name = sanitize_text(&request.name);
    let color = sanitize_text(&request.color);
    if !(2..=30).contains(&name.chars().count()) {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Role name must be between 2 and 30 characters.",
        ));
    }
    if color.is_empty() || color.chars().count() > 32 {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Role color is invalid.",
        ));
    }
    Ok((name, color))
}

fn shape_user(
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

fn map_write_error(error: sea_orm::DbErr) -> ApiError {
    if matches!(error.sql_err(), Some(SqlErr::UniqueConstraintViolation(_))) {
        return ApiError::new(StatusCode::CONFLICT, "Role already exists.");
    }
    internal_error(error)
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("instance role request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
