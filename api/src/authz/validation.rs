use std::str::FromStr;

use axum::http::StatusCode;

use super::types::PermissionRule;
use crate::common::{ApiError, AppResult};

pub(crate) type CapabilityActions =
    &'static [(&'static str, &'static [&'static str])];

pub(crate) const SERVER_CAPABILITY_ACTIONS: CapabilityActions = &[
    ("Proposal", &["manage"]),
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

pub(crate) fn validate_permissions<Subject: FromStr, Action: FromStr>(
    permissions: &[PermissionRule],
    capability_actions: CapabilityActions,
) -> AppResult<()> {
    for permission in permissions {
        if permission.subject.parse::<Subject>().is_err() {
            return Err(ApiError::new(
                StatusCode::BAD_REQUEST,
                "Permission subject is invalid.",
            ));
        }

        if permission.action.is_empty()
            || permission.action.iter().any(|action| {
                !is_valid_action::<Action>(
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

pub(crate) fn is_valid_action<Action: FromStr>(
    subject: &str,
    action: &str,
    capability_actions: CapabilityActions,
) -> bool {
    capability_actions
        .iter()
        .find(|(capability_subject, _)| *capability_subject == subject)
        .map_or_else(
            || action.parse::<Action>().is_ok(),
            |(_, actions)| actions.contains(&action),
        )
}
