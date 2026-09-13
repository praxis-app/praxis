//! Owns request facing poll orchestration, authorization, reads, and response
//! shaping while delegating creation, outcome evaluation, and scheduled sync

use axum::http::StatusCode;
use chrono::{DateTime, FixedOffset};
use entity::{
    channel_members, channels as channel_entities,
    enums::{NotificationKind, PollStage, PollType, VoteType},
    forum_posts, notifications, poll_configs, poll_images,
    poll_option_selections, poll_options, polls, users, votes,
};
use sea_orm::{
    prelude::Uuid,
    sea_query::{NullOrdering, Order},
    ColumnTrait, Condition, DatabaseConnection, DeleteResult, EntityTrait,
    QueryFilter, QueryOrder, QuerySelect, TransactionTrait,
};
use std::{
    collections::{HashMap, HashSet},
    path::Path,
};

use super::{
    creation::prepare_poll_creation,
    types::{
        ActiveDecisionResponse, ActiveDecisionsResponse, CallDecisionResponse,
        CreatePollContext, CreatePollRequest, PollActionEventCoverPhotoPath,
        PollConfigResponse, PollImagePath, PollImageResponse,
        PollOptionResponse, PollResponse, PollUserResponse, StoredPollImage,
    },
};
pub(crate) use super::{
    creation::{
        attach_poll_creation_images, commit_creation, insert_prepared_poll,
        prepare_forum_proposal, CreationUploads,
    },
    outcome::{
        finalize_ratifiable_proposal, is_poll_ratifiable, ProposalFinalization,
        PROPOSAL_BLOCK_SUBJECT,
    },
    sync::{spawn_expired_poll_closer, spawn_proposal_synchronizer},
};
use crate::{
    authz, channels,
    common::{
        encryption,
        pagination::{PaginationCursor, PaginationDirection},
        ApiError, AppResult,
    },
    messages::types::serialize_timestamp,
    notifications::WithNotifications,
    poll_actions,
    pub_sub::{PubSubService, PubSubTopic},
    servers, users as users_service, votes as vote_service,
};

pub(super) async fn create_poll(
    database: &DatabaseConnection,
    upload_root: &Path,
    context: CreatePollContext,
    request: CreatePollRequest,
    uploads: CreationUploads,
) -> AppResult<WithNotifications<PollResponse>> {
    create_poll_record(database, upload_root, context, None, request, uploads)
        .await
}

async fn create_poll_record(
    database: &DatabaseConnection,
    upload_root: &Path,
    context: CreatePollContext,
    call_id: Option<Uuid>,
    request: CreatePollRequest,
    uploads: CreationUploads,
) -> AppResult<WithNotifications<PollResponse>> {
    let CreatePollContext {
        server_id,
        channel_id,
        user_id,
    } = context;
    let prepared = prepare_poll_creation(
        database, server_id, channel_id, user_id, request, false,
    )
    .await?;
    let transaction = database.begin().await.map_err(internal_error)?;
    let poll =
        insert_prepared_poll(&transaction, call_id, user_id, prepared).await?;
    let image_paths = attach_poll_creation_images(
        &transaction,
        upload_root,
        poll.id,
        uploads,
    )
    .await?;
    // TODO: polls and call decisions notify nobody yet, only channel proposals
    let notifications =
        if poll.poll_type == PollType::Proposal && call_id.is_none() {
            notify_new_proposal(
                &transaction,
                server_id,
                channel_id,
                user_id,
                poll.id,
            )
            .await?
        } else {
            Vec::new()
        };
    commit_creation(transaction, image_paths).await?;
    let poll = get_poll_response(
        database,
        server_id,
        channel_id,
        poll.id,
        Some(user_id),
    )
    .await?;

    Ok(WithNotifications::new(poll, notifications))
}

/// Announces a proposal to everyone who can read the channel it landed in
pub(crate) async fn notify_new_proposal<C>(
    database: &C,
    server_id: Uuid,
    channel_id: Uuid,
    author_id: Uuid,
    poll_id: Uuid,
) -> AppResult<Vec<notifications::Model>>
where
    C: sea_orm::ConnectionTrait,
{
    let recipient_ids =
        channels::get_channel_member_user_ids(database, channel_id).await?;

    crate::notifications::create_notifications(
        database,
        crate::notifications::CreateNotificationsRequest {
            kind: NotificationKind::NewProposal,
            server_id,
            channel_id: Some(channel_id),
            actor_user_id: Some(author_id),
            target: crate::notifications::NotificationTarget::Poll(poll_id),
            vote_type: None,
            recipient_ids,
        },
    )
    .await
}

pub(super) async fn create_call_poll(
    database: &DatabaseConnection,
    upload_root: &Path,
    context: CreatePollContext,
    call_id: Uuid,
    request: CreatePollRequest,
    uploads: CreationUploads,
) -> AppResult<PollResponse> {
    crate::calls::service::get_call(
        database,
        context.server_id,
        context.channel_id,
        call_id,
    )
    .await?;
    let created = create_poll_record(
        database,
        upload_root,
        context,
        Some(call_id),
        request,
        uploads,
    )
    .await?;

    Ok(created.value)
}

pub(crate) async fn broadcast_poll_update(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    server_id: Uuid,
    channel_id: Uuid,
    sender_id: Option<Uuid>,
    poll_id: Uuid,
) -> AppResult<()> {
    let members =
        channels::get_channel_member_user_ids(database, channel_id).await?;

    for member_id in members {
        if Some(member_id) == sender_id {
            continue;
        }

        let poll = get_poll_response(
            database,
            server_id,
            channel_id,
            poll_id,
            Some(member_id),
        )
        .await?;
        let body = serde_json::json!({
            "type": "poll",
            "poll": poll,
        });
        let topic =
            PubSubTopic::new_poll(server_id, channel_id, member_id).to_string();
        pub_sub_service.publish(&topic, body).await?;
    }

    Ok(())
}

pub(crate) async fn get_inline_polls(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    cursor: Option<PaginationCursor>,
    direction: PaginationDirection,
    limit: u64,
    current_user_id: Option<Uuid>,
) -> AppResult<Vec<PollResponse>> {
    channels::get_channel(database, server_id, channel_id).await?;
    let mut query =
        polls::Entity::find().filter(polls::Column::ChannelId.eq(channel_id));
    if let Some(cursor) = cursor {
        let timestamp_comparison = match direction {
            PaginationDirection::Older => {
                polls::Column::CreatedAt.lt(cursor.created_at)
            }
            PaginationDirection::Newer => {
                polls::Column::CreatedAt.gt(cursor.created_at)
            }
        };
        let id_comparison = match direction {
            PaginationDirection::Older => polls::Column::Id.lt(cursor.id),
            PaginationDirection::Newer => polls::Column::Id.gt(cursor.id),
        };
        query = query.filter(
            Condition::any().add(timestamp_comparison).add(
                Condition::all()
                    .add(polls::Column::CreatedAt.eq(cursor.created_at))
                    .add(id_comparison),
            ),
        );
    }
    query = match direction {
        PaginationDirection::Older => query
            .order_by_desc(polls::Column::CreatedAt)
            .order_by_desc(polls::Column::Id),
        PaginationDirection::Newer => query
            .order_by_asc(polls::Column::CreatedAt)
            .order_by_asc(polls::Column::Id),
    };
    let polls = query
        .limit(limit)
        .all(database)
        .await
        .map_err(internal_error)?;

    shape_polls(database, polls, current_user_id).await
}

/// Loads one poll/proposal by ID for focused channel-feed navigation
pub(crate) async fn get_inline_poll_target(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    poll_id: Uuid,
    current_user_id: Option<Uuid>,
) -> AppResult<Option<PollResponse>> {
    channels::get_channel(database, server_id, channel_id).await?;

    let poll = polls::Entity::find_by_id(poll_id)
        .filter(polls::Column::ChannelId.eq(channel_id))
        .one(database)
        .await
        .map_err(internal_error)?;
    let Some(poll) = poll else {
        return Ok(None);
    };

    Ok(Some(shape_poll(database, poll, current_user_id).await?))
}

pub(super) async fn get_call_decision(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    call_id: Uuid,
    user_id: Uuid,
) -> AppResult<CallDecisionResponse> {
    crate::calls::service::get_call(database, server_id, channel_id, call_id)
        .await?;

    let active_item = match polls::Entity::find()
        .filter(polls::Column::ChannelId.eq(channel_id))
        .filter(polls::Column::CallId.eq(call_id))
        .filter(polls::Column::Stage.eq(PollStage::Voting))
        .order_by_desc(polls::Column::CreatedAt)
        .one(database)
        .await
        .map_err(internal_error)?
    {
        Some(poll) => Some(shape_poll(database, poll, Some(user_id)).await?),
        None => {
            let active_channel_poll = polls::Entity::find()
                .filter(polls::Column::ChannelId.eq(channel_id))
                .filter(polls::Column::Stage.eq(PollStage::Voting))
                .order_by_desc(polls::Column::CreatedAt)
                .one(database)
                .await
                .map_err(internal_error)?;

            match active_channel_poll {
                Some(poll) => {
                    Some(shape_poll(database, poll, Some(user_id)).await?)
                }
                None => None,
            }
        }
    };

    let recent_result = match polls::Entity::find()
        .filter(polls::Column::ChannelId.eq(channel_id))
        .filter(
            polls::Column::Stage
                .is_in([PollStage::Ratified, PollStage::Closed]),
        )
        .order_by_desc(polls::Column::UpdatedAt)
        .one(database)
        .await
        .map_err(internal_error)?
    {
        Some(poll) => Some(shape_poll(database, poll, Some(user_id)).await?),
        None => None,
    };

    Ok(CallDecisionResponse {
        active_item,
        recent_result,
    })
}

pub(super) async fn get_poll_action_event_cover_photo(
    database: &DatabaseConnection,
    upload_root: &Path,
    path: PollActionEventCoverPhotoPath,
    user_id: Option<Uuid>,
    invite_token: Option<&str>,
) -> AppResult<StoredPollImage> {
    let PollActionEventCoverPhotoPath {
        server_id,
        channel_id,
        poll_id,
        image_id,
    } = path;
    load_poll(database, server_id, channel_id, poll_id).await?;
    channels::can_read_channel(
        database,
        server_id,
        channel_id,
        user_id,
        invite_token,
    )
    .await?;
    let image = poll_actions::service::load_event_cover_photo(
        database, poll_id, image_id,
    )
    .await?;
    let storage_key = image.storage_key.ok_or_else(|| {
        ApiError::new(StatusCode::NOT_FOUND, "Image file not found.")
    })?;
    let bytes = tokio::fs::read(upload_root.join(storage_key))
        .await
        .map_err(|_| {
            ApiError::new(StatusCode::NOT_FOUND, "Image file not found.")
        })?;
    Ok(StoredPollImage { bytes })
}

pub(super) async fn get_poll_image(
    database: &DatabaseConnection,
    upload_root: &Path,
    path: PollImagePath,
    user_id: Option<Uuid>,
    invite_token: Option<&str>,
) -> AppResult<StoredPollImage> {
    let PollImagePath {
        server_id,
        channel_id,
        poll_id,
        image_id,
    } = path;
    load_poll(database, server_id, channel_id, poll_id).await?;
    channels::can_read_channel(
        database,
        server_id,
        channel_id,
        user_id,
        invite_token,
    )
    .await?;
    let image = poll_images::Entity::find_by_id(image_id)
        .filter(poll_images::Column::PollId.eq(poll_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Image not found.")
        })?;
    let storage_key = image.storage_key.ok_or_else(|| {
        ApiError::new(StatusCode::NOT_FOUND, "Image file not found.")
    })?;
    let bytes = tokio::fs::read(upload_root.join(storage_key))
        .await
        .map_err(|_| {
            ApiError::new(StatusCode::NOT_FOUND, "Image file not found.")
        })?;
    Ok(StoredPollImage { bytes })
}

pub(super) async fn delete_poll(
    database: &DatabaseConnection,
    upload_root: &Path,
    poll: &polls::Model,
) -> AppResult<DeleteResult> {
    let transaction = database.begin().await.map_err(internal_error)?;
    if forum_posts::Entity::find()
        .filter(forum_posts::Column::PollId.eq(poll.id))
        .one(&transaction)
        .await
        .map_err(internal_error)?
        .is_some()
    {
        return Err(ApiError::new(
            StatusCode::CONFLICT,
            "A proposal linked to a forum post cannot be deleted separately.",
        ));
    }
    let images = poll_images::Entity::find()
        .filter(poll_images::Column::PollId.eq(poll.id))
        .all(&transaction)
        .await
        .map_err(internal_error)?;
    let mut storage_keys = images
        .into_iter()
        .filter_map(|image| image.storage_key)
        .collect::<Vec<_>>();
    if let Some(storage_key) =
        poll_actions::service::event_cover_photo_storage_key(
            &transaction,
            poll.id,
        )
        .await?
    {
        storage_keys.push(storage_key);
    }

    let result = polls::Entity::delete_by_id(poll.id)
        .exec(&transaction)
        .await
        .map_err(internal_error)?;
    transaction.commit().await.map_err(internal_error)?;

    for storage_key in storage_keys {
        if let Err(error) =
            tokio::fs::remove_file(upload_root.join(&storage_key)).await
        {
            tracing::warn!(
                poll_id = %poll.id,
                storage_key,
                "failed to clean up deleted poll image: {error}"
            );
        }
    }

    Ok(result)
}

pub(crate) async fn is_public_channel_poll(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    poll_id: Uuid,
) -> AppResult<bool> {
    load_poll(database, server_id, channel_id, poll_id).await?;
    let default_server_id = servers::default_server_id(database).await?;
    Ok(default_server_id == server_id)
}

pub(crate) async fn load_poll(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    poll_id: Uuid,
) -> AppResult<polls::Model> {
    if server_id != Uuid::nil() {
        channels::get_channel(database, server_id, channel_id).await?;
    }
    polls::Entity::find_by_id(poll_id)
        .filter(polls::Column::ChannelId.eq(channel_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| ApiError::new(StatusCode::NOT_FOUND, "Poll not found."))
}

pub(crate) async fn get_poll_response(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    poll_id: Uuid,
    current_user_id: Option<Uuid>,
) -> AppResult<PollResponse> {
    let poll = load_poll(database, server_id, channel_id, poll_id).await?;
    shape_poll(database, poll, current_user_id).await
}

pub(super) async fn get_active_decisions(
    database: &DatabaseConnection,
    server_id: Uuid,
    current_user_id: Option<Uuid>,
    invite_token: Option<&str>,
    before: Option<&str>,
    limit: u64,
) -> AppResult<ActiveDecisionsResponse> {
    servers::is_server_audience(
        database,
        server_id,
        current_user_id,
        invite_token,
    )
    .await?;
    let cursor = before.map(ActiveDecisionCursor::parse).transpose()?;

    let current_user = if let Some(user_id) = current_user_id {
        users::Entity::find_by_id(user_id)
            .one(database)
            .await
            .map_err(internal_error)?
    } else {
        None
    };
    let response_user_id = current_user.as_ref().map(|user| user.id);
    let member_user_id = current_user.map(|user| user.id);

    let channels = if let Some(user_id) = member_user_id {
        let channel_ids = channel_members::Entity::find()
            .filter(channel_members::Column::UserId.eq(user_id))
            .all(database)
            .await
            .map_err(internal_error)?
            .into_iter()
            .map(|membership| membership.channel_id)
            .collect::<Vec<_>>();

        if channel_ids.is_empty() {
            vec![]
        } else {
            channel_entities::Entity::find()
                .filter(channel_entities::Column::ServerId.eq(server_id))
                .filter(channel_entities::Column::Id.is_in(channel_ids))
                .all(database)
                .await
                .map_err(internal_error)?
        }
    } else {
        channel_entities::Entity::find()
            .filter(channel_entities::Column::ServerId.eq(server_id))
            .all(database)
            .await
            .map_err(internal_error)?
    };

    let channels_by_id = channels
        .into_iter()
        .map(|channel| (channel.id, channel))
        .collect::<HashMap<_, _>>();
    let channel_ids = channels_by_id.keys().copied().collect::<Vec<_>>();
    if channel_ids.is_empty() {
        return Ok(ActiveDecisionsResponse {
            decisions: vec![],
            next_cursor: None,
            has_more: false,
        });
    }

    let mut polls_query = polls::Entity::find()
        .filter(polls::Column::ChannelId.is_in(channel_ids))
        .filter(polls::Column::Stage.eq(PollStage::Voting))
        .find_also_related(poll_configs::Entity);
    if let Some(cursor) = cursor {
        polls_query =
            polls_query.filter(active_decision_cursor_condition(cursor));
    }
    let mut polls_with_configs = polls_query
        .order_by_with_nulls(
            poll_configs::Column::ClosingAt,
            Order::Asc,
            NullOrdering::Last,
        )
        .order_by_desc(polls::Column::CreatedAt)
        .order_by_desc(polls::Column::Id)
        .limit(limit.saturating_add(1))
        .all(database)
        .await
        .map_err(internal_error)?;

    let has_more = polls_with_configs.len() > limit as usize;
    if has_more {
        polls_with_configs.pop();
    }
    let next_cursor = polls_with_configs.last().map(|(poll, config)| {
        ActiveDecisionCursor {
            closing_at: config.as_ref().and_then(|config| config.closing_at),
            created_at: poll.created_at,
            id: poll.id,
        }
        .encode()
    });

    if polls_with_configs.is_empty() {
        return Ok(ActiveDecisionsResponse {
            decisions: vec![],
            next_cursor,
            has_more,
        });
    }

    let poll_ids = polls_with_configs
        .iter()
        .map(|(poll, _)| poll.id)
        .collect::<Vec<_>>();
    let forum_posts_by_poll_id = forum_posts::Entity::find()
        .filter(forum_posts::Column::PollId.is_in(poll_ids))
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .filter_map(|post| post.poll_id.map(|poll_id| (poll_id, post.id)))
        .collect::<HashMap<_, _>>();

    let decision_polls: Vec<polls::Model> = polls_with_configs
        .iter()
        .map(|(poll, _)| poll.clone())
        .collect();
    let responses =
        shape_polls(database, decision_polls, response_user_id).await?;

    let mut decisions = Vec::with_capacity(polls_with_configs.len());
    for ((poll, _), response) in polls_with_configs.iter().zip(responses) {
        let channel =
            channels_by_id.get(&poll.channel_id).ok_or_else(|| {
                ApiError::new(
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Decision channel not found.",
                )
            })?;

        decisions.push(ActiveDecisionResponse {
            id: response.id,
            poll_type: response.poll_type,
            body: response.body,
            closing_at: response.config.closing_at,
            response_count: response.votes.len(),
            member_count: response.member_count,
            has_responded: response.my_vote.is_some(),
            created_at: response.created_at,
            channel_id: channel.id.to_string(),
            channel_name: channel.name.clone(),
            channel_type: channel.channel_type,
            forum_post_id: forum_posts_by_poll_id
                .get(&poll.id)
                .map(ToString::to_string),
        });
    }

    Ok(ActiveDecisionsResponse {
        decisions,
        next_cursor,
        has_more,
    })
}

#[derive(Clone, Copy, Debug)]
struct ActiveDecisionCursor {
    closing_at: Option<DateTime<FixedOffset>>,
    created_at: DateTime<FixedOffset>,
    id: Uuid,
}

impl ActiveDecisionCursor {
    fn parse(value: &str) -> AppResult<Self> {
        let mut parts = value.split('|');
        let closing_at = match parts.next() {
            Some("") => None,
            Some(value) => Some(
                DateTime::parse_from_rfc3339(value)
                    .map_err(|_| invalid_active_decision_cursor())?,
            ),
            None => return Err(invalid_active_decision_cursor()),
        };
        let created_at = parts
            .next()
            .ok_or_else(invalid_active_decision_cursor)
            .and_then(|value| {
                DateTime::parse_from_rfc3339(value)
                    .map_err(|_| invalid_active_decision_cursor())
            })?;
        let id = parts
            .next()
            .ok_or_else(invalid_active_decision_cursor)
            .and_then(|value| {
                Uuid::parse_str(value)
                    .map_err(|_| invalid_active_decision_cursor())
            })?;
        if parts.next().is_some() {
            return Err(invalid_active_decision_cursor());
        }

        Ok(Self {
            closing_at,
            created_at,
            id,
        })
    }

    fn encode(self) -> String {
        format!(
            "{}|{}|{}",
            self.closing_at
                .map(|closing_at| closing_at.to_rfc3339())
                .unwrap_or_default(),
            self.created_at.to_rfc3339(),
            self.id,
        )
    }
}

fn active_decision_cursor_condition(cursor: ActiveDecisionCursor) -> Condition {
    let poll_tie_breaker = Condition::any()
        .add(polls::Column::CreatedAt.lt(cursor.created_at))
        .add(
            Condition::all()
                .add(polls::Column::CreatedAt.eq(cursor.created_at))
                .add(polls::Column::Id.lt(cursor.id)),
        );

    match cursor.closing_at {
        Some(closing_at) => Condition::any()
            .add(poll_configs::Column::ClosingAt.gt(closing_at))
            .add(poll_configs::Column::ClosingAt.is_null())
            .add(
                Condition::all()
                    .add(poll_configs::Column::ClosingAt.eq(closing_at))
                    .add(poll_tie_breaker),
            ),
        None => Condition::all()
            .add(poll_configs::Column::ClosingAt.is_null())
            .add(poll_tie_breaker),
    }
}

fn invalid_active_decision_cursor() -> ApiError {
    ApiError::new(StatusCode::BAD_REQUEST, "Invalid pagination cursor.")
}

async fn shape_poll(
    database: &DatabaseConnection,
    poll: polls::Model,
    current_user_id: Option<Uuid>,
) -> AppResult<PollResponse> {
    shape_polls(database, vec![poll], current_user_id)
        .await?
        .pop()
        .ok_or_else(|| ApiError::new(StatusCode::NOT_FOUND, "Poll not found."))
}

async fn shape_polls(
    database: &DatabaseConnection,
    polls: Vec<polls::Model>,
    current_user_id: Option<Uuid>,
) -> AppResult<Vec<PollResponse>> {
    if polls.is_empty() {
        return Ok(vec![]);
    }

    let poll_ids: Vec<Uuid> = polls.iter().map(|poll| poll.id).collect();
    let reply_summaries =
        crate::messages::load_poll_reply_summaries(database, poll_ids.clone())
            .await?;
    let reply_participants = crate::messages::load_poll_reply_participants(
        database,
        poll_ids.clone(),
    )
    .await?;
    let mut user_ids: Vec<Uuid> =
        polls.iter().map(|poll| poll.user_id).collect();
    user_ids.extend(
        reply_participants
            .values()
            .flat_map(|participant_ids| participant_ids.iter().copied()),
    );
    user_ids.sort_unstable();
    user_ids.dedup();

    // Load everything the batch needs, one query per relation
    let users = users::Entity::find()
        .filter(users::Column::Id.is_in(user_ids.iter().copied()))
        .all(database)
        .await
        .map_err(internal_error)?;
    let profile_pictures =
        users_service::get_user_profile_pictures_map(database, &user_ids)
            .await?;
    let configs = poll_configs::Entity::find()
        .filter(poll_configs::Column::PollId.is_in(poll_ids.iter().copied()))
        .all(database)
        .await
        .map_err(internal_error)?;
    let votes = votes::Entity::find()
        .filter(votes::Column::PollId.is_in(poll_ids.iter().copied()))
        .order_by_asc(votes::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;
    let vote_ids: Vec<Uuid> = votes.iter().map(|vote| vote.id).collect();
    let selections = if vote_ids.is_empty() {
        vec![]
    } else {
        poll_option_selections::Entity::find()
            .filter(poll_option_selections::Column::VoteId.is_in(vote_ids))
            .all(database)
            .await
            .map_err(internal_error)?
    };
    let options = poll_options::Entity::find()
        .filter(poll_options::Column::PollId.is_in(poll_ids.iter().copied()))
        .order_by_asc(poll_options::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;
    let images = poll_images::Entity::find()
        .filter(poll_images::Column::PollId.is_in(poll_ids.iter().copied()))
        .order_by_asc(poll_images::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;
    let key_ids: Vec<Uuid> =
        polls.iter().filter_map(|poll| poll.key_id).collect();
    let key_map =
        channels::get_unwrapped_channel_key_map(database, key_ids).await?;
    let mut actions =
        poll_actions::service::shape_poll_actions(database, &poll_ids).await?;
    let member_counts = get_channel_member_counts(
        database,
        polls.iter().map(|poll| poll.channel_id),
    )
    .await?;
    let call_statuses = crate::calls::service::get_call_statuses(
        database,
        polls.iter().filter_map(|poll| poll.call_id).collect(),
    )
    .await?;
    let ignored_block_vote_ids =
        get_ignored_block_vote_ids(database, &polls, &configs, &votes).await?;

    // Group the loaded rows by poll so each response is an in-memory lookup
    let mut votes_by_poll: HashMap<Uuid, Vec<votes::Model>> = HashMap::new();
    for vote in votes {
        votes_by_poll.entry(vote.poll_id).or_default().push(vote);
    }
    let mut options_by_poll: HashMap<Uuid, Vec<poll_options::Model>> =
        HashMap::new();
    for option in options {
        options_by_poll
            .entry(option.poll_id)
            .or_default()
            .push(option);
    }
    let mut images_by_poll: HashMap<Uuid, Vec<poll_images::Model>> =
        HashMap::new();
    for image in images {
        images_by_poll.entry(image.poll_id).or_default().push(image);
    }
    let mut configs_by_poll: HashMap<Uuid, poll_configs::Model> = configs
        .into_iter()
        .map(|config| (config.poll_id, config))
        .collect();
    let users_by_id: HashMap<Uuid, users::Model> =
        users.into_iter().map(|user| (user.id, user)).collect();

    // Selections drive both a vote's chosen options and each option's tally
    let mut option_ids_by_vote: HashMap<Uuid, Vec<Uuid>> = HashMap::new();
    let mut vote_counts_by_option: HashMap<Uuid, usize> = HashMap::new();
    for selection in &selections {
        option_ids_by_vote
            .entry(selection.vote_id)
            .or_default()
            .push(selection.poll_option_id);
        *vote_counts_by_option
            .entry(selection.poll_option_id)
            .or_default() += 1;
    }

    // Shape each poll from the grouped data, preserving the input order
    let mut responses = Vec::with_capacity(polls.len());
    for poll in polls {
        let user = users_by_id.get(&poll.user_id).ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "User not found.")
        })?;
        let config = configs_by_poll.remove(&poll.id).ok_or_else(|| {
            ApiError::new(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Poll config not found.",
            )
        })?;
        let poll_votes = votes_by_poll.remove(&poll.id).unwrap_or_default();
        let poll_options = options_by_poll.remove(&poll.id).unwrap_or_default();
        let poll_images = images_by_poll.remove(&poll.id).unwrap_or_default();
        let is_proposal = poll.poll_type == PollType::Proposal;

        let shaped_votes = poll_votes
            .iter()
            .map(|vote| {
                vote_service::shape_vote(
                    vote,
                    &option_ids_by_vote,
                    &ignored_block_vote_ids,
                )
            })
            .collect::<Vec<_>>();
        let my_vote = current_user_id.and_then(|user_id| {
            poll_votes
                .iter()
                .find(|vote| vote.user_id == user_id)
                .map(|vote| {
                    vote_service::shape_vote(
                        vote,
                        &option_ids_by_vote,
                        &ignored_block_vote_ids,
                    )
                })
        });

        // Proposals carry an action and no options; polls are the reverse
        let action = is_proposal.then(|| actions.remove(&poll.id)).flatten();
        let options = if is_proposal {
            vec![]
        } else {
            poll_options
                .into_iter()
                .map(|option| PollOptionResponse {
                    id: option.id.to_string(),
                    vote_count: vote_counts_by_option
                        .get(&option.id)
                        .copied()
                        .unwrap_or(0),
                    text: option.text,
                })
                .collect()
        };
        let agreement_vote_count = if is_proposal {
            poll_votes
                .iter()
                .filter(|vote| vote.vote_type == Some(VoteType::Agree))
                .count()
        } else {
            0
        };
        let shaped_user = PollUserResponse {
            id: user.id.to_string(),
            name: user.name.clone(),
            display_name: user.display_name.clone(),
            profile_picture: profile_pictures.get(&user.id).cloned(),
        };
        let shaped_images = poll_images
            .into_iter()
            .map(|image| PollImageResponse {
                id: image.id.to_string(),
            })
            .collect();
        let member_count =
            member_counts.get(&poll.channel_id).copied().unwrap_or(0);
        let reply_users = reply_participants
            .get(&poll.id)
            .into_iter()
            .flatten()
            .filter_map(|user_id| users_by_id.get(user_id))
            .map(|user| crate::messages::types::MessageUser {
                id: user.id.to_string(),
                name: user.name.clone(),
                display_name: user.display_name.clone(),
                profile_picture: profile_pictures.get(&user.id).cloned(),
            })
            .collect();
        let reply_summary = reply_summaries.get(&poll.id);

        responses.push(PollResponse {
            id: poll.id.to_string(),
            body: decrypt_poll_body(&poll, &key_map),
            poll_type: poll.poll_type,
            stage: poll.stage.to_string(),
            closed_reason: poll.closed_reason.map(|reason| reason.to_string()),
            action,
            config: shape_poll_config(config),
            options,
            user: shaped_user,
            agreement_vote_count,
            votes: shaped_votes,
            images: shaped_images,
            my_vote,
            member_count,
            source_call_id: poll.call_id.map(|call_id| call_id.to_string()),
            source_call_status: poll
                .call_id
                .and_then(|call_id| call_statuses.get(&call_id).cloned()),
            reply_count: reply_summary
                .map(|(count, _)| *count)
                .unwrap_or_default(),
            reply_users,
            latest_reply_at: reply_summary
                .map(|(_, created_at)| serialize_timestamp(*created_at)),
            created_at: serialize_timestamp(poll.created_at),
        });
    }

    Ok(responses)
}

/// Returns the ids of block votes that no longer count, across many polls
async fn get_ignored_block_vote_ids(
    database: &DatabaseConnection,
    polls: &[polls::Model],
    configs: &[poll_configs::Model],
    votes: &[votes::Model],
) -> AppResult<HashSet<Uuid>> {
    let restricted_poll_ids: HashSet<Uuid> = configs
        .iter()
        .filter(|config| config.blocks_open_to_all == Some(false))
        .map(|config| config.poll_id)
        .collect();
    if restricted_poll_ids.is_empty() {
        return Ok(HashSet::new());
    }

    let block_votes: Vec<&votes::Model> = votes
        .iter()
        .filter(|vote| {
            vote.vote_type == Some(VoteType::Block)
                && restricted_poll_ids.contains(&vote.poll_id)
        })
        .collect();
    if block_votes.is_empty() {
        return Ok(HashSet::new());
    }

    let channel_id_by_poll: HashMap<Uuid, Uuid> = polls
        .iter()
        .map(|poll| (poll.id, poll.channel_id))
        .collect();
    let channel_ids: HashSet<Uuid> = block_votes
        .iter()
        .filter_map(|vote| channel_id_by_poll.get(&vote.poll_id).copied())
        .collect();
    let server_id_by_channel: HashMap<Uuid, Uuid> =
        channel_entities::Entity::find()
            .filter(channel_entities::Column::Id.is_in(channel_ids))
            .all(database)
            .await
            .map_err(internal_error)?
            .into_iter()
            .map(|channel| (channel.id, channel.server_id))
            .collect();

    let server_id_by_poll: HashMap<Uuid, Uuid> = polls
        .iter()
        .filter_map(|poll| {
            server_id_by_channel
                .get(&poll.channel_id)
                .map(|server_id| (poll.id, *server_id))
        })
        .collect();

    let mut block_voters_by_server: HashMap<Uuid, HashSet<Uuid>> =
        HashMap::new();
    for vote in &block_votes {
        let Some(server_id) = server_id_by_poll.get(&vote.poll_id) else {
            continue;
        };
        block_voters_by_server
            .entry(*server_id)
            .or_default()
            .insert(vote.user_id);
    }

    let mut eligible_by_server: HashMap<Uuid, HashSet<Uuid>> = HashMap::new();
    for (server_id, block_voters) in &block_voters_by_server {
        let eligible = authz::filter_users_who_can(
            database,
            block_voters,
            "create",
            PROPOSAL_BLOCK_SUBJECT,
            *server_id,
        )
        .await?;
        eligible_by_server.insert(*server_id, eligible);
    }

    Ok(block_votes
        .into_iter()
        .filter(|vote| {
            server_id_by_poll
                .get(&vote.poll_id)
                .and_then(|server_id| eligible_by_server.get(server_id))
                .is_none_or(|eligible| !eligible.contains(&vote.user_id))
        })
        .map(|vote| vote.id)
        .collect())
}

async fn get_channel_member_counts(
    database: &DatabaseConnection,
    channel_ids: impl Iterator<Item = Uuid>,
) -> AppResult<HashMap<Uuid, usize>> {
    let channel_ids: HashSet<Uuid> = channel_ids.collect();
    if channel_ids.is_empty() {
        return Ok(HashMap::new());
    }

    let counts = channel_members::Entity::find()
        .filter(channel_members::Column::ChannelId.is_in(channel_ids))
        .select_only()
        .column(channel_members::Column::ChannelId)
        .column_as(channel_members::Column::Id.count(), "member_count")
        .group_by(channel_members::Column::ChannelId)
        .into_tuple::<(Uuid, i64)>()
        .all(database)
        .await
        .map_err(internal_error)?;

    Ok(counts
        .into_iter()
        .map(|(channel_id, count)| (channel_id, count as usize))
        .collect())
}

fn shape_poll_config(config: poll_configs::Model) -> PollConfigResponse {
    PollConfigResponse {
        decision_making_model: config
            .decision_making_model
            .map(|value| value.to_string()),
        agreement_threshold: config.agreement_threshold,
        quorum_enabled: config.quorum_enabled,
        quorum_threshold: config.quorum_threshold,
        disagreements_limit: config.disagreements_limit,
        abstains_limit: config.abstains_limit,
        blocks_open_to_all: config.blocks_open_to_all,
        closing_at: config.closing_at.map(serialize_timestamp),
        multiple_choice: config.multiple_choice,
    }
}

fn decrypt_poll_body(
    poll: &polls::Model,
    key_map: &HashMap<Uuid, Vec<u8>>,
) -> Option<String> {
    let (Some(ciphertext), Some(iv), Some(tag), Some(key_id)) = (
        poll.ciphertext.as_ref(),
        poll.iv.as_ref(),
        poll.tag.as_ref(),
        poll.key_id,
    ) else {
        return None;
    };
    key_map
        .get(&key_id)
        .and_then(|key| encryption::decrypt_text(ciphertext, iv, tag, key).ok())
}

pub(super) async fn broadcast_stored_poll_update(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    poll: &polls::Model,
    sender_id: Option<Uuid>,
) -> AppResult<()> {
    let channel = channel_entities::Entity::find_by_id(poll.channel_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Channel not found.")
        })?;

    broadcast_poll_update(
        database,
        pub_sub_service,
        channel.server_id,
        poll.channel_id,
        sender_id,
        poll.id,
    )
    .await
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("poll request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
