use axum::http::StatusCode;

use super::types::PermissionRule;
use crate::common::{ApiError, AppResult};

const ABILITY_ACTIONS: &[&str] =
    &["delete", "create", "read", "update", "manage"];

pub(crate) fn validate_permissions(
    permissions: &[PermissionRule],
    subjects: &[&str],
) -> AppResult<()> {
    for permission in permissions {
        if !subjects.contains(&permission.subject.as_str()) {
            return Err(ApiError::new(
                StatusCode::BAD_REQUEST,
                "Permission subject is invalid.",
            ));
        }

        if permission.action.is_empty()
            || permission
                .action
                .iter()
                .any(|action| !ABILITY_ACTIONS.contains(&action.as_str()))
        {
            return Err(ApiError::new(
                StatusCode::BAD_REQUEST,
                "Permission action is invalid.",
            ));
        }
    }

    Ok(())
}
