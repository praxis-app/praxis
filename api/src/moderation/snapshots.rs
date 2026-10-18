use sea_orm::prelude::Uuid;
use serde_json::{json, Value};
use std::collections::BTreeMap;

use crate::authz::PermissionRule;

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

pub(crate) fn member_snapshot(ids: Vec<Uuid>) -> Value {
    json!({ "memberIds": sorted_ids(ids) })
}

pub(crate) fn deleted_role_snapshot(
    name: &str,
    color: &str,
    permissions: &[PermissionRule],
    member_ids: Vec<Uuid>,
) -> Value {
    json!({
        "name": name,
        "color": color,
        "permissions": normalized_permissions(permissions),
        "memberIds": sorted_ids(member_ids),
    })
}

fn sorted_ids(mut ids: Vec<Uuid>) -> Vec<String> {
    ids.sort();
    ids.into_iter().map(|id| id.to_string()).collect()
}
