use axum::http::StatusCode;
use chrono::Utc;
use entity::{
    channel_members,
    enums::{
        InstanceAbilitySubject, InstanceRoleAbilityAction, ModerationAction,
        ModerationTargetKind,
    },
    instance_role_members, instance_role_permissions, server_members,
    user_images, users,
};
use sea_orm::{
    prelude::Uuid, ActiveModelTrait, ColumnTrait, Condition, ConnectionTrait,
    DatabaseConnection, EntityTrait, IntoActiveModel, QueryFilter, QueryOrder,
    QuerySelect, Set, TransactionTrait,
};
use std::path::Path;

use super::{
    service::{get_user_profile_pictures_map, internal_error},
    types::{InstanceUserResponse, InstanceUsersResponse},
};
use crate::{
    authz::{self, PermissionScope},
    calls::{self, LiveKitConfig},
    common::{
        pagination::PaginationCursor, storage::remove_stored_files, ApiError,
        AppResult,
    },
    forum, messages,
    moderation::{self, ModerationRecord},
    pub_sub::PubSubService,
    servers,
};

const DELETED_USER_DISPLAY_NAME: &str = "Deleted user";
const MAX_USERS_PAGE_SIZE: u64 = 100;

pub(super) struct AccountModeration {
    pub(super) actor_user_id: Uuid,
    pub(super) target_user_id: Uuid,
    pub(super) reason: Option<String>,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum AccountAction {
    Suspend,
    Delete,
}

impl AccountAction {
    fn permission(self) -> &'static str {
        match self {
            Self::Suspend => "update",
            Self::Delete => "delete",
        }
    }
}

pub(super) async fn can_moderate_accounts(
    database: &DatabaseConnection,
    user_id: Uuid,
) -> AppResult<()> {
    let can_suspend = can_perform(database, user_id, AccountAction::Suspend);
    let can_delete = can_perform(database, user_id, AccountAction::Delete);
    if granted(can_suspend.await)? || granted(can_delete.await)? {
        Ok(())
    } else {
        Err(ApiError::new(StatusCode::FORBIDDEN, "Forbidden."))
    }
}

pub(super) async fn list_instance_users(
    database: &DatabaseConnection,
    actor_user_id: Uuid,
    before: Option<&str>,
    limit: Option<u64>,
) -> AppResult<InstanceUsersResponse> {
    can_moderate_accounts(database, actor_user_id).await?;
    let limit = limit.unwrap_or(50).clamp(1, MAX_USERS_PAGE_SIZE);
    let cursor = before.map(PaginationCursor::parse).transpose()?;

    let mut query = users::Entity::find();
    if let Some(cursor) = cursor {
        query = query.filter(
            Condition::any()
                .add(users::Column::CreatedAt.lt(cursor.created_at))
                .add(
                    Condition::all()
                        .add(users::Column::CreatedAt.eq(cursor.created_at))
                        .add(users::Column::Id.lt(cursor.id)),
                ),
        );
    }
    let mut records = query
        .order_by_desc(users::Column::CreatedAt)
        .order_by_desc(users::Column::Id)
        .limit(limit + 1)
        .all(database)
        .await
        .map_err(internal_error)?;
    let has_more = records.len() > limit as usize;
    records.truncate(limit as usize);

    let next_cursor = has_more.then(|| records.last()).flatten().map(|user| {
        PaginationCursor {
            created_at: user.created_at,
            id: user.id,
        }
        .encode()
    });
    let user_ids = records.iter().map(|user| user.id).collect::<Vec<_>>();
    let profile_pictures =
        get_user_profile_pictures_map(database, &user_ids).await?;

    Ok(InstanceUsersResponse {
        users: records
            .into_iter()
            .map(|user| InstanceUserResponse {
                id: user.id.to_string(),
                profile_picture: profile_pictures.get(&user.id).cloned(),
                name: user.name,
                display_name: user.display_name,
                anonymous: user.anonymous,
                locked: user.locked,
                deleted_at: user.deleted_at.map(|value| value.to_rfc3339()),
                created_at: user.created_at.to_rfc3339(),
            })
            .collect(),
        next_cursor,
        has_more,
    })
}

pub(super) async fn suspend_user(
    database: &DatabaseConnection,
    request: AccountModeration,
) -> AppResult<()> {
    let reason = moderation::normalize_reason(request.reason.as_deref(), true)?;
    ensure_account_can_be_moderated(database, &request, AccountAction::Suspend)
        .await?;

    let transaction = database.begin().await.map_err(internal_error)?;
    let user = lock_user(&transaction, request.target_user_id).await?;
    ensure_not_last_active_admin(&transaction, user.id).await?;
    if !user.locked {
        let mut active = user.into_active_model();
        active.locked = Set(true);
        active.updated_at = Set(Utc::now().fixed_offset());
        active.update(&transaction).await.map_err(internal_error)?;
        moderation::record_action(
            &transaction,
            account_record(&request, ModerationAction::SuspendUser, reason),
        )
        .await?;
    }
    transaction.commit().await.map_err(internal_error)?;

    Ok(())
}

pub(super) async fn restore_user(
    database: &DatabaseConnection,
    request: AccountModeration,
) -> AppResult<()> {
    let reason =
        moderation::normalize_reason(request.reason.as_deref(), false)?;
    ensure_account_can_be_moderated(database, &request, AccountAction::Suspend)
        .await?;

    let transaction = database.begin().await.map_err(internal_error)?;
    let user = lock_user(&transaction, request.target_user_id).await?;
    if user.deleted_at.is_some() {
        return Err(ApiError::new(
            StatusCode::CONFLICT,
            "Deleted accounts cannot be restored.",
        ));
    }
    if user.locked {
        let mut active = user.into_active_model();
        active.locked = Set(false);
        active.updated_at = Set(Utc::now().fixed_offset());
        active.update(&transaction).await.map_err(internal_error)?;
        moderation::record_action(
            &transaction,
            account_record(&request, ModerationAction::RestoreUser, reason),
        )
        .await?;
    }
    transaction.commit().await.map_err(internal_error)?;

    Ok(())
}

pub(super) async fn delete_user(
    database: &DatabaseConnection,
    upload_root: &Path,
    request: AccountModeration,
) -> AppResult<()> {
    let reason = moderation::normalize_reason(request.reason.as_deref(), true)?;
    ensure_account_can_be_moderated(database, &request, AccountAction::Delete)
        .await?;

    let transaction = database.begin().await.map_err(internal_error)?;
    let user = lock_user(&transaction, request.target_user_id).await?;
    if user.deleted_at.is_some() {
        transaction.commit().await.map_err(internal_error)?;
        return Ok(());
    }
    ensure_not_last_active_admin(&transaction, user.id).await?;

    let mut storage_keys =
        messages::erase_user_messages(&transaction, user.id).await?;
    forum::moderation::erase_user_forum_posts(&transaction, user.id).await?;
    storage_keys.extend(delete_user_images(&transaction, user.id).await?);
    remove_memberships(&transaction, user.id).await?;

    let now = Utc::now().fixed_offset();
    let suffix = user.id.simple().to_string()[..8].to_owned();
    let mut active = user.into_active_model();
    active.name = Set(format!("deleted_{suffix}"));
    active.display_name = Set(Some(DELETED_USER_DISPLAY_NAME.to_owned()));
    active.email = Set(None);
    active.password = Set(None);
    active.bio = Set(None);
    active.locked = Set(true);
    active.deleted_at = Set(Some(now));
    active.updated_at = Set(now);
    active.update(&transaction).await.map_err(internal_error)?;
    moderation::record_action(
        &transaction,
        account_record(&request, ModerationAction::DeleteUser, reason),
    )
    .await?;
    transaction.commit().await.map_err(internal_error)?;

    remove_stored_files(upload_root, &storage_keys).await;
    Ok(())
}

pub(super) async fn evict_account(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    livekit: Option<&LiveKitConfig>,
    user_id: Uuid,
) {
    pub_sub_service.evict_user(user_id).await;
    if let Err(error) = calls::service::disconnect_user_from_calls(
        database, livekit, None, user_id,
    )
    .await
    {
        tracing::warn!("failed to disconnect moderated account: {error}");
    }
}

async fn ensure_account_can_be_moderated(
    database: &DatabaseConnection,
    request: &AccountModeration,
    action: AccountAction,
) -> AppResult<()> {
    can_perform(database, request.actor_user_id, action).await?;
    users::Entity::find_by_id(request.target_user_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "User not found.")
        })?;

    if request.actor_user_id == request.target_user_id {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "You cannot moderate your own account.",
        ));
    }

    let target_is_moderator =
        granted(can_moderate_accounts(database, request.target_user_id).await)?;
    let target_is_admin =
        granted(is_instance_admin(database, request.target_user_id).await)?;
    if !target_is_moderator && !target_is_admin {
        return Ok(());
    }

    if granted(is_instance_admin(database, request.actor_user_id).await)? {
        Ok(())
    } else {
        Err(ApiError::new(
            StatusCode::FORBIDDEN,
            "This account cannot be moderated.",
        ))
    }
}

async fn can_perform(
    database: &DatabaseConnection,
    user_id: Uuid,
    action: AccountAction,
) -> AppResult<()> {
    authz::can(
        database,
        user_id,
        action.permission(),
        "User",
        PermissionScope::Instance,
    )
    .await
}

async fn is_instance_admin(
    database: &DatabaseConnection,
    user_id: Uuid,
) -> AppResult<()> {
    authz::can(
        database,
        user_id,
        "manage",
        "all",
        PermissionScope::Instance,
    )
    .await
}

async fn ensure_not_last_active_admin<C>(
    database: &C,
    user_id: Uuid,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    let admin_role_ids = instance_role_permissions::Entity::find()
        .select_only()
        .column(instance_role_permissions::Column::InstanceRoleId)
        .filter(
            instance_role_permissions::Column::Subject
                .eq(InstanceAbilitySubject::All),
        )
        .filter(
            instance_role_permissions::Column::Action
                .eq(InstanceRoleAbilityAction::Manage),
        )
        .into_tuple::<Uuid>()
        .all(database)
        .await
        .map_err(internal_error)?;
    let admin_ids = instance_role_members::Entity::find()
        .select_only()
        .column(instance_role_members::Column::UserId)
        .filter(
            instance_role_members::Column::InstanceRoleId.is_in(admin_role_ids),
        )
        .distinct()
        .into_tuple::<Uuid>()
        .all(database)
        .await
        .map_err(internal_error)?;
    if !admin_ids.contains(&user_id) {
        return Ok(());
    }

    let other_active_admins = users::Entity::find()
        .filter(users::Column::Id.is_in(admin_ids))
        .filter(users::Column::Id.ne(user_id))
        .filter(users::Column::Locked.eq(false))
        .one(database)
        .await
        .map_err(internal_error)?;
    if other_active_admins.is_some() {
        Ok(())
    } else {
        Err(ApiError::new(
            StatusCode::CONFLICT,
            "The last active instance administrator cannot be removed.",
        ))
    }
}

async fn lock_user<C>(database: &C, user_id: Uuid) -> AppResult<users::Model>
where
    C: ConnectionTrait,
{
    users::Entity::find_by_id(user_id)
        .lock_exclusive()
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| ApiError::new(StatusCode::NOT_FOUND, "User not found."))
}

async fn delete_user_images<C>(
    database: &C,
    user_id: Uuid,
) -> AppResult<Vec<String>>
where
    C: ConnectionTrait,
{
    let images = user_images::Entity::find()
        .filter(user_images::Column::UserId.eq(user_id))
        .all(database)
        .await
        .map_err(internal_error)?;
    user_images::Entity::delete_many()
        .filter(user_images::Column::UserId.eq(user_id))
        .exec(database)
        .await
        .map_err(internal_error)?;

    Ok(images
        .into_iter()
        .filter_map(|image| image.storage_key)
        .collect())
}

async fn remove_memberships<C>(database: &C, user_id: Uuid) -> AppResult<()>
where
    C: ConnectionTrait,
{
    let server_ids = server_members::Entity::find()
        .select_only()
        .column(server_members::Column::ServerId)
        .filter(server_members::Column::UserId.eq(user_id))
        .into_tuple::<Uuid>()
        .all(database)
        .await
        .map_err(internal_error)?;
    for server_id in server_ids {
        servers::service::remove_server_members_in_transaction(
            database,
            server_id,
            &[user_id],
        )
        .await?;
    }

    channel_members::Entity::delete_many()
        .filter(channel_members::Column::UserId.eq(user_id))
        .exec(database)
        .await
        .map_err(internal_error)?;
    instance_role_members::Entity::delete_many()
        .filter(instance_role_members::Column::UserId.eq(user_id))
        .exec(database)
        .await
        .map_err(internal_error)?;

    Ok(())
}

fn granted(result: AppResult<()>) -> AppResult<bool> {
    match result {
        Ok(()) => Ok(true),
        Err(error) if error.status() == StatusCode::FORBIDDEN => Ok(false),
        Err(error) => Err(error),
    }
}

fn account_record(
    request: &AccountModeration,
    action: ModerationAction,
    reason: Option<String>,
) -> ModerationRecord {
    ModerationRecord {
        actor_user_id: request.actor_user_id,
        action,
        target_kind: ModerationTargetKind::User,
        target_id: request.target_user_id,
        server_id: None,
        reason,
    }
}
