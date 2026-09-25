use axum::http::StatusCode;
use entity::{
    enums::{ModerationAction, ModerationTargetKind},
    moderation_actions, server_bans, servers, users,
};
use sea_orm::{
    prelude::Uuid, sea_query::OnConflict, ColumnTrait, ConnectionTrait,
    DatabaseConnection, EntityTrait, QueryFilter, QueryOrder, Set,
    TransactionTrait,
};
use std::collections::HashMap;
use uuid::Uuid as NativeUuid;

use super::{
    service::{
        get_server, internal_error, is_banned_from_server, is_server_member,
        remove_server_members_in_transaction, shape_user,
    },
    types::{
        serialize_timestamp, ServerAccessResponse, ServerAccessStatus,
        ServerBanResponse,
    },
};
use crate::{
    authz::{self, PermissionScope},
    calls::{self, LiveKitConfig},
    common::{ApiError, AppResult},
    moderation::{self, ModerationRecord},
    pub_sub::PubSubService,
    users as users_service,
};

pub(super) struct MemberModeration {
    pub(super) server_id: Uuid,
    pub(super) actor_user_id: Uuid,
    pub(super) target_user_id: Uuid,
    pub(super) reason: Option<String>,
}

pub(super) async fn evict_server_member(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    livekit: Option<&LiveKitConfig>,
    server_id: Uuid,
    user_id: Uuid,
) {
    pub_sub_service
        .revoke_server_subscriptions(server_id, user_id)
        .await;
    if let Err(error) = calls::service::disconnect_user_from_calls(
        database,
        livekit,
        Some(server_id),
        user_id,
    )
    .await
    {
        tracing::warn!(
            "failed to disconnect removed member from calls: {error}"
        );
    }
}

pub(super) async fn can_manage_server_members(
    database: &DatabaseConnection,
    user_id: Uuid,
    server_id: Uuid,
) -> AppResult<()> {
    authz::can(
        database,
        user_id,
        "manage",
        "ServerMember",
        PermissionScope::Server(server_id),
    )
    .await
}

pub(super) async fn remove_member(
    database: &DatabaseConnection,
    request: MemberModeration,
) -> AppResult<()> {
    let reason = moderation::normalize_reason(request.reason.as_deref(), true)?;
    ensure_member_can_be_moderated(database, &request).await?;

    let transaction = database.begin().await.map_err(internal_error)?;
    let removed = remove_server_members_in_transaction(
        &transaction,
        request.server_id,
        &[request.target_user_id],
    )
    .await?;
    if removed > 0 {
        moderation::record_action(
            &transaction,
            member_record(&request, ModerationAction::RemoveMember, reason),
        )
        .await?;
    }
    transaction.commit().await.map_err(internal_error)?;

    Ok(())
}

pub(super) async fn ban_member(
    database: &DatabaseConnection,
    request: MemberModeration,
) -> AppResult<()> {
    let reason = moderation::normalize_reason(request.reason.as_deref(), true)?;
    ensure_member_can_be_moderated(database, &request).await?;

    let transaction = database.begin().await.map_err(internal_error)?;
    remove_server_members_in_transaction(
        &transaction,
        request.server_id,
        &[request.target_user_id],
    )
    .await?;
    let banned = server_bans::Entity::insert(server_bans::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        server_id: Set(request.server_id),
        user_id: Set(request.target_user_id),
        banned_by: Set(request.actor_user_id),
        ..Default::default()
    })
    .on_conflict(
        OnConflict::columns([
            server_bans::Column::ServerId,
            server_bans::Column::UserId,
        ])
        .do_nothing()
        .to_owned(),
    )
    .exec_without_returning(&transaction)
    .await
    .map_err(internal_error)?;
    if banned > 0 {
        moderation::record_action(
            &transaction,
            member_record(&request, ModerationAction::BanMember, reason),
        )
        .await?;
    }
    transaction.commit().await.map_err(internal_error)?;

    Ok(())
}

pub(super) async fn unban_member(
    database: &DatabaseConnection,
    request: MemberModeration,
) -> AppResult<()> {
    let reason =
        moderation::normalize_reason(request.reason.as_deref(), false)?;
    get_server(database, request.server_id).await?;
    get_target_user(database, request.target_user_id).await?;

    let transaction = database.begin().await.map_err(internal_error)?;
    let unbanned = server_bans::Entity::delete_many()
        .filter(server_bans::Column::ServerId.eq(request.server_id))
        .filter(server_bans::Column::UserId.eq(request.target_user_id))
        .exec(&transaction)
        .await
        .map_err(internal_error)?
        .rows_affected;
    if unbanned > 0 {
        moderation::record_action(
            &transaction,
            member_record(&request, ModerationAction::UnbanMember, reason),
        )
        .await?;
    }
    transaction.commit().await.map_err(internal_error)?;

    Ok(())
}

pub(super) async fn get_server_bans(
    database: &DatabaseConnection,
    server_id: Uuid,
) -> AppResult<Vec<ServerBanResponse>> {
    get_server(database, server_id).await?;
    let bans = server_bans::Entity::find()
        .filter(server_bans::Column::ServerId.eq(server_id))
        .order_by_desc(server_bans::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;
    if bans.is_empty() {
        return Ok(vec![]);
    }

    let user_ids: Vec<Uuid> = bans.iter().map(|ban| ban.user_id).collect();
    let mut users: HashMap<Uuid, users::Model> = users::Entity::find()
        .filter(users::Column::Id.is_in(user_ids.clone()))
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .map(|user| (user.id, user))
        .collect();
    let profile_pictures =
        users_service::get_user_profile_pictures_map(database, &user_ids)
            .await?;

    Ok(bans
        .into_iter()
        .filter_map(|ban| {
            let user = users.remove(&ban.user_id)?;
            Some(ServerBanResponse {
                user: shape_user(
                    user,
                    profile_pictures.get(&ban.user_id).cloned(),
                ),
                created_at: serialize_timestamp(ban.created_at),
            })
        })
        .collect())
}

pub(super) async fn get_server_access(
    database: &DatabaseConnection,
    slug: &str,
    user_id: Uuid,
) -> AppResult<ServerAccessResponse> {
    let server = servers::Entity::find()
        .filter(servers::Column::Slug.eq(slug))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Server not found.")
        })?;

    if is_server_member(database, server.id, user_id).await? {
        return Ok(ServerAccessResponse {
            status: ServerAccessStatus::Member,
            server_name: None,
            reason: None,
            moderated_at: None,
        });
    }

    let latest_action = moderation_actions::Entity::find()
        .filter(moderation_actions::Column::ServerId.eq(server.id))
        .filter(
            moderation_actions::Column::TargetKind
                .eq(ModerationTargetKind::User),
        )
        .filter(moderation_actions::Column::TargetId.eq(user_id))
        .filter(moderation_actions::Column::Action.is_in([
            ModerationAction::RemoveMember,
            ModerationAction::BanMember,
            ModerationAction::UnbanMember,
        ]))
        .order_by_desc(moderation_actions::Column::CreatedAt)
        .one(database)
        .await
        .map_err(internal_error)?;

    let status = if is_banned_from_server(database, server.id, user_id).await? {
        ServerAccessStatus::Banned
    } else if latest_action
        .as_ref()
        .is_some_and(|action| action.action == ModerationAction::RemoveMember)
    {
        ServerAccessStatus::Removed
    } else {
        ServerAccessStatus::None
    };

    let moderation = match status {
        ServerAccessStatus::Banned | ServerAccessStatus::Removed => {
            latest_action
        }
        _ => None,
    };
    Ok(ServerAccessResponse {
        server_name: moderation.as_ref().map(|_| server.name),
        reason: moderation.as_ref().and_then(|action| action.reason.clone()),
        moderated_at: moderation
            .map(|action| serialize_timestamp(action.created_at)),
        status,
    })
}

async fn ensure_member_can_be_moderated(
    database: &DatabaseConnection,
    request: &MemberModeration,
) -> AppResult<()> {
    get_server(database, request.server_id).await?;
    get_target_user(database, request.target_user_id).await?;

    if request.actor_user_id == request.target_user_id {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "You cannot moderate yourself.",
        ));
    }

    let target_is_moderator = granted(
        can_manage_server_members(
            database,
            request.target_user_id,
            request.server_id,
        )
        .await,
    )?;
    if !target_is_moderator {
        return Ok(());
    }

    let actor_is_instance_admin = granted(
        authz::can(
            database,
            request.actor_user_id,
            "manage",
            "all",
            PermissionScope::Instance,
        )
        .await,
    )?;
    if actor_is_instance_admin {
        Ok(())
    } else {
        Err(ApiError::new(
            StatusCode::FORBIDDEN,
            "This member cannot be moderated.",
        ))
    }
}

fn granted(result: AppResult<()>) -> AppResult<bool> {
    match result {
        Ok(()) => Ok(true),
        Err(error) if error.status() == StatusCode::FORBIDDEN => Ok(false),
        Err(error) => Err(error),
    }
}

async fn get_target_user<C>(database: &C, user_id: Uuid) -> AppResult<()>
where
    C: ConnectionTrait,
{
    users::Entity::find_by_id(user_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .map(|_| ())
        .ok_or_else(|| ApiError::new(StatusCode::NOT_FOUND, "User not found."))
}

fn member_record(
    request: &MemberModeration,
    action: ModerationAction,
    reason: Option<String>,
) -> ModerationRecord {
    ModerationRecord {
        actor_user_id: request.actor_user_id,
        action,
        target_kind: ModerationTargetKind::User,
        target_id: request.target_user_id,
        server_id: Some(request.server_id),
        reason,
    }
}
