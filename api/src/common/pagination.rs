use axum::http::StatusCode;
use chrono::{DateTime, FixedOffset};
use sea_orm::{prelude::Uuid, ColumnTrait, Condition};

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

pub(crate) fn older_than_cursor<C: ColumnTrait>(
    created_at: C,
    id: C,
    cursor: PaginationCursor,
) -> Condition {
    Condition::any().add(created_at.lt(cursor.created_at)).add(
        Condition::all()
            .add(created_at.eq(cursor.created_at))
            .add(id.lt(cursor.id)),
    )
}

pub(crate) fn finish_page<T>(
    records: &mut Vec<T>,
    limit: u64,
    cursor_of: impl Fn(&T) -> PaginationCursor,
) -> (Option<String>, bool) {
    let has_more = records.len() > limit as usize;
    records.truncate(limit as usize);
    let next_cursor = has_more
        .then(|| records.last())
        .flatten()
        .map(|record| cursor_of(record).encode());
    (next_cursor, has_more)
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
