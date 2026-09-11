use entity::users;
use sea_orm::{
    prelude::{DateTimeWithTimeZone, Uuid},
    ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter,
};
use std::{cmp::Ordering, collections::HashMap};

use super::{
    cursor::SearchCursor,
    matching,
    scan::{Candidate, ScanFrontier},
    service::{query_error, SearchScope},
    types::{SearchAuthor, SearchKind, SearchResult},
};
use crate::common::{encryption, AppResult};

pub(super) fn evaluate_candidates(
    candidates: Vec<Candidate>,
    keys: &HashMap<Uuid, Vec<u8>>,
    needle: &str,
) -> Vec<(Candidate, String)> {
    candidates
        .into_iter()
        .filter_map(|candidate| {
            let excerpt = candidate.fields.iter().find_map(|field| {
                let key = keys.get(&field.key_id)?;
                let plaintext = encryption::decrypt_text(
                    &field.ciphertext,
                    &field.iv,
                    &field.tag,
                    key,
                )
                .ok()?;
                matching::match_excerpt(&plaintext, needle)
            })?;
            Some((candidate, excerpt))
        })
        .collect()
}

pub(super) struct Page {
    pub(super) items: Vec<(Candidate, String)>,
    pub(super) next: Option<(DateTimeWithTimeZone, SearchKind, Uuid)>,
    pub(super) has_more: bool,
}

pub(super) fn paginate(
    mut matched: Vec<(Candidate, String)>,
    cursor: Option<SearchCursor>,
    coverage_floor: Option<ScanFrontier>,
    limit: u64,
) -> Page {
    matched.sort_by(|left, right| compare_descending(&left.0, &right.0));
    if let Some(cursor) = cursor {
        matched.retain(|(candidate, _)| is_after_cursor(candidate, &cursor));
    }
    if let Some(floor) = coverage_floor {
        matched
            .retain(|(candidate, _)| candidate.created_at >= floor.created_at);
    }

    let overflows = matched.len() > limit as usize;
    matched.truncate(limit as usize);

    let has_more = overflows || coverage_floor.is_some();
    let next = has_more
        .then(|| {
            matched
                .last()
                .map(|(candidate, _)| {
                    (candidate.created_at, candidate.kind, candidate.id)
                })
                .or_else(|| {
                    coverage_floor
                        .map(|floor| (floor.created_at, floor.kind, floor.id))
                })
        })
        .flatten();

    Page {
        items: matched,
        next,
        has_more,
    }
}

fn compare_descending(left: &Candidate, right: &Candidate) -> Ordering {
    right
        .created_at
        .cmp(&left.created_at)
        .then_with(|| right.kind.as_str().cmp(left.kind.as_str()))
        .then_with(|| right.id.cmp(&left.id))
}

fn is_after_cursor(candidate: &Candidate, cursor: &SearchCursor) -> bool {
    match candidate.created_at.cmp(&cursor.created_at) {
        Ordering::Less => true,
        Ordering::Greater => false,
        Ordering::Equal => {
            match candidate.kind.as_str().cmp(cursor.kind.as_str()) {
                Ordering::Less => true,
                Ordering::Greater => false,
                Ordering::Equal => candidate.id < cursor.id,
            }
        }
    }
}

pub(super) async fn shape_results(
    database: &DatabaseConnection,
    scope: &SearchScope,
    items: Vec<(Candidate, String)>,
) -> AppResult<Vec<SearchResult>> {
    if items.is_empty() {
        return Ok(vec![]);
    }

    let mut user_ids: Vec<Uuid> = items
        .iter()
        .map(|(candidate, _)| candidate.user_id)
        .collect();
    user_ids.sort_unstable();
    user_ids.dedup();
    let authors: HashMap<Uuid, users::Model> = users::Entity::find()
        .filter(users::Column::Id.is_in(user_ids))
        .all(database)
        .await
        .map_err(query_error)?
        .into_iter()
        .map(|user| (user.id, user))
        .collect();

    Ok(items
        .into_iter()
        .filter_map(|(candidate, excerpt)| {
            let channel = scope.channels.get(&candidate.channel_id)?;
            let author = authors.get(&candidate.user_id)?;
            Some(SearchResult {
                kind: candidate.kind,
                id: candidate.id.to_string(),
                server_id: scope.server.id.to_string(),
                server_slug: scope.server.slug.clone(),
                channel_id: channel.id.to_string(),
                channel_name: channel.name.clone(),
                author: SearchAuthor {
                    id: author.id.to_string(),
                    name: author.name.clone(),
                    display_name: author.display_name.clone(),
                },
                created_at: candidate.created_at.to_rfc3339(),
                excerpt,
                call_id: candidate.call_id.map(|id| id.to_string()),
                thread_root_id: candidate
                    .thread_root_id
                    .map(|id| id.to_string()),
                thread_root_kind: candidate.thread_root_kind,
                forum_post_id: candidate.forum_post_id.map(|id| id.to_string()),
                poll_id: candidate.poll_id.map(|id| id.to_string()),
            })
        })
        .collect())
}
