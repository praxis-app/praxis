use axum::http::StatusCode;
use entity::users;
use sea_orm::{
    prelude::Uuid, ColumnTrait, ConnectionTrait, EntityTrait, QueryFilter,
};
use serde_json::{json, Value};
use std::collections::BTreeMap;

use crate::{
    authz::PermissionRule,
    common::{ApiError, AppResult},
};

pub(crate) fn normalized_permissions(
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

pub(crate) fn role_snapshot(name: &str, color: &str) -> Value {
    json!({ "name": name, "color": color })
}

pub(crate) fn permissions_snapshot(permissions: Vec<PermissionRule>) -> Value {
    json!({ "permissions": normalized_permissions(&permissions) })
}

pub(crate) async fn member_labels<C: ConnectionTrait>(
    database: &C,
    user_ids: &[Uuid],
) -> AppResult<Value> {
    if user_ids.is_empty() {
        return Ok(json!([]));
    }
    let mut members = users::Entity::find()
        .filter(users::Column::Id.is_in(user_ids.iter().copied()))
        .all(database)
        .await
        .map_err(|error| {
            tracing::error!("audit member lookup failed: {error}");
            ApiError::new(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Internal server error.",
            )
        })?
        .into_iter()
        .map(|user| (user.display_name.unwrap_or(user.name), user.id))
        .collect::<Vec<_>>();
    members.sort();
    Ok(members
        .into_iter()
        .map(|(name, id)| json!({ "id": id, "name": name }))
        .collect())
}

pub(crate) fn member_snapshot(members: Value) -> Value {
    json!({ "members": members })
}

pub(crate) fn deleted_role_snapshot(
    name: &str,
    color: &str,
    permissions: &[PermissionRule],
    members: Value,
) -> Value {
    json!({
        "name": name,
        "color": color,
        "permissions": normalized_permissions(permissions),
        "members": members,
    })
}
