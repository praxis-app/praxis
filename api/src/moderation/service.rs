use axum::http::StatusCode;
use chrono::{DateTime, FixedOffset};
use entity::{
    enums::{
        AuditLogOrigin, ModerationAction, ModerationTargetKind,
        NotificationKind,
    },
    forum_posts, moderation_actions, notifications, server_members, servers,
    users,
};
use sea_orm::{
    prelude::Uuid, ActiveModelTrait, ColumnTrait, Condition, ConnectionTrait,
    DatabaseConnection, EntityTrait, QueryFilter, QueryOrder, QuerySelect, Set,
};
use std::collections::{BTreeMap, BTreeSet, HashMap, HashSet};
use uuid::Uuid as NativeUuid;

use crate::{
    authz::{self, PermissionScope},
    common::{
        pagination::PaginationCursor, text::sanitize_text, ApiError, AppResult,
    },
    notifications::{
        self as notifications_service, CreateNotificationsRequest,
        NotificationTarget,
    },
};

use super::types::{
    AuditLogActorResponse, AuditLogEntryResponse, AuditLogFilterValues,
    AuditLogQuery, AuditLogResponse, AuditLogScopeResponse,
    AuditLogTargetResponse,
};

const MIN_REASON_LENGTH: usize = 4;
const MAX_REASON_LENGTH: usize = 500;
const DEFAULT_AUDIT_LOG_PAGE_SIZE: u64 = 50;
const MAX_AUDIT_LOG_PAGE_SIZE: u64 = 100;

pub(crate) struct ModerationRecord {
    pub(crate) actor_user_id: Option<Uuid>,
    pub(crate) origin: AuditLogOrigin,
    pub(crate) action: ModerationAction,
    pub(crate) target_kind: ModerationTargetKind,
    pub(crate) target_id: Uuid,
    pub(crate) server_id: Option<Uuid>,
    pub(crate) proposal_id: Option<Uuid>,
    pub(crate) channel_id: Option<Uuid>,
    pub(crate) target_label: Option<String>,
    pub(crate) server_label: Option<String>,
    pub(crate) before_value: Option<serde_json::Value>,
    pub(crate) after_value: Option<serde_json::Value>,
    pub(crate) reason: Option<String>,
}

impl ModerationRecord {
    pub(crate) fn direct(
        actor_user_id: Uuid,
        action: ModerationAction,
        target_kind: ModerationTargetKind,
        target_id: Uuid,
        server_id: Option<Uuid>,
        reason: Option<String>,
    ) -> Self {
        Self {
            actor_user_id: Some(actor_user_id),
            origin: AuditLogOrigin::Direct,
            action,
            target_kind,
            target_id,
            server_id,
            proposal_id: None,
            channel_id: None,
            target_label: None,
            server_label: None,
            before_value: None,
            after_value: None,
            reason,
        }
    }

    pub(crate) fn proposal(
        proposal_id: Uuid,
        action: ModerationAction,
        target_kind: ModerationTargetKind,
        target_id: Uuid,
        server_id: Uuid,
    ) -> Self {
        Self {
            actor_user_id: None,
            origin: AuditLogOrigin::Proposal,
            action,
            target_kind,
            target_id,
            server_id: Some(server_id),
            proposal_id: Some(proposal_id),
            channel_id: None,
            target_label: None,
            server_label: None,
            before_value: None,
            after_value: None,
            reason: None,
        }
    }

    pub(crate) fn with_channel(mut self, channel_id: Uuid) -> Self {
        self.channel_id = Some(channel_id);
        self
    }

    pub(crate) fn with_target_label(
        mut self,
        target_label: impl Into<String>,
    ) -> Self {
        self.target_label = Some(target_label.into());
        self
    }

    pub(crate) fn with_values(
        mut self,
        before_value: Option<serde_json::Value>,
        after_value: Option<serde_json::Value>,
    ) -> Self {
        self.before_value = before_value;
        self.after_value = after_value;
        self
    }
}

pub(crate) struct ModerationNotice {
    pub(crate) kind: NotificationKind,
    pub(crate) server_id: Uuid,
    pub(crate) channel_id: Option<Uuid>,
    pub(crate) moderation_action_id: Uuid,
    pub(crate) actor_user_id: Uuid,
    pub(crate) recipient_user_id: Uuid,
}

pub(crate) async fn can_moderate_content<C: ConnectionTrait>(
    database: &C,
    user_id: Uuid,
    server_id: Uuid,
) -> AppResult<()> {
    authz::can(
        database,
        user_id,
        "delete",
        "Message",
        PermissionScope::ServerOrInstance(server_id),
    )
    .await
}

pub(crate) async fn can_manage_calls<C: ConnectionTrait>(
    database: &C,
    user_id: Uuid,
    server_id: Uuid,
) -> AppResult<()> {
    authz::can(
        database,
        user_id,
        "manage",
        "Call",
        PermissionScope::ServerOrInstance(server_id),
    )
    .await
}

pub(crate) async fn record_action<C>(
    database: &C,
    record: ModerationRecord,
) -> AppResult<Uuid>
where
    C: ConnectionTrait,
{
    let target_label = match record.target_label {
        Some(label) => Some(label),
        None if record.target_kind == ModerationTargetKind::User => {
            users::Entity::find_by_id(record.target_id)
                .one(database)
                .await
                .map_err(internal_error)?
                .map(|user| user.display_name.unwrap_or(user.name))
        }
        None => None,
    };
    let server_label = match record.server_label {
        Some(label) => Some(label),
        None => match record.server_id {
            Some(server_id) => servers::Entity::find_by_id(server_id)
                .one(database)
                .await
                .map_err(internal_error)?
                .map(|server| server.name),
            None => None,
        },
    };
    let action = moderation_actions::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        actor_user_id: Set(record.actor_user_id),
        action: Set(record.action),
        origin: Set(record.origin),
        target_kind: Set(record.target_kind),
        target_id: Set(record.target_id),
        server_id: Set(record.server_id),
        proposal_id: Set(record.proposal_id),
        channel_id: Set(record.channel_id),
        target_label: Set(target_label),
        server_label: Set(server_label),
        before_value: Set(record.before_value),
        after_value: Set(record.after_value),
        reason: Set(record.reason),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)?;

    Ok(action.id)
}

pub(super) async fn get_audit_log(
    database: &DatabaseConnection,
    user_id: Uuid,
    server_scope: Option<Uuid>,
    query: AuditLogQuery,
) -> AppResult<AuditLogResponse> {
    authorize_audit_log(database, user_id, server_scope).await?;

    let limit = query
        .limit
        .unwrap_or(DEFAULT_AUDIT_LOG_PAGE_SIZE)
        .clamp(1, MAX_AUDIT_LOG_PAGE_SIZE);
    let cursor = query
        .cursor
        .as_deref()
        .map(PaginationCursor::parse)
        .transpose()?;
    let action = query.action.as_deref().map(parse_action).transpose()?;
    let actor_id = parse_optional_uuid(query.actor_id.as_deref(), "actorId")?;
    let target_kind = query
        .target_kind
        .as_deref()
        .map(parse_target_kind)
        .transpose()?;
    let target_id =
        parse_optional_uuid(query.target_id.as_deref(), "targetId")?;
    let requested_server_id =
        parse_optional_uuid(query.server_id.as_deref(), "serverId")?;
    let from = parse_optional_date(query.from.as_deref(), "from")?;
    let to = parse_optional_date(query.to.as_deref(), "to")?;

    let mut records_query = moderation_actions::Entity::find();
    if let Some(server_id) = server_scope {
        records_query = records_query
            .filter(moderation_actions::Column::ServerId.eq(server_id));
    }
    if let Some(server_id) = requested_server_id {
        records_query = records_query
            .filter(moderation_actions::Column::ServerId.eq(server_id));
    }
    if let Some(action) = action {
        records_query =
            records_query.filter(moderation_actions::Column::Action.eq(action));
    }
    if let Some(actor_id) = actor_id {
        records_query = records_query
            .filter(moderation_actions::Column::ActorUserId.eq(actor_id));
    }
    if let Some(target_kind) = target_kind {
        records_query = records_query
            .filter(moderation_actions::Column::TargetKind.eq(target_kind));
    }
    if let Some(target_id) = target_id {
        records_query = records_query
            .filter(moderation_actions::Column::TargetId.eq(target_id));
    }
    if let Some(from) = from {
        records_query = records_query
            .filter(moderation_actions::Column::CreatedAt.gte(from));
    }
    if let Some(to) = to {
        records_query =
            records_query.filter(moderation_actions::Column::CreatedAt.lte(to));
    }
    if let Some(cursor) = cursor {
        records_query = records_query.filter(
            Condition::any()
                .add(
                    moderation_actions::Column::CreatedAt.lt(cursor.created_at),
                )
                .add(
                    Condition::all()
                        .add(
                            moderation_actions::Column::CreatedAt
                                .eq(cursor.created_at),
                        )
                        .add(moderation_actions::Column::Id.lt(cursor.id)),
                ),
        );
    }

    let mut records = records_query
        .order_by_desc(moderation_actions::Column::CreatedAt)
        .order_by_desc(moderation_actions::Column::Id)
        .limit(limit + 1)
        .all(database)
        .await
        .map_err(internal_error)?;
    let has_more = records.len() > limit as usize;
    records.truncate(limit as usize);
    let next_cursor =
        has_more.then(|| records.last()).flatten().map(|record| {
            PaginationCursor {
                created_at: record.created_at,
                id: record.id,
            }
            .encode()
        });

    let filter_values = load_filter_values(database, server_scope).await?;
    let mut response = shape_audit_log_response(
        database,
        user_id,
        records,
        next_cursor,
        has_more,
    )
    .await?;
    response.filter_values = filter_values;
    Ok(response)
}

async fn authorize_audit_log(
    database: &DatabaseConnection,
    user_id: Uuid,
    server_scope: Option<Uuid>,
) -> AppResult<()> {
    match server_scope {
        Some(server_id) => {
            authz::can(
                database,
                user_id,
                "read",
                "AuditLog",
                PermissionScope::ServerOrInstance(server_id),
            )
            .await?;
            crate::servers::service::ensure_server(database, server_id).await
        }
        None => {
            authz::can(
                database,
                user_id,
                "read",
                "AuditLog",
                PermissionScope::Instance,
            )
            .await
        }
    }
}

async fn shape_audit_log_response(
    database: &DatabaseConnection,
    user_id: Uuid,
    records: Vec<moderation_actions::Model>,
    next_cursor: Option<String>,
    has_more: bool,
) -> AppResult<AuditLogResponse> {
    let actor_ids = records
        .iter()
        .filter_map(|record| record.actor_user_id)
        .collect::<HashSet<_>>();
    let server_ids = records
        .iter()
        .filter_map(|record| record.server_id)
        .collect::<HashSet<_>>();
    let proposal_ids = records
        .iter()
        .filter_map(|record| record.proposal_id)
        .collect::<HashSet<_>>();
    let forum_post_ids = records
        .iter()
        .filter(|record| record.target_kind == ModerationTargetKind::ForumPost)
        .map(|record| record.target_id)
        .collect::<HashSet<_>>();

    let actors = load_actors(database, &actor_ids).await?;
    let servers = load_servers(database, &server_ids).await?;
    let forum_posts =
        load_forum_posts(database, &proposal_ids, &forum_post_ids).await?;
    let member_server_ids = server_members::Entity::find()
        .filter(server_members::Column::UserId.eq(user_id))
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .map(|membership| membership.server_id)
        .collect::<HashSet<_>>();

    let mut filter_actors = BTreeMap::new();
    let mut filter_servers = BTreeMap::new();
    let mut actions = BTreeSet::new();
    let mut target_kinds = BTreeSet::new();
    let entries = records
        .into_iter()
        .map(|record| {
            let actor =
                record.actor_user_id.and_then(|id| actors.get(&id)).cloned();
            if let Some(actor) = actor.clone() {
                filter_actors.insert(actor.id.clone(), actor.clone());
            }

            let server = record.server_id.and_then(|id| servers.get(&id));
            let server_label = record
                .server_label
                .clone()
                .or_else(|| server.map(|server| server.name.clone()));
            let scope = AuditLogScopeResponse {
                server_id: record.server_id.map(|id| id.to_string()),
                server_label,
                channel_id: record.channel_id.map(|id| id.to_string()),
            };
            if let Some(server_id) = scope.server_id.clone() {
                filter_servers.insert(server_id, scope.clone());
            }

            actions.insert(record.action.to_string());
            target_kinds.insert(record.target_kind.to_string());
            let application_path = application_path(
                &record,
                server,
                &member_server_ids,
                &forum_posts,
            );
            AuditLogEntryResponse {
                id: record.id.to_string(),
                actor,
                origin: record.origin.to_string(),
                proposal_id: record.proposal_id.map(|id| id.to_string()),
                action: record.action.to_string(),
                target: AuditLogTargetResponse {
                    kind: record.target_kind.to_string(),
                    id: record.target_id.to_string(),
                    label: record.target_label,
                },
                scope,
                reason: record.reason,
                before_value: record.before_value,
                after_value: record.after_value,
                created_at: record.created_at.to_rfc3339(),
                application_path,
            }
        })
        .collect();

    Ok(AuditLogResponse {
        entries,
        next_cursor,
        has_more,
        filter_values: AuditLogFilterValues {
            actors: filter_actors.into_values().collect(),
            servers: filter_servers.into_values().collect(),
            actions: actions.into_iter().collect(),
            target_kinds: target_kinds.into_iter().collect(),
        },
    })
}

async fn load_filter_values(
    database: &DatabaseConnection,
    server_scope: Option<Uuid>,
) -> AppResult<AuditLogFilterValues> {
    let mut actor_query = moderation_actions::Entity::find()
        .select_only()
        .column(moderation_actions::Column::ActorUserId)
        .filter(moderation_actions::Column::ActorUserId.is_not_null());
    let mut server_query = moderation_actions::Entity::find()
        .select_only()
        .column(moderation_actions::Column::ServerId)
        .filter(moderation_actions::Column::ServerId.is_not_null());
    let mut action_query = moderation_actions::Entity::find()
        .select_only()
        .column(moderation_actions::Column::Action);
    let mut target_kind_query = moderation_actions::Entity::find()
        .select_only()
        .column(moderation_actions::Column::TargetKind);
    if let Some(server_id) = server_scope {
        actor_query = actor_query
            .filter(moderation_actions::Column::ServerId.eq(server_id));
        server_query = server_query
            .filter(moderation_actions::Column::ServerId.eq(server_id));
        action_query = action_query
            .filter(moderation_actions::Column::ServerId.eq(server_id));
        target_kind_query = target_kind_query
            .filter(moderation_actions::Column::ServerId.eq(server_id));
    }

    let actor_ids = actor_query
        .distinct()
        .into_tuple::<Option<Uuid>>()
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .flatten()
        .collect::<HashSet<_>>();
    let server_ids = server_query
        .distinct()
        .into_tuple::<Option<Uuid>>()
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .flatten()
        .collect::<HashSet<_>>();
    let mut actions = action_query
        .distinct()
        .into_tuple::<ModerationAction>()
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .map(|action| action.to_string())
        .collect::<Vec<_>>();
    let mut target_kinds = target_kind_query
        .distinct()
        .into_tuple::<ModerationTargetKind>()
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .map(|target_kind| target_kind.to_string())
        .collect::<Vec<_>>();
    actions.sort();
    target_kinds.sort();

    let mut actors = load_actors(database, &actor_ids)
        .await?
        .into_values()
        .collect::<Vec<_>>();
    actors.sort_by(|left, right| left.label.cmp(&right.label));
    let mut server_values = load_servers(database, &server_ids)
        .await?
        .into_values()
        .map(|server| AuditLogScopeResponse {
            server_id: Some(server.id.to_string()),
            server_label: Some(server.name),
            channel_id: None,
        })
        .collect::<Vec<_>>();
    server_values
        .sort_by(|left, right| left.server_label.cmp(&right.server_label));

    Ok(AuditLogFilterValues {
        actors,
        servers: server_values,
        actions,
        target_kinds,
    })
}

async fn load_actors(
    database: &DatabaseConnection,
    actor_ids: &HashSet<Uuid>,
) -> AppResult<HashMap<Uuid, AuditLogActorResponse>> {
    if actor_ids.is_empty() {
        return Ok(HashMap::new());
    }
    Ok(users::Entity::find()
        .filter(users::Column::Id.is_in(actor_ids.iter().copied()))
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .map(|user| {
            let label = user.display_name.unwrap_or(user.name);
            (
                user.id,
                AuditLogActorResponse {
                    id: user.id.to_string(),
                    label,
                },
            )
        })
        .collect())
}

async fn load_servers(
    database: &DatabaseConnection,
    server_ids: &HashSet<Uuid>,
) -> AppResult<HashMap<Uuid, servers::Model>> {
    if server_ids.is_empty() {
        return Ok(HashMap::new());
    }
    Ok(servers::Entity::find()
        .filter(servers::Column::Id.is_in(server_ids.iter().copied()))
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .map(|server| (server.id, server))
        .collect())
}

async fn load_forum_posts(
    database: &DatabaseConnection,
    proposal_ids: &HashSet<Uuid>,
    forum_post_ids: &HashSet<Uuid>,
) -> AppResult<Vec<forum_posts::Model>> {
    if proposal_ids.is_empty() && forum_post_ids.is_empty() {
        return Ok(Vec::new());
    }
    forum_posts::Entity::find()
        .filter(
            Condition::any()
                .add(
                    forum_posts::Column::PollId
                        .is_in(proposal_ids.iter().copied()),
                )
                .add(
                    forum_posts::Column::Id
                        .is_in(forum_post_ids.iter().copied()),
                ),
        )
        .all(database)
        .await
        .map_err(internal_error)
}

fn application_path(
    record: &moderation_actions::Model,
    server: Option<&servers::Model>,
    member_server_ids: &HashSet<Uuid>,
    forum_posts: &[forum_posts::Model],
) -> Option<String> {
    let server = server?;
    if !member_server_ids.contains(&server.id) {
        return None;
    }
    if let Some(proposal_id) = record.proposal_id {
        let post = forum_posts
            .iter()
            .find(|post| post.poll_id == Some(proposal_id))?;
        return Some(format!(
            "/s/{}/c/{}/posts/{}",
            server.slug, post.channel_id, post.id
        ));
    }
    match record.target_kind {
        ModerationTargetKind::ForumPost => forum_posts
            .iter()
            .find(|post| post.id == record.target_id)
            .map(|post| {
                format!(
                    "/s/{}/c/{}/posts/{}",
                    server.slug, post.channel_id, post.id
                )
            }),
        ModerationTargetKind::Message => record
            .channel_id
            .map(|channel_id| format!("/s/{}/c/{channel_id}", server.slug)),
        ModerationTargetKind::Server => Some(format!("/s/{}", server.slug)),
        _ => None,
    }
}

fn parse_action(value: &str) -> AppResult<ModerationAction> {
    value.parse().map_err(|_| {
        ApiError::new(StatusCode::BAD_REQUEST, "Action filter is invalid.")
    })
}

fn parse_target_kind(value: &str) -> AppResult<ModerationTargetKind> {
    value.parse().map_err(|_| {
        ApiError::new(StatusCode::BAD_REQUEST, "Target kind filter is invalid.")
    })
}

fn parse_optional_uuid(
    value: Option<&str>,
    field: &str,
) -> AppResult<Option<Uuid>> {
    value
        .map(|value| {
            Uuid::parse_str(value).map_err(|_| {
                ApiError::new(
                    StatusCode::BAD_REQUEST,
                    format!("{field} must be a UUID."),
                )
            })
        })
        .transpose()
}

fn parse_optional_date(
    value: Option<&str>,
    field: &str,
) -> AppResult<Option<DateTime<FixedOffset>>> {
    value
        .map(|value| {
            DateTime::parse_from_rfc3339(value).map_err(|_| {
                ApiError::new(
                    StatusCode::BAD_REQUEST,
                    format!("{field} must be an RFC 3339 timestamp."),
                )
            })
        })
        .transpose()
}

pub(crate) async fn notify_moderated_user<C>(
    database: &C,
    notice: ModerationNotice,
) -> AppResult<Vec<notifications::Model>>
where
    C: ConnectionTrait,
{
    if notice.recipient_user_id == notice.actor_user_id {
        return Ok(Vec::new());
    }

    notifications_service::create_notifications(
        database,
        CreateNotificationsRequest {
            kind: notice.kind,
            server_id: notice.server_id,
            channel_id: notice.channel_id,
            actor_user_id: None,
            target: NotificationTarget::ModerationAction(
                notice.moderation_action_id,
            ),
            vote_type: None,
            recipient_ids: vec![notice.recipient_user_id],
        },
    )
    .await
}

pub(crate) fn normalize_reason(
    reason: Option<&str>,
    required: bool,
) -> AppResult<Option<String>> {
    let reason = reason.map(sanitize_text).filter(|value| !value.is_empty());

    match &reason {
        None if required => Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "A reason is required.",
        )),
        Some(value)
            if !(MIN_REASON_LENGTH..=MAX_REASON_LENGTH)
                .contains(&value.chars().count()) =>
        {
            Err(ApiError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                format!(
                    "Reason must be between {MIN_REASON_LENGTH} and \
                     {MAX_REASON_LENGTH} characters."
                ),
            ))
        }
        _ => Ok(reason),
    }
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("moderation request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
