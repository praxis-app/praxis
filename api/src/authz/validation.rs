use axum::http::StatusCode;

use super::types::PermissionRule;
use crate::common::{ApiError, AppResult};

const ABILITY_ACTIONS: &[&str] =
    &["delete", "create", "read", "update", "manage"];

pub(crate) type CapabilityActions =
    &'static [(&'static str, &'static [&'static str])];

pub(crate) const SERVER_CAPABILITY_ACTIONS: CapabilityActions = &[
    ("ServerMember", &["manage"]),
    ("Call", &["manage"]),
    ("AuditLog", &["read"]),
];

pub(crate) const INSTANCE_CAPABILITY_ACTIONS: CapabilityActions = &[
    ("Message", &["delete"]),
    ("Call", &["manage"]),
    ("User", &["update", "delete"]),
    ("AuditLog", &["read"]),
];

pub(crate) fn validate_permissions(
    permissions: &[PermissionRule],
    subjects: &[&str],
    capability_actions: CapabilityActions,
) -> AppResult<()> {
    for permission in permissions {
        if !subjects.contains(&permission.subject.as_str()) {
            return Err(ApiError::new(
                StatusCode::BAD_REQUEST,
                "Permission subject is invalid.",
            ));
        }

        if permission.action.is_empty()
            || permission.action.iter().any(|action| {
                !is_valid_action(
                    &permission.subject,
                    action,
                    capability_actions,
                )
            })
        {
            return Err(ApiError::new(
                StatusCode::BAD_REQUEST,
                "Permission action is invalid.",
            ));
        }
    }

    Ok(())
}

pub(crate) fn is_valid_action(
    subject: &str,
    action: &str,
    capability_actions: CapabilityActions,
) -> bool {
    let allowed_actions = capability_actions
        .iter()
        .find(|(capability_subject, _)| *capability_subject == subject)
        .map_or(ABILITY_ACTIONS, |(_, actions)| actions);
    allowed_actions.contains(&action)
}
