use axum::http::StatusCode;
use entity::{
    enums::{
        InstanceAbilitySubject, InstanceRoleAbilityAction, ModerationAction,
        ModerationTargetKind,
    },
    instance_role_members, instance_role_permissions, instance_roles, users,
};
use sea_orm::{
    prelude::Uuid, ActiveModelTrait, ColumnTrait, ConnectionTrait,
    DatabaseConnection, EntityTrait, IntoActiveModel, QueryFilter, QueryOrder,
    Set, SqlErr, TransactionTrait,
};
use std::collections::BTreeMap;
use uuid::Uuid as NativeUuid;

use super::types::{InstanceRoleResponse, RoleRequest};
use crate::{
    authz::{
        self, validate_permissions, PermissionRule, ADMIN_ROLE_NAME,
        DEFAULT_ROLE_COLOR,
    },
    common::{text::sanitize_text, ApiError, AppResult},
    moderation::{self, ModerationRecord},
    servers::types::UserResponse,
    users as users_service,
};

const INSTANCE_SUBJECTS: &[&str] = &[
    "InstanceConfig",
    "InstanceRole",
    "Server",
    "Message",
    "Call",
    "User",
    "AuditLog",
    "all",
];

pub(super) async fn get_instance_role(
    database: &DatabaseConnection,
    role_id: Uuid,
) -> AppResult<InstanceRoleResponse> {
    let role = get_instance_role_record(database, role_id).await?;
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
    get_instance_role_record(database, role_id).await?;
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
    actor_user_id: Uuid,
    request: RoleRequest,
) -> AppResult<InstanceRoleResponse> {
    let (name, color) = validate_role_request(request)?;
    let transaction = database.begin().await.map_err(internal_error)?;
    let role = instance_roles::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        name: Set(name.clone()),
        color: Set(color.clone()),
        ..Default::default()
    }
    .insert(&transaction)
    .await
    .map_err(map_write_error)?;
    moderation::record_action(
        &transaction,
        ModerationRecord::direct(
            actor_user_id,
            ModerationAction::CreateRole,
            ModerationTargetKind::InstanceRole,
            role.id,
            None,
            None,
        )
        .with_target_label(name.clone())
        .with_values(None, Some(role_snapshot(&name, &color))),
    )
    .await?;
    transaction.commit().await.map_err(internal_error)?;
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
    add_member(database, role.id, user_id).await?;
    Ok(())
}

pub(super) async fn update_instance_role(
    database: &DatabaseConnection,
    role_id: Uuid,
    actor_user_id: Uuid,
    request: RoleRequest,
) -> AppResult<()> {
    let (name, color) = validate_role_request(request)?;
    let transaction = database.begin().await.map_err(internal_error)?;
    let role = get_instance_role_record(&transaction, role_id).await?;
    if role.name != name || role.color != color {
        let before = role_snapshot(&role.name, &role.color);
        let target_label = role.name.clone();
        let mut active = role.into_active_model();
        active.name = Set(name.clone());
        active.color = Set(color.clone());
        active.update(&transaction).await.map_err(map_write_error)?;
        moderation::record_action(
            &transaction,
            ModerationRecord::direct(
                actor_user_id,
                ModerationAction::UpdateRole,
                ModerationTargetKind::InstanceRole,
                role_id,
                None,
                None,
            )
            .with_target_label(target_label)
            .with_values(Some(before), Some(role_snapshot(&name, &color))),
        )
        .await?;
    }
    transaction.commit().await.map_err(internal_error)?;
    Ok(())
}

pub(super) async fn update_instance_role_permissions(
    database: &DatabaseConnection,
    role_id: Uuid,
    actor_user_id: Uuid,
    permissions: Vec<PermissionRule>,
) -> AppResult<()> {
    validate_permissions(
        &permissions,
        INSTANCE_SUBJECTS,
        authz::INSTANCE_CAPABILITY_ACTIONS,
    )?;
    let transaction = database.begin().await.map_err(internal_error)?;
    let role = get_instance_role_record(&transaction, role_id).await?;
    let before = get_role_permissions(&transaction, role_id).await?;
    if normalized_permissions(&before) != normalized_permissions(&permissions) {
        set_permissions(&transaction, role_id, &permissions).await?;
        moderation::record_action(
            &transaction,
            ModerationRecord::direct(
                actor_user_id,
                ModerationAction::UpdateRolePermissions,
                ModerationTargetKind::InstanceRole,
                role_id,
                None,
                None,
            )
            .with_target_label(role.name)
            .with_values(
                Some(permissions_snapshot(before)),
                Some(permissions_snapshot(permissions)),
            ),
        )
        .await?;
    }
    transaction.commit().await.map_err(internal_error)?;
    Ok(())
}

pub(super) async fn add_instance_role_members(
    database: &DatabaseConnection,
    role_id: Uuid,
    actor_user_id: Uuid,
    user_ids: &[Uuid],
) -> AppResult<()> {
    let transaction = database.begin().await.map_err(internal_error)?;
    let role = get_instance_role_record(&transaction, role_id).await?;
    let before = get_role_member_ids(&transaction, role_id).await?;
    let mut changed = false;
    for user_id in user_ids {
        if users::Entity::find_by_id(*user_id)
            .one(&transaction)
            .await
            .map_err(internal_error)?
            .is_some()
        {
            changed |= add_member(&transaction, role_id, *user_id).await?;
        }
    }
    if changed {
        let after = get_role_member_ids(&transaction, role_id).await?;
        moderation::record_action(
            &transaction,
            ModerationRecord::direct(
                actor_user_id,
                ModerationAction::AddRoleMembers,
                ModerationTargetKind::InstanceRole,
                role_id,
                None,
                None,
            )
            .with_target_label(role.name)
            .with_values(
                Some(member_snapshot(before)),
                Some(member_snapshot(after)),
            ),
        )
        .await?;
    }
    transaction.commit().await.map_err(internal_error)?;
    Ok(())
}

pub(super) async fn remove_instance_role_member(
    database: &DatabaseConnection,
    role_id: Uuid,
    user_id: Uuid,
    actor_user_id: Uuid,
) -> AppResult<()> {
    let transaction = database.begin().await.map_err(internal_error)?;
    let role = get_instance_role_record(&transaction, role_id).await?;
    let before = get_role_member_ids(&transaction, role_id).await?;
    let result = instance_role_members::Entity::delete_many()
        .filter(instance_role_members::Column::InstanceRoleId.eq(role_id))
        .filter(instance_role_members::Column::UserId.eq(user_id))
        .exec(&transaction)
        .await
        .map_err(internal_error)?;
    if result.rows_affected > 0 {
        let after = get_role_member_ids(&transaction, role_id).await?;
        moderation::record_action(
            &transaction,
            ModerationRecord::direct(
                actor_user_id,
                ModerationAction::RemoveRoleMember,
                ModerationTargetKind::InstanceRole,
                role_id,
                None,
                None,
            )
            .with_target_label(role.name)
            .with_values(
                Some(member_snapshot(before)),
                Some(member_snapshot(after)),
            ),
        )
        .await?;
    }
    transaction.commit().await.map_err(internal_error)?;
    Ok(())
}

pub(super) async fn delete_instance_role(
    database: &DatabaseConnection,
    role_id: Uuid,
    actor_user_id: Uuid,
) -> AppResult<()> {
    let transaction = database.begin().await.map_err(internal_error)?;
    let role = get_instance_role_record(&transaction, role_id).await?;
    let permissions = get_role_permissions(&transaction, role_id).await?;
    let members = get_role_member_ids(&transaction, role_id).await?;
    let target_label = role.name.clone();
    let before = serde_json::json!({
        "name": role.name.clone(),
        "color": role.color.clone(),
        "permissions": normalized_permissions(&permissions),
        "memberIds": sorted_ids(members),
    });
    instance_roles::Entity::delete_by_id(role.id)
        .exec(&transaction)
        .await
        .map_err(internal_error)?;
    moderation::record_action(
        &transaction,
        ModerationRecord::direct(
            actor_user_id,
            ModerationAction::DeleteRole,
            ModerationTargetKind::InstanceRole,
            role_id,
            None,
            None,
        )
        .with_target_label(target_label)
        .with_values(Some(before), None),
    )
    .await?;
    transaction.commit().await.map_err(internal_error)?;
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
) -> AppResult<bool>
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
        return Ok(false);
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
    Ok(true)
}

async fn get_role_permissions<C: ConnectionTrait>(
    database: &C,
    role_id: Uuid,
) -> AppResult<Vec<PermissionRule>> {
    Ok(group_permissions(
        instance_role_permissions::Entity::find()
            .filter(
                instance_role_permissions::Column::InstanceRoleId.eq(role_id),
            )
            .all(database)
            .await
            .map_err(internal_error)?,
    ))
}

async fn get_role_member_ids<C: ConnectionTrait>(
    database: &C,
    role_id: Uuid,
) -> AppResult<Vec<Uuid>> {
    Ok(instance_role_members::Entity::find()
        .filter(instance_role_members::Column::InstanceRoleId.eq(role_id))
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .map(|membership| membership.user_id)
        .collect())
}

fn role_snapshot(name: &str, color: &str) -> serde_json::Value {
    serde_json::json!({ "name": name, "color": color })
}

fn normalized_permissions(
    permissions: &[PermissionRule],
) -> Vec<PermissionRule> {
    // Combine actions from rules that share the same subject
    let mut grouped = BTreeMap::<String, Vec<String>>::new();
    for permission in permissions {
        let actions = grouped.entry(permission.subject.clone()).or_default();
        actions.extend(permission.action.iter().cloned());
    }
    grouped
        .into_iter()
        .map(|(subject, mut action)| {
            action.sort();
            action.dedup();
            PermissionRule { subject, action }
        })
        .collect()
}

fn permissions_snapshot(permissions: Vec<PermissionRule>) -> serde_json::Value {
    serde_json::json!({ "permissions": normalized_permissions(&permissions) })
}

fn sorted_ids(mut ids: Vec<Uuid>) -> Vec<String> {
    ids.sort();
    ids.into_iter().map(|id| id.to_string()).collect()
}

fn member_snapshot(ids: Vec<Uuid>) -> serde_json::Value {
    serde_json::json!({ "memberIds": sorted_ids(ids) })
}

async fn get_instance_role_record<C: ConnectionTrait>(
    database: &C,
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
