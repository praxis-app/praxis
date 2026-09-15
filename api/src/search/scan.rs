use entity::{enums::PollType, forum_posts, messages, polls};
use sea_orm::{
    prelude::{DateTimeWithTimeZone, Uuid},
    sea_query::{Query, SelectStatement},
    ColumnTrait, Condition, DatabaseConnection, EntityTrait, QueryFilter,
    QueryOrder, QuerySelect,
};
use std::collections::HashMap;

use super::{
    request::SearchRequest,
    service::{query_error, SearchScope, SearchWindow},
    types::{SearchCoverageSource, SearchKind},
};
use crate::common::AppResult;

const SOURCE_SCAN_CAP: u64 = 1_000;

const MESSAGES_SOURCE: &str = "messages";
const POLLS_SOURCE: &str = "polls";
const FORUM_POSTS_SOURCE: &str = "forumPosts";

pub(super) struct EncryptedField {
    pub(super) ciphertext: Vec<u8>,
    pub(super) iv: Vec<u8>,
    pub(super) tag: Vec<u8>,
    pub(super) key_id: Uuid,
}

pub(super) struct Candidate {
    pub(super) kind: SearchKind,
    pub(super) id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) user_id: Uuid,
    pub(super) created_at: DateTimeWithTimeZone,
    pub(super) call_id: Option<Uuid>,
    pub(super) thread_root_id: Option<Uuid>,
    pub(super) thread_root_kind: Option<&'static str>,
    pub(super) forum_post_id: Option<Uuid>,
    pub(super) poll_id: Option<Uuid>,
    pub(super) fields: Vec<EncryptedField>,
}

pub(super) struct SourceScan {
    pub(super) candidates: Vec<Candidate>,
    pub(super) coverage: SearchCoverageSource,
    pub(super) frontier: Option<ScanFrontier>,
}

#[derive(Clone, Copy)]
pub(super) struct ScanFrontier {
    pub(super) created_at: DateTimeWithTimeZone,
    pub(super) kind: SearchKind,
    pub(super) id: Uuid,
}

impl ScanFrontier {
    pub(super) fn sort_key(
        &self,
    ) -> (DateTimeWithTimeZone, &'static str, Uuid) {
        (self.created_at, self.kind.as_str(), self.id)
    }
}

pub(super) async fn collect_candidates(
    database: &DatabaseConnection,
    scope: &SearchScope,
    request: &SearchRequest,
    window: SearchWindow,
) -> AppResult<Vec<SourceScan>> {
    Ok(vec![
        scan_messages(database, scope, request, window).await?,
        scan_polls(database, scope, request, window).await?,
        scan_forum_posts(database, scope, request, window).await?,
    ])
}

fn forum_root_message_ids() -> SelectStatement {
    Query::select()
        .column(forum_posts::Column::RootMessageId)
        .from(forum_posts::Entity)
        .take()
}

fn message_kind_condition(kind: SearchKind) -> Option<Condition> {
    match kind {
        SearchKind::ForumReply => Some(
            Condition::all().add(
                messages::Column::ThreadRootId
                    .in_subquery(forum_root_message_ids()),
            ),
        ),
        SearchKind::ThreadReply => Some(
            Condition::any()
                .add(messages::Column::ThreadPollId.is_not_null())
                .add(
                    Condition::all()
                        .add(messages::Column::ThreadRootId.is_not_null())
                        .add(
                            messages::Column::ThreadRootId
                                .not_in_subquery(forum_root_message_ids()),
                        ),
                ),
        ),
        SearchKind::CallMessage => Some(
            Condition::all()
                .add(messages::Column::CallId.is_not_null())
                .add(messages::Column::ThreadRootId.is_null())
                .add(messages::Column::ThreadPollId.is_null()),
        ),
        SearchKind::Message => Some(
            Condition::all()
                .add(messages::Column::CallId.is_null())
                .add(messages::Column::ThreadRootId.is_null())
                .add(messages::Column::ThreadPollId.is_null()),
        ),
        _ => None,
    }
}

async fn scan_messages(
    database: &DatabaseConnection,
    scope: &SearchScope,
    request: &SearchRequest,
    window: SearchWindow,
) -> AppResult<SourceScan> {
    let mut kind_conditions = Condition::any();
    let mut requested = false;
    for kind in &request.kinds {
        if let Some(condition) = message_kind_condition(*kind) {
            kind_conditions = kind_conditions.add(condition);
            requested = true;
        }
    }
    if !requested || scope.scanned_channel_ids.is_empty() {
        return Ok(SourceScan::empty(MESSAGES_SOURCE));
    }

    let query = messages::Entity::find()
        .filter(
            messages::Column::ChannelId
                .is_in(scope.scanned_channel_ids.clone()),
        )
        .filter(window.condition(messages::Column::CreatedAt))
        .filter(encrypted_message_condition())
        .filter(messages::Column::Id.not_in_subquery(forum_root_message_ids()))
        .filter(kind_conditions)
        .order_by_desc(messages::Column::CreatedAt)
        .order_by_desc(messages::Column::Id);
    let rows = query
        .clone()
        .limit(SOURCE_SCAN_CAP)
        .all(database)
        .await
        .map_err(query_error)?;
    let coverage = source_coverage(
        database,
        MESSAGES_SOURCE,
        rows.len(),
        query,
        messages::Column::Id,
    )
    .await?;

    let thread_root_ids: Vec<Uuid> =
        rows.iter().filter_map(|row| row.thread_root_id).collect();
    let posts_by_root = get_posts_by_root(database, thread_root_ids).await?;
    let frontier = rows.last().filter(|_| coverage.truncated).map(|row| {
        let is_forum_reply = row
            .thread_root_id
            .is_some_and(|root_id| posts_by_root.contains_key(&root_id));
        ScanFrontier {
            created_at: row.created_at,
            kind: classify_message(row, is_forum_reply),
            id: row.id,
        }
    });
    let requested_kinds = &request.kinds;
    let candidates = rows
        .into_iter()
        .filter_map(|row| {
            let post = row
                .thread_root_id
                .and_then(|root_id| posts_by_root.get(&root_id));
            let kind = classify_message(&row, post.is_some());
            if !requested_kinds.contains(&kind) {
                return None;
            }
            let field = encrypted_message_field(&row)?;
            Some(Candidate {
                kind,
                id: row.id,
                channel_id: row.channel_id,
                user_id: row.user_id,
                created_at: row.created_at,
                call_id: row.call_id,
                thread_root_id: row.thread_root_id.or(row.thread_poll_id),
                thread_root_kind: thread_root_kind(&row),
                forum_post_id: post.map(|post| post.id),
                poll_id: row.thread_poll_id,
                fields: vec![field],
            })
        })
        .collect();

    Ok(SourceScan {
        candidates,
        coverage,
        frontier,
    })
}

fn classify_message(
    message: &messages::Model,
    is_forum_reply: bool,
) -> SearchKind {
    if is_forum_reply {
        SearchKind::ForumReply
    } else if message.thread_root_id.is_some()
        || message.thread_poll_id.is_some()
    {
        SearchKind::ThreadReply
    } else if message.call_id.is_some() {
        SearchKind::CallMessage
    } else {
        SearchKind::Message
    }
}

fn thread_root_kind(message: &messages::Model) -> Option<&'static str> {
    if message.thread_poll_id.is_some() {
        Some("poll")
    } else if message.thread_root_id.is_some() {
        Some("message")
    } else {
        None
    }
}

async fn scan_polls(
    database: &DatabaseConnection,
    scope: &SearchScope,
    request: &SearchRequest,
    window: SearchWindow,
) -> AppResult<SourceScan> {
    let mut poll_types = Vec::new();
    if request.kinds.contains(&SearchKind::Poll) {
        poll_types.push(PollType::Poll);
    }
    if request.kinds.contains(&SearchKind::Proposal) {
        poll_types.push(PollType::Proposal);
    }
    if poll_types.is_empty() || scope.scanned_channel_ids.is_empty() {
        return Ok(SourceScan::empty(POLLS_SOURCE));
    }

    let query = polls::Entity::find()
        .filter(
            polls::Column::ChannelId.is_in(scope.scanned_channel_ids.clone()),
        )
        .filter(window.condition(polls::Column::CreatedAt))
        .filter(polls::Column::PollType.is_in(poll_types))
        .filter(
            Condition::all()
                .add(polls::Column::Ciphertext.is_not_null())
                .add(polls::Column::Iv.is_not_null())
                .add(polls::Column::Tag.is_not_null())
                .add(polls::Column::KeyId.is_not_null()),
        )
        .order_by_desc(polls::Column::CreatedAt)
        .order_by_desc(polls::Column::Id);
    let rows = query
        .clone()
        .limit(SOURCE_SCAN_CAP)
        .all(database)
        .await
        .map_err(query_error)?;
    let coverage = source_coverage(
        database,
        POLLS_SOURCE,
        rows.len(),
        query,
        polls::Column::Id,
    )
    .await?;

    let poll_ids: Vec<Uuid> = rows.iter().map(|row| row.id).collect();
    let posts_by_poll = get_posts_by_poll(database, poll_ids).await?;
    let frontier =
        rows.last()
            .filter(|_| coverage.truncated)
            .map(|row| ScanFrontier {
                created_at: row.created_at,
                kind: poll_kind(row.poll_type),
                id: row.id,
            });
    let candidates = rows
        .into_iter()
        .filter_map(|row| {
            let (Some(ciphertext), Some(iv), Some(tag), Some(key_id)) =
                (row.ciphertext, row.iv, row.tag, row.key_id)
            else {
                return None;
            };
            Some(Candidate {
                kind: poll_kind(row.poll_type),
                id: row.id,
                channel_id: row.channel_id,
                user_id: row.user_id,
                created_at: row.created_at,
                call_id: row.call_id,
                thread_root_id: None,
                thread_root_kind: None,
                forum_post_id: posts_by_poll.get(&row.id).copied(),
                poll_id: Some(row.id),
                fields: vec![EncryptedField {
                    ciphertext,
                    iv,
                    tag,
                    key_id,
                }],
            })
        })
        .collect();

    Ok(SourceScan {
        candidates,
        coverage,
        frontier,
    })
}

fn poll_kind(poll_type: PollType) -> SearchKind {
    match poll_type {
        PollType::Proposal => SearchKind::Proposal,
        PollType::Poll => SearchKind::Poll,
    }
}

async fn scan_forum_posts(
    database: &DatabaseConnection,
    scope: &SearchScope,
    request: &SearchRequest,
    window: SearchWindow,
) -> AppResult<SourceScan> {
    if !request.kinds.contains(&SearchKind::ForumPost)
        || scope.scanned_channel_ids.is_empty()
    {
        return Ok(SourceScan::empty(FORUM_POSTS_SOURCE));
    }

    let query = forum_posts::Entity::find()
        .filter(
            forum_posts::Column::ChannelId
                .is_in(scope.scanned_channel_ids.clone()),
        )
        .filter(window.condition(forum_posts::Column::CreatedAt))
        .order_by_desc(forum_posts::Column::CreatedAt)
        .order_by_desc(forum_posts::Column::Id);
    let rows = query
        .clone()
        .limit(SOURCE_SCAN_CAP)
        .all(database)
        .await
        .map_err(query_error)?;
    let coverage = source_coverage(
        database,
        FORUM_POSTS_SOURCE,
        rows.len(),
        query,
        forum_posts::Column::Id,
    )
    .await?;

    let frontier =
        rows.last()
            .filter(|_| coverage.truncated)
            .map(|row| ScanFrontier {
                created_at: row.created_at,
                kind: SearchKind::ForumPost,
                id: row.id,
            });
    let root_ids: Vec<Uuid> =
        rows.iter().map(|row| row.root_message_id).collect();
    let roots: HashMap<Uuid, messages::Model> = if root_ids.is_empty() {
        HashMap::new()
    } else {
        messages::Entity::find()
            .filter(messages::Column::Id.is_in(root_ids))
            .all(database)
            .await
            .map_err(query_error)?
            .into_iter()
            .map(|root| (root.id, root))
            .collect()
    };

    let candidates = rows
        .into_iter()
        .map(|row| {
            let mut fields = vec![EncryptedField {
                ciphertext: row.ciphertext,
                iv: row.iv,
                tag: row.tag,
                key_id: row.key_id,
            }];
            if let Some(field) = roots
                .get(&row.root_message_id)
                .and_then(encrypted_message_field)
            {
                fields.push(field);
            }
            Candidate {
                kind: SearchKind::ForumPost,
                id: row.id,
                channel_id: row.channel_id,
                user_id: row.user_id,
                created_at: row.created_at,
                call_id: None,
                thread_root_id: Some(row.root_message_id),
                thread_root_kind: Some("message"),
                forum_post_id: Some(row.id),
                poll_id: row.poll_id,
                fields,
            }
        })
        .collect();

    Ok(SourceScan {
        candidates,
        coverage,
        frontier,
    })
}

fn encrypted_message_condition() -> Condition {
    Condition::all()
        .add(messages::Column::Ciphertext.is_not_null())
        .add(messages::Column::Iv.is_not_null())
        .add(messages::Column::Tag.is_not_null())
        .add(messages::Column::KeyId.is_not_null())
}

fn encrypted_message_field(
    message: &messages::Model,
) -> Option<EncryptedField> {
    let (Some(ciphertext), Some(iv), Some(tag), Some(key_id)) = (
        message.ciphertext.as_ref(),
        message.iv.as_ref(),
        message.tag.as_ref(),
        message.key_id,
    ) else {
        return None;
    };

    Some(EncryptedField {
        ciphertext: ciphertext.clone(),
        iv: iv.clone(),
        tag: tag.clone(),
        key_id,
    })
}

async fn get_posts_by_root(
    database: &DatabaseConnection,
    root_message_ids: Vec<Uuid>,
) -> AppResult<HashMap<Uuid, forum_posts::Model>> {
    if root_message_ids.is_empty() {
        return Ok(HashMap::new());
    }

    Ok(forum_posts::Entity::find()
        .filter(forum_posts::Column::RootMessageId.is_in(root_message_ids))
        .all(database)
        .await
        .map_err(query_error)?
        .into_iter()
        .map(|post| (post.root_message_id, post))
        .collect())
}

async fn get_posts_by_poll(
    database: &DatabaseConnection,
    poll_ids: Vec<Uuid>,
) -> AppResult<HashMap<Uuid, Uuid>> {
    if poll_ids.is_empty() {
        return Ok(HashMap::new());
    }

    Ok(forum_posts::Entity::find()
        .filter(forum_posts::Column::PollId.is_in(poll_ids))
        .all(database)
        .await
        .map_err(query_error)?
        .into_iter()
        .filter_map(|post| post.poll_id.map(|poll_id| (poll_id, post.id)))
        .collect())
}

impl SourceScan {
    fn empty(source: &'static str) -> Self {
        Self {
            candidates: vec![],
            coverage: SearchCoverageSource {
                source,
                cap: SOURCE_SCAN_CAP,
                scanned: 0,
                truncated: false,
            },
            frontier: None,
        }
    }
}

async fn source_coverage<E, C>(
    database: &DatabaseConnection,
    source: &'static str,
    scanned: usize,
    query: sea_orm::Select<E>,
    id_column: C,
) -> AppResult<SearchCoverageSource>
where
    E: EntityTrait,
    C: ColumnTrait,
{
    let truncated = if scanned < SOURCE_SCAN_CAP as usize {
        false
    } else {
        query
            .select_only()
            .column(id_column)
            .offset(SOURCE_SCAN_CAP)
            .limit(1)
            .into_tuple::<Uuid>()
            .one(database)
            .await
            .map_err(query_error)?
            .is_some()
    };

    Ok(SearchCoverageSource {
        source,
        cap: SOURCE_SCAN_CAP,
        scanned,
        truncated,
    })
}
