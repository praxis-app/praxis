use axum::http::StatusCode;
use chrono::{DateTime, FixedOffset};
use sea_orm::prelude::Uuid;

use super::ApiError;

#[derive(Clone, Copy, Debug)]
pub(crate) struct PaginationCursor {
    pub(crate) created_at: DateTime<FixedOffset>,
    pub(crate) id: Uuid,
}

impl PaginationCursor {
    pub(crate) fn parse(value: &str) -> Result<Self, ApiError> {
        let (created_at, id) =
            value.split_once('|').ok_or_else(invalid_cursor)?;
        Ok(Self {
            created_at: DateTime::parse_from_rfc3339(created_at)
                .map_err(|_| invalid_cursor())?,
            id: Uuid::parse_str(id).map_err(|_| invalid_cursor())?,
        })
    }

    pub(crate) fn encode(self) -> String {
        format!("{}|{}", self.created_at.to_rfc3339(), self.id)
    }
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub(crate) enum PaginationDirection {
    #[default]
    Older,
    Newer,
}

fn invalid_cursor() -> ApiError {
    ApiError::new(StatusCode::BAD_REQUEST, "Invalid pagination cursor.")
}
