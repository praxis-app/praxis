use axum::http::StatusCode;
use entity::{
    enums::{
        ModerationAction, ModerationTargetKind, NotificationKind,
        ServerAbilitySubject, ServerRoleAbilityAction,
    },
    notifications, server_members, server_role_members,
    server_role_permissions, server_roles, users,
};
use sea_orm::{
    prelude::Uuid, ActiveModelTrait, ColumnTrait, ConnectionTrait,
    DatabaseConnection, EntityTrait, IntoActiveModel, QueryFilter, QueryOrder,
    Set, SqlErr, TransactionTrait,
};
use std::collections::{BTreeMap, HashSet};
use uuid::Uuid as NativeUuid;

use super::types::{RoleRequest, ServerRoleResponse};
use crate::{
    authz::{
        self, validate_permissions, PermissionMap, PermissionRule,
        ADMIN_ROLE_NAME, DEFAULT_ROLE_COLOR,
    },
    common::{text::sanitize_text, ApiError, AppResult},
    moderation::{self, ModerationRecord},
    notifications as notifications_service,
    servers::{self, types::UserResponse},
    users as users_service,
};

// NOTE: `Message` is reserved for future moderation permissions and is
// not enforced yet, so granting it currently changes nothing
const SERVER_SUBJECTS: &[&str] = &[
    "ServerConfig",
    "Channel",
    "Invite",
    "Message",
    "ServerRole",
    "ProposalBlock",
    "ServerMember",
    "Call",
    "AuditLog",
    "all",
];

pub(super) async fn get_server_role(
    database: &DatabaseConnection,
    server_id: Uuid,
    role_id: Uuid,
) -> AppResult<ServerRoleResponse> {
    let role = get_server_role_record(database, server_id, role_id).await?;
    shape_server_role(database, role).await
}

pub(super) async fn get_server_roles(
    database: &DatabaseConnection,
    server_id: Uuid,
) -> AppResult<Vec<ServerRoleResponse>> {
    servers::service::ensure_server(database, server_id).await?;
    let roles = server_roles::Entity::find()
        .filter(server_roles::Column::ServerId.eq(server_id))
        .order_by_asc(server_roles::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;

    let mut responses = Vec::with_capacity(roles.len());
    for role in roles {
        responses.push(shape_server_role(database, role).await?);
    }
    Ok(responses)
}

pub(crate) async fn get_permissions_by_user<C: ConnectionTrait>(
    database: &C,
    user_id: Uuid,
) -> AppResult<PermissionMap> {
    Ok(get_permissions_by_users(database, &[user_id])
        .await?
        .remove(&user_id)
        .unwrap_or_default())
}

pub(crate) async fn get_permissions_by_users<C: ConnectionTrait>(
    database: &C,
    user_ids: &[Uuid],
) -> AppResult<BTreeMap<Uuid, PermissionMap>> {
    if user_ids.is_empty() {
        return Ok(BTreeMap::new());
    }

    let memberships = server_role_members::Entity::find()
        .filter(server_role_members::Column::UserId.is_in(user_ids.to_vec()))
        .all(database)
        .await
        .map_err(internal_error)?;
    let role_ids: Vec<Uuid> = memberships
        .iter()
        .map(|item| item.server_role_id)
        .collect::<HashSet<_>>()
        .into_iter()
        .collect();
    if role_ids.is_empty() {
        return Ok(BTreeMap::new());
    }

    let roles = server_roles::Entity::find()
        .filter(server_roles::Column::Id.is_in(role_ids))
        .all(database)
        .await
        .map_err(internal_error)?;
    let role_ids: Vec<Uuid> = roles.iter().map(|role| role.id).collect();
    let permissions = server_role_permissions::Entity::find()
        .filter(server_role_permissions::Column::ServerRoleId.is_in(role_ids))
        .all(database)
        .await
        .map_err(internal_error)?;

    let current_memberships: HashSet<(Uuid, Uuid)> =
        server_members::Entity::find()
            .filter(server_members::Column::UserId.is_in(user_ids.to_vec()))
            .all(database)
            .await
            .map_err(internal_error)?
            .into_iter()
            .map(|member| (member.user_id, member.server_id))
            .collect();

    let role_server_ids: BTreeMap<Uuid, Uuid> = roles
        .into_iter()
        .map(|role| (role.id, role.server_id))
        .collect();
    let mut permissions_by_role: BTreeMap<
        Uuid,
        Vec<server_role_permissions::Model>,
    > = BTreeMap::new();
    for permission in permissions {
        permissions_by_role
            .entry(permission.server_role_id)
            .or_default()
            .push(permission);
    }

    let mut raw: BTreeMap<
        Uuid,
        BTreeMap<String, Vec<server_role_permissions::Model>>,
    > = BTreeMap::new();
    for membership in memberships {
        let Some(server_id) = role_server_ids.get(&membership.server_role_id)
        else {
            continue;
        };
        if !current_memberships.contains(&(membership.user_id, *server_id)) {
            continue;
        }
        let Some(permissions) =
            permissions_by_role.get(&membership.server_role_id)
        else {
            continue;
        };
        raw.entry(membership.user_id)
            .or_default()
            .entry(server_id.to_string())
            .or_default()
            .extend(permissions.iter().cloned());
    }

    Ok(raw
        .into_iter()
        .map(|(user_id, permissions_by_server)| {
            let permissions = permissions_by_server
                .into_iter()
                .map(|(server_id, permissions)| {
                    (server_id, group_permissions(permissions))
                })
                .collect();
            (user_id, permissions)
        })
        .collect())
}

pub(super) async fn get_users_eligible_for_server_role(
    database: &DatabaseConnection,
    server_id: Uuid,
    role_id: Uuid,
) -> AppResult<Vec<UserResponse>> {
    get_server_role_record(database, server_id, role_id).await?;
    let memberships = server_role_members::Entity::find()
        .filter(server_role_members::Column::ServerRoleId.eq(role_id))
        .all(database)
        .await
        .map_err(internal_error)?;
    let member_ids: Vec<Uuid> =
        memberships.iter().map(|item| item.user_id).collect();

    let user_ids: Vec<Uuid> =
        servers::service::get_server_member_user_ids(database, server_id)
            .await?
            .into_iter()
            .filter(|user_id| !member_ids.contains(user_id))
            .collect();

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

pub(super) async fn create_server_role(
    database: &DatabaseConnection,
    server_id: Uuid,
    actor_user_id: Uuid,
    request: RoleRequest,
) -> AppResult<ServerRoleResponse> {
    servers::service::ensure_server(database, server_id).await?;
    let (name, color) = validate_role_request(request)?;
    let transaction = database.begin().await.map_err(internal_error)?;
    let role = server_roles::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        server_id: Set(server_id),
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
            ModerationTargetKind::ServerRole,
            role.id,
            Some(server_id),
            None,
        )
        .with_target_label(name.clone())
        .with_values(None, Some(role_snapshot(&name, &color))),
    )
    .await?;
    transaction.commit().await.map_err(internal_error)?;
    shape_server_role(database, role).await
}

pub(crate) async fn create_admin_server_role<C>(
    database: &C,
    server_id: Uuid,
    user_id: Uuid,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    let role = server_roles::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        server_id: Set(server_id),
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
                subject: "ServerConfig".to_owned(),
                action: vec!["manage".to_owned()],
            },
            PermissionRule {
                subject: "Channel".to_owned(),
                action: vec!["manage".to_owned()],
            },
            PermissionRule {
                subject: "Invite".to_owned(),

                // TODO: Remove redundant `create` once the frontend treats `manage`
                // as satisfying narrower invite permission checks
                action: vec!["create".to_owned(), "manage".to_owned()],
            },
            PermissionRule {
                subject: "ServerRole".to_owned(),
                action: vec!["manage".to_owned()],
            },
            PermissionRule {
                subject: "ServerMember".to_owned(),
                action: vec!["manage".to_owned()],
            },
            PermissionRule {
                subject: "Message".to_owned(),
                action: vec!["delete".to_owned()],
            },
            PermissionRule {
                subject: "Call".to_owned(),
                action: vec!["manage".to_owned()],
            },
            PermissionRule {
                subject: "AuditLog".to_owned(),
                action: vec!["read".to_owned()],
            },
        ],
    )
    .await?;
    add_member(database, role.id, user_id).await?;
    Ok(())
}

pub(super) async fn update_server_role(
    database: &DatabaseConnection,
    server_id: Uuid,
    role_id: Uuid,
    actor_user_id: Uuid,
    request: RoleRequest,
) -> AppResult<()> {
    let (name, color) = validate_role_request(request)?;
    let transaction = database.begin().await.map_err(internal_error)?;
    let role = get_server_role_record(&transaction, server_id, role_id).await?;
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
                ModerationTargetKind::ServerRole,
                role_id,
                Some(server_id),
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

pub(super) async fn update_server_role_permissions(
    database: &DatabaseConnection,
    server_id: Uuid,
    role_id: Uuid,
    actor_user_id: Uuid,
    permissions: Vec<PermissionRule>,
) -> AppResult<()> {
    validate_permissions(
        &permissions,
        SERVER_SUBJECTS,
        authz::SERVER_CAPABILITY_ACTIONS,
    )?;
    let transaction = database.begin().await.map_err(internal_error)?;
    let role = get_server_role_record(&transaction, server_id, role_id).await?;
    let before = get_role_permissions(&transaction, role_id).await?;
    if normalized_permissions(&before) != normalized_permissions(&permissions) {
        set_permissions(&transaction, role_id, &permissions).await?;
        moderation::record_action(
            &transaction,
            ModerationRecord::direct(
                actor_user_id,
                ModerationAction::UpdateRolePermissions,
                ModerationTargetKind::ServerRole,
                role_id,
                Some(server_id),
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

pub(super) async fn add_server_role_members(
    database: &DatabaseConnection,
    server_id: Uuid,
    role_id: Uuid,
    actor_user_id: Uuid,
    user_ids: &[Uuid],
) -> AppResult<Vec<notifications::Model>> {
    let transaction = database.begin().await.map_err(internal_error)?;
    let role = get_server_role_record(&transaction, server_id, role_id).await?;
    let before = get_role_member_ids(&transaction, role_id).await?;
    let mut granted_user_ids = Vec::new();
    for user_id in user_ids {
        if users::Entity::find_by_id(*user_id)
            .one(&transaction)
            .await
            .map_err(internal_error)?
            .is_none()
        {
            continue;
        }

        // A server role only grants standing within its own server, so it
        // cannot be handed to someone who has not joined that server. The
        // proposal path enforces the same rule in `poll_actions::roles`
        if !servers::is_server_member(&transaction, server_id, *user_id).await?
        {
            return Err(ApiError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "Server roles can only be granted to server members.",
            ));
        }

        if add_member(&transaction, role_id, *user_id).await? {
            granted_user_ids.push(*user_id);
        }
    }
    if !granted_user_ids.is_empty() {
        let after = get_role_member_ids(&transaction, role_id).await?;
        moderation::record_action(
            &transaction,
            ModerationRecord::direct(
                actor_user_id,
                ModerationAction::AddRoleMembers,
                ModerationTargetKind::ServerRole,
                role_id,
                Some(server_id),
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
    let notifications = notifications_service::create_notifications(
        &transaction,
        notifications_service::CreateNotificationsRequest {
            kind: NotificationKind::ServerRoleGranted,
            server_id,
            channel_id: None,
            actor_user_id: Some(actor_user_id),
            target: notifications_service::NotificationTarget::ServerRole(
                role_id,
            ),
            vote_type: None,
            recipient_ids: granted_user_ids,
        },
    )
    .await?;
    transaction.commit().await.map_err(internal_error)?;
    Ok(notifications)
}

pub(super) async fn remove_server_role_member(
    database: &DatabaseConnection,
    server_id: Uuid,
    role_id: Uuid,
    user_id: Uuid,
    actor_user_id: Uuid,
) -> AppResult<()> {
    let transaction = database.begin().await.map_err(internal_error)?;
    let role = get_server_role_record(&transaction, server_id, role_id).await?;
    let before = get_role_member_ids(&transaction, role_id).await?;
    let result = server_role_members::Entity::delete_many()
        .filter(server_role_members::Column::ServerRoleId.eq(role_id))
        .filter(server_role_members::Column::UserId.eq(user_id))
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
                ModerationTargetKind::ServerRole,
                role_id,
                Some(server_id),
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

pub(super) async fn delete_server_role(
    database: &DatabaseConnection,
    server_id: Uuid,
    role_id: Uuid,
    actor_user_id: Uuid,
) -> AppResult<()> {
    let transaction = database.begin().await.map_err(internal_error)?;
    let role = get_server_role_record(&transaction, server_id, role_id).await?;
    let permissions = get_role_permissions(&transaction, role_id).await?;
    let members = get_role_member_ids(&transaction, role_id).await?;
    let target_label = role.name.clone();
    let before = serde_json::json!({
        "name": role.name.clone(),
        "color": role.color.clone(),
        "permissions": normalized_permissions(&permissions),
        "memberIds": sorted_ids(members),
    });
    server_roles::Entity::delete_by_id(role.id)
        .exec(&transaction)
        .await
        .map_err(internal_error)?;
    moderation::record_action(
        &transaction,
        ModerationRecord::direct(
            actor_user_id,
            ModerationAction::DeleteRole,
            ModerationTargetKind::ServerRole,
            role_id,
            Some(server_id),
            None,
        )
        .with_target_label(target_label)
        .with_values(Some(before), None),
    )
    .await?;
    transaction.commit().await.map_err(internal_error)?;
    Ok(())
}

async fn shape_server_role(
    database: &DatabaseConnection,
    role: server_roles::Model,
) -> AppResult<ServerRoleResponse> {
    let permissions = server_role_permissions::Entity::find()
        .filter(server_role_permissions::Column::ServerRoleId.eq(role.id))
        .order_by_asc(server_role_permissions::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;
    let members = get_role_members(database, role.id).await?;
    let member_count = members.len();
    Ok(ServerRoleResponse {
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
    let memberships = server_role_members::Entity::find()
        .filter(server_role_members::Column::ServerRoleId.eq(role_id))
        .order_by_asc(server_role_members::Column::CreatedAt)
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
    permissions: Vec<server_role_permissions::Model>,
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
    server_role_permissions::Entity::delete_many()
        .filter(server_role_permissions::Column::ServerRoleId.eq(role_id))
        .exec(database)
        .await
        .map_err(internal_error)?;

    for permission in permissions {
        for action in &permission.action {
            server_role_permissions::ActiveModel {
                id: Set(NativeUuid::new_v4()),
                server_role_id: Set(role_id),
                subject: Set(parse_server_subject(&permission.subject)?),
                action: Set(parse_server_action(action)?),
                ..Default::default()
            }
            .insert(database)
            .await
            .map_err(map_write_error)?;
        }
    }
    Ok(())
}

fn parse_server_subject(value: &str) -> AppResult<ServerAbilitySubject> {
    value.parse().map_err(|_| {
        ApiError::new(StatusCode::BAD_REQUEST, "Permission subject is invalid.")
    })
}

fn parse_server_action(value: &str) -> AppResult<ServerRoleAbilityAction> {
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
    let exists = server_role_members::Entity::find()
        .filter(server_role_members::Column::ServerRoleId.eq(role_id))
        .filter(server_role_members::Column::UserId.eq(user_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .is_some();
    if exists {
        return Ok(false);
    }

    server_role_members::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        server_role_id: Set(role_id),
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
        server_role_permissions::Entity::find()
            .filter(server_role_permissions::Column::ServerRoleId.eq(role_id))
            .all(database)
            .await
            .map_err(internal_error)?,
    ))
}

async fn get_role_member_ids<C: ConnectionTrait>(
    database: &C,
    role_id: Uuid,
) -> AppResult<Vec<Uuid>> {
    Ok(server_role_members::Entity::find()
        .filter(server_role_members::Column::ServerRoleId.eq(role_id))
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

pub(crate) async fn get_server_role_record<C: ConnectionTrait>(
    database: &C,
    server_id: Uuid,
    role_id: Uuid,
) -> AppResult<server_roles::Model> {
    server_roles::Entity::find_by_id(role_id)
        .filter(server_roles::Column::ServerId.eq(server_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Server role not found.")
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
    tracing::error!("server role request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
