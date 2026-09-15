//! Owns create-role and change-role action validation, persistence,
//! implementation, permission and membership changes, and response shaping

use axum::http::StatusCode;
use entity::{
    channels,
    enums::{
        NotificationKind, PollActionPermissionAbilityAction,
        PollActionPermissionChangeType, PollActionPermissionSubject,
        PollActionRoleMemberChangeType, ServerAbilitySubject,
        ServerRoleAbilityAction,
    },
    notifications, poll_action_permissions, poll_action_role_members,
    poll_action_roles, polls, server_members, server_role_members,
    server_role_permissions, server_roles, users,
};
use sea_orm::{
    prelude::Uuid, ActiveModelTrait, ColumnTrait, ConnectionTrait,
    DatabaseConnection, DatabaseTransaction, EntityTrait, IntoActiveModel,
    QueryFilter, Set,
};
use std::collections::{BTreeMap, HashMap, HashSet};
use uuid::Uuid as NativeUuid;

use super::types::{
    CreatePollActionServerRoleRequest, PollActionPermissionResponse,
    PollActionServerRoleMemberResponse, PollActionServerRoleResponse,
    PollActionUserResponse,
};
use crate::{
    common::{request::parse_uuid, ApiError, AppResult},
    users as users_service,
};

pub(super) fn validate_role_change_payload(
    role: &CreatePollActionServerRoleRequest,
) -> AppResult<()> {
    if role.server_role_to_update_id.is_none() {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Polls to change server roles must include a server role to update.",
        ));
    }

    let has_change = role.name.is_some()
        || role.color.is_some()
        || role
            .members
            .as_ref()
            .is_some_and(|members| !members.is_empty())
        || role
            .permissions
            .as_ref()
            .is_some_and(|permissions| !permissions.is_empty());
    if !has_change {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Polls to change server roles must include at least 1 change.",
        ));
    }
    Ok(())
}

pub(super) async fn create_poll_action_role<C: ConnectionTrait>(
    database: &C,
    poll_action_id: Uuid,
    server_id: Uuid,
    request: CreatePollActionServerRoleRequest,
) -> AppResult<poll_action_roles::Model> {
    let server_role_id = request
        .server_role_to_update_id
        .as_deref()
        .map(|value| parse_uuid(value, "serverRoleToUpdateId"))
        .transpose()?;

    let role_to_update = if let Some(server_role_id) = server_role_id {
        Some(get_server_role_model(database, server_id, server_role_id).await?)
    } else {
        None
    };

    let name = request.name.map(|value| value.trim().to_owned());
    let color = request.color.map(|value| value.trim().to_owned());

    let prev_name = name
        .as_deref()
        .filter(|value| !value.is_empty())
        .and_then(|_| role_to_update.as_ref().map(|role| role.name.clone()));

    let prev_color = color
        .as_deref()
        .filter(|value| !value.is_empty())
        .and_then(|_| role_to_update.as_ref().map(|role| role.color.clone()));

    let role = poll_action_roles::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        poll_action_id: Set(poll_action_id),
        server_role_id: Set(server_role_id),
        prev_name: Set(prev_name),
        prev_color: Set(prev_color),
        name: Set(name),
        color: Set(color),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)?;

    if let Some(permissions) = request.permissions {
        for permission in permissions {
            for action in permission.actions {
                poll_action_permissions::ActiveModel {
                    id: Set(NativeUuid::new_v4()),
                    poll_action_role_id: Set(role.id),
                    subject: Set(parse_poll_action_permission_subject(
                        &permission.subject,
                    )?),
                    action: Set(parse_poll_action_permission_action(
                        &action.action,
                    )?),
                    change_type: Set(action.change_type),
                    ..Default::default()
                }
                .insert(database)
                .await
                .map_err(internal_error)?;
            }
        }
    }

    if let Some(members) = request.members {
        for member in members {
            poll_action_role_members::ActiveModel {
                id: Set(NativeUuid::new_v4()),
                poll_action_role_id: Set(role.id),
                user_id: Set(parse_uuid(&member.user_id, "userId")?),
                change_type: Set(member.change_type),
                ..Default::default()
            }
            .insert(database)
            .await
            .map_err(internal_error)?;
        }
    }

    Ok(role)
}

pub(super) async fn implement_change_server_role(
    database: &DatabaseTransaction,
    poll_id: Uuid,
    poll_action_id: Uuid,
) -> AppResult<Vec<notifications::Model>> {
    let action_role = get_action_role(database, poll_action_id).await?;
    let role_id = action_role.server_role_id.ok_or_else(|| {
        ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Server role is required.",
        )
    })?;

    // Re-derive the server from the poll rather than trusting the stored
    // role id, so a ratified proposal can only ever change a role in the
    // server it was proposed in
    let server_id = poll_server_id(database, poll_id).await?;
    let role = get_server_role_model(database, server_id, role_id).await?;

    if action_role.name.is_some() || action_role.color.is_some() {
        let mut active = role.clone().into_active_model();
        if let Some(name) = action_role.name {
            active.name = Set(name);
        }
        if let Some(color) = action_role.color {
            active.color = Set(color);
        }
        active.update(database).await.map_err(internal_error)?;
    }

    apply_permission_changes(database, role_id, action_role.id).await?;
    apply_member_changes(database, server_id, role_id, action_role.id).await
}

pub(super) async fn implement_create_server_role(
    database: &DatabaseTransaction,
    poll_id: Uuid,
    poll_action_id: Uuid,
) -> AppResult<Vec<notifications::Model>> {
    let action_role = get_action_role(database, poll_action_id).await?;
    let server_id = poll_server_id(database, poll_id).await?;
    let name = action_role.name.ok_or_else(|| {
        ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Role name is required.",
        )
    })?;
    let color = action_role.color.ok_or_else(|| {
        ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Role color is required.",
        )
    })?;
    let role = server_roles::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        server_id: Set(server_id),
        name: Set(name),
        color: Set(color),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)?;

    copy_action_permissions(database, role.id, action_role.id).await?;
    apply_member_changes(database, server_id, role.id, action_role.id).await
}

// Resolves the server a poll belongs to through its channel. Poll actions
// derive their scope from this rather than from client-supplied ids
async fn poll_server_id<C: ConnectionTrait>(
    database: &C,
    poll_id: Uuid,
) -> AppResult<Uuid> {
    let poll = polls::Entity::find_by_id(poll_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Poll not found.")
        })?;
    let channel = channels::Entity::find_by_id(poll.channel_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Channel not found.")
        })?;

    Ok(channel.server_id)
}

async fn get_server_role_model<C: ConnectionTrait>(
    database: &C,
    server_id: Uuid,
    server_role_id: Uuid,
) -> AppResult<server_roles::Model> {
    server_roles::Entity::find_by_id(server_role_id)
        .filter(server_roles::Column::ServerId.eq(server_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Server role not found.")
        })
}

async fn get_action_role(
    database: &DatabaseTransaction,
    poll_action_id: Uuid,
) -> AppResult<poll_action_roles::Model> {
    poll_action_roles::Entity::find()
        .filter(poll_action_roles::Column::PollActionId.eq(poll_action_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Poll action role not found.")
        })
}

async fn apply_permission_changes(
    database: &DatabaseTransaction,
    role_id: Uuid,
    action_role_id: Uuid,
) -> AppResult<()> {
    let permissions = poll_action_permissions::Entity::find()
        .filter(
            poll_action_permissions::Column::PollActionRoleId
                .eq(action_role_id),
        )
        .all(database)
        .await
        .map_err(internal_error)?;

    for permission in permissions {
        if permission.change_type == PollActionPermissionChangeType::Remove {
            server_role_permissions::Entity::delete_many()
                .filter(
                    server_role_permissions::Column::ServerRoleId.eq(role_id),
                )
                .filter(
                    server_role_permissions::Column::Subject
                        .eq(ServerAbilitySubject::from(permission.subject)),
                )
                .filter(
                    server_role_permissions::Column::Action
                        .eq(ServerRoleAbilityAction::from(permission.action)),
                )
                .exec(database)
                .await
                .map_err(internal_error)?;
        } else if permission.change_type == PollActionPermissionChangeType::Add
        {
            add_role_permission(
                database,
                role_id,
                permission.subject.into(),
                permission.action.into(),
            )
            .await?;
        }
    }
    Ok(())
}

async fn copy_action_permissions(
    database: &DatabaseTransaction,
    role_id: Uuid,
    action_role_id: Uuid,
) -> AppResult<()> {
    let permissions = poll_action_permissions::Entity::find()
        .filter(
            poll_action_permissions::Column::PollActionRoleId
                .eq(action_role_id),
        )
        .all(database)
        .await
        .map_err(internal_error)?;
    for permission in permissions {
        if permission.change_type == PollActionPermissionChangeType::Add {
            add_role_permission(
                database,
                role_id,
                permission.subject.into(),
                permission.action.into(),
            )
            .await?;
        }
    }
    Ok(())
}

async fn add_role_permission(
    database: &DatabaseTransaction,
    role_id: Uuid,
    subject: ServerAbilitySubject,
    action: ServerRoleAbilityAction,
) -> AppResult<()> {
    if server_role_permissions::Entity::find()
        .filter(server_role_permissions::Column::ServerRoleId.eq(role_id))
        .filter(server_role_permissions::Column::Subject.eq(subject))
        .filter(server_role_permissions::Column::Action.eq(action))
        .one(database)
        .await
        .map_err(internal_error)?
        .is_some()
    {
        return Ok(());
    }
    server_role_permissions::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        server_role_id: Set(role_id),
        subject: Set(subject),
        action: Set(action),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)?;
    Ok(())
}

async fn apply_member_changes(
    database: &DatabaseTransaction,
    server_id: Uuid,
    role_id: Uuid,
    action_role_id: Uuid,
) -> AppResult<Vec<notifications::Model>> {
    let members = poll_action_role_members::Entity::find()
        .filter(
            poll_action_role_members::Column::PollActionRoleId
                .eq(action_role_id),
        )
        .all(database)
        .await
        .map_err(internal_error)?;
    let added_user_ids: HashSet<Uuid> = members
        .iter()
        .filter(|member| {
            member.change_type == PollActionRoleMemberChangeType::Add
        })
        .map(|member| member.user_id)
        .collect();
    let eligible_added_user_ids: HashSet<Uuid> = server_members::Entity::find()
        .filter(server_members::Column::ServerId.eq(server_id))
        .filter(
            server_members::Column::UserId
                .is_in(added_user_ids.iter().copied()),
        )
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .map(|membership| membership.user_id)
        .collect();
    let mut existing_role_member_ids: HashSet<Uuid> =
        server_role_members::Entity::find()
            .filter(server_role_members::Column::ServerRoleId.eq(role_id))
            .filter(
                server_role_members::Column::UserId
                    .is_in(added_user_ids.iter().copied()),
            )
            .all(database)
            .await
            .map_err(internal_error)?
            .into_iter()
            .map(|membership| membership.user_id)
            .collect();
    let mut granted_user_ids = Vec::new();
    for member in members {
        // A role only ever grants standing within its own server, so a
        // proposed member who does not belong to that server is skipped
        // rather than silently granted access to it
        if member.change_type == PollActionRoleMemberChangeType::Add
            && !eligible_added_user_ids.contains(&member.user_id)
        {
            continue;
        }

        if member.change_type == PollActionRoleMemberChangeType::Remove {
            server_role_members::Entity::delete_many()
                .filter(server_role_members::Column::ServerRoleId.eq(role_id))
                .filter(server_role_members::Column::UserId.eq(member.user_id))
                .exec(database)
                .await
                .map_err(internal_error)?;
        } else if member.change_type == PollActionRoleMemberChangeType::Add
            && existing_role_member_ids.insert(member.user_id)
        {
            server_role_members::ActiveModel {
                id: Set(NativeUuid::new_v4()),
                server_role_id: Set(role_id),
                user_id: Set(member.user_id),
                ..Default::default()
            }
            .insert(database)
            .await
            .map_err(internal_error)?;

            granted_user_ids.push(member.user_id);
        }
    }

    crate::notifications::create_notifications(
        database,
        crate::notifications::CreateNotificationsRequest {
            kind: NotificationKind::ServerRoleGranted,
            server_id,
            channel_id: None,
            actor_user_id: None,
            target: crate::notifications::NotificationTarget::ServerRole(
                role_id,
            ),
            vote_type: None,
            recipient_ids: granted_user_ids,
        },
    )
    .await
}

fn shape_role(
    role: poll_action_roles::Model,
    members: Vec<poll_action_role_members::Model>,
    users_by_id: &HashMap<Uuid, users::Model>,
    profile_pictures: &BTreeMap<Uuid, users_service::UserImageRef>,
    permissions: Vec<poll_action_permissions::Model>,
) -> PollActionServerRoleResponse {
    PollActionServerRoleResponse {
        id: role.id.to_string(),
        name: role.name,
        color: role.color,
        prev_name: role.prev_name,
        prev_color: role.prev_color,
        server_role_id: role
            .server_role_id
            .map(|id| id.to_string())
            .unwrap_or_default(),
        members: members
            .into_iter()
            .filter_map(|member| {
                users_by_id.get(&member.user_id).map(|user| {
                    PollActionServerRoleMemberResponse {
                        change_type: member.change_type,
                        user: PollActionUserResponse {
                            id: user.id.to_string(),
                            name: user.name.clone(),
                            display_name: user.display_name.clone(),
                            profile_picture: profile_pictures
                                .get(&user.id)
                                .cloned(),
                        },
                    }
                })
            })
            .collect(),
        permissions: permissions
            .into_iter()
            .map(|permission| PollActionPermissionResponse {
                subject: permission.subject.to_string(),
                action: permission.action.to_string(),
                change_type: permission.change_type,
            })
            .collect(),
    }
}

fn parse_poll_action_permission_subject(
    value: &str,
) -> AppResult<PollActionPermissionSubject> {
    value.parse().map_err(|_| {
        ApiError::new(StatusCode::UNPROCESSABLE_ENTITY, "Subject is invalid.")
    })
}

fn parse_poll_action_permission_action(
    value: &str,
) -> AppResult<PollActionPermissionAbilityAction> {
    value.parse().map_err(|_| {
        ApiError::new(StatusCode::UNPROCESSABLE_ENTITY, "Action is invalid.")
    })
}

pub(super) async fn shape_poll_action_roles(
    database: &DatabaseConnection,
    poll_action_ids: &[Uuid],
) -> AppResult<HashMap<Uuid, PollActionServerRoleResponse>> {
    if poll_action_ids.is_empty() {
        return Ok(HashMap::new());
    }
    let roles = poll_action_roles::Entity::find()
        .filter(
            poll_action_roles::Column::PollActionId
                .is_in(poll_action_ids.iter().copied()),
        )
        .all(database)
        .await
        .map_err(internal_error)?;
    if roles.is_empty() {
        return Ok(HashMap::new());
    }

    let role_ids: Vec<Uuid> = roles.iter().map(|role| role.id).collect();
    let members = poll_action_role_members::Entity::find()
        .filter(
            poll_action_role_members::Column::PollActionRoleId
                .is_in(role_ids.clone()),
        )
        .all(database)
        .await
        .map_err(internal_error)?;
    let user_ids: Vec<Uuid> =
        members.iter().map(|member| member.user_id).collect();
    let users_by_id: HashMap<Uuid, users::Model> = if user_ids.is_empty() {
        HashMap::new()
    } else {
        users::Entity::find()
            .filter(users::Column::Id.is_in(user_ids.clone()))
            .all(database)
            .await
            .map_err(internal_error)?
            .into_iter()
            .map(|user| (user.id, user))
            .collect()
    };
    let profile_pictures =
        users_service::get_user_profile_pictures_map(database, &user_ids)
            .await?;
    let permissions = poll_action_permissions::Entity::find()
        .filter(
            poll_action_permissions::Column::PollActionRoleId.is_in(role_ids),
        )
        .all(database)
        .await
        .map_err(internal_error)?;

    let mut members_by_role =
        group_by(members, |member| member.poll_action_role_id);
    let mut permissions_by_role =
        group_by(permissions, |permission| permission.poll_action_role_id);

    Ok(roles
        .into_iter()
        .map(|role| {
            let poll_action_id = role.poll_action_id;
            let role_members =
                members_by_role.remove(&role.id).unwrap_or_default();
            let role_permissions =
                permissions_by_role.remove(&role.id).unwrap_or_default();
            (
                poll_action_id,
                shape_role(
                    role,
                    role_members,
                    &users_by_id,
                    &profile_pictures,
                    role_permissions,
                ),
            )
        })
        .collect())
}

fn group_by<T, F>(items: Vec<T>, key: F) -> HashMap<Uuid, Vec<T>>
where
    F: Fn(&T) -> Uuid,
{
    let mut grouped: HashMap<Uuid, Vec<T>> = HashMap::new();
    for item in items {
        grouped.entry(key(&item)).or_default().push(item);
    }
    grouped
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("poll action role request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
