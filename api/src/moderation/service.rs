use axum::http::StatusCode;
use entity::{
    enums::{ModerationAction, ModerationTargetKind},
    moderation_actions,
};
use sea_orm::{prelude::Uuid, ActiveModelTrait, ConnectionTrait, Set};
use uuid::Uuid as NativeUuid;

use crate::common::{text::sanitize_text, ApiError, AppResult};

const MIN_REASON_LENGTH: usize = 4;
const MAX_REASON_LENGTH: usize = 500;

pub(crate) struct ModerationRecord {
    pub(crate) actor_user_id: Uuid,
    pub(crate) action: ModerationAction,
    pub(crate) target_kind: ModerationTargetKind,
    pub(crate) target_id: Uuid,
    pub(crate) server_id: Option<Uuid>,
    pub(crate) reason: Option<String>,
}

pub(crate) async fn record_action<C>(
    database: &C,
    record: ModerationRecord,
) -> AppResult<()>
where
    C: ConnectionTrait,
{
    moderation_actions::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        actor_user_id: Set(record.actor_user_id),
        action: Set(record.action),
        target_kind: Set(record.target_kind),
        target_id: Set(record.target_id),
        server_id: Set(record.server_id),
        reason: Set(record.reason),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)?;

    Ok(())
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn blank_reasons_are_dropped_unless_required() {
        assert_eq!(normalize_reason(Some("   "), false).unwrap(), None);
        assert_eq!(normalize_reason(None, false).unwrap(), None);
        assert!(normalize_reason(Some(" "), true).is_err());
        assert_eq!(
            normalize_reason(Some("  spamming  "), true)
                .unwrap()
                .as_deref(),
            Some("spamming")
        );
    }

    #[test]
    fn reasons_outside_the_length_bounds_are_rejected() {
        let short = "a".repeat(MIN_REASON_LENGTH - 1);
        let long = "a".repeat(MAX_REASON_LENGTH + 1);
        assert!(normalize_reason(Some(&short), false).is_err());
        assert!(normalize_reason(Some(&long), true).is_err());
        assert!(normalize_reason(Some(&"a".repeat(MIN_REASON_LENGTH)), true)
            .is_ok());
    }
}
