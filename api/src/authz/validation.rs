use axum::http::StatusCode;

use super::types::PermissionRule;
use crate::common::{ApiError, AppResult};

const ABILITY_ACTIONS: &[&str] =
    &["delete", "create", "read", "update", "manage"];

pub(crate) type CapabilityActions =
    &'static [(&'static str, &'static [&'static str])];

pub(crate) const SERVER_CAPABILITY_ACTIONS: CapabilityActions =
    &[("ServerMember", &["manage"]), ("Call", &["manage"])];

pub(crate) const INSTANCE_CAPABILITY_ACTIONS: CapabilityActions = &[
    ("Message", &["delete"]),
    ("Call", &["manage"]),
    ("User", &["update", "delete"]),
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

#[cfg(test)]
mod tests {
    use super::*;

    fn rule(subject: &str, actions: &[&str]) -> PermissionRule {
        PermissionRule {
            subject: subject.to_owned(),
            action: actions.iter().map(|action| (*action).to_owned()).collect(),
        }
    }

    #[test]
    fn capability_subjects_only_accept_their_actions() {
        let subjects = &["ServerMember", "Call", "Message"];

        assert!(validate_permissions(
            &[rule("ServerMember", &["manage"]), rule("Call", &["manage"])],
            subjects,
            SERVER_CAPABILITY_ACTIONS,
        )
        .is_ok());
        assert!(validate_permissions(
            &[rule("ServerMember", &["delete"])],
            subjects,
            SERVER_CAPABILITY_ACTIONS,
        )
        .is_err());
        assert!(validate_permissions(
            &[rule("Message", &["create", "delete"])],
            subjects,
            SERVER_CAPABILITY_ACTIONS,
        )
        .is_ok());
    }

    #[test]
    fn instance_capabilities_restrict_message_and_user_actions() {
        let subjects = &["Message", "User"];

        assert!(validate_permissions(
            &[
                rule("Message", &["delete"]),
                rule("User", &["update", "delete"])
            ],
            subjects,
            INSTANCE_CAPABILITY_ACTIONS,
        )
        .is_ok());
        assert!(validate_permissions(
            &[rule("Message", &["manage"])],
            subjects,
            INSTANCE_CAPABILITY_ACTIONS,
        )
        .is_err());
        assert!(validate_permissions(
            &[rule("User", &["create"])],
            subjects,
            INSTANCE_CAPABILITY_ACTIONS,
        )
        .is_err());
    }
}
