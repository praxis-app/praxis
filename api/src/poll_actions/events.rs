//! Owns plan-event action validation, persistence, lifecycle checks,
//! implementation, cover photos, and response shaping

use axum::http::StatusCode;
use chrono::{DateTime, FixedOffset, Utc};
use entity::{
    channels,
    enums::{
        EventAttendeeStatus, NotificationKind, PollActionType, PollClosedReason,
    },
    event_attendees, event_cover_photos, events, notifications,
    poll_action_event_cover_photos, poll_action_event_hosts,
    poll_action_events, poll_actions, polls, server_members, users,
};
use sea_orm::{
    prelude::Uuid, ActiveModelTrait, ColumnTrait, ConnectionTrait,
    DatabaseConnection, DatabaseTransaction, EntityTrait, IntoActiveModel,
    PaginatorTrait, QueryFilter, QueryOrder, Set,
};
use std::{
    collections::{HashMap, HashSet},
    path::{Path, PathBuf},
};
use uuid::Uuid as NativeUuid;

use super::types::{
    CreatePollActionEventRequest, PollActionEventCoverPhotoResponse,
    PollActionEventResponse, PollActionUserResponse,
};
use crate::{
    channels as channels_service,
    common::{text::sanitize_text, ApiError, AppResult},
    users as users_service,
};

pub(super) fn validate_plan_event_request(
    request: &CreatePollActionEventRequest,
) -> AppResult<()> {
    let name = sanitize_text(&request.name);
    if name.is_empty() {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Event name is required.",
        ));
    }
    if name.chars().count() > 255 {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Event names must be 255 characters or less.",
        ));
    }
    if sanitize_text(&request.description).is_empty() {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Event description is required.",
        ));
    }
    if request.starts_at <= Utc::now().fixed_offset() {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Event start time must be in the future.",
        ));
    }
    if request
        .ends_at
        .is_some_and(|ends_at| ends_at <= request.starts_at)
    {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Event end time must be after its start time.",
        ));
    }
    if !request.online
        && request
            .location
            .as_deref()
            .map(sanitize_text)
            .map(|location| location.is_empty())
            .unwrap_or(true)
    {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "In-person events require a location.",
        ));
    }
    if request
        .location
        .as_deref()
        .is_some_and(|location| sanitize_text(location).chars().count() > 255)
    {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Event locations must be 255 characters or less.",
        ));
    }
    if let Some(link) = request
        .external_link
        .as_deref()
        .map(str::trim)
        .filter(|link| !link.is_empty())
    {
        validate_external_link(link)?;
    }
    parse_event_host_ids(&request.host_ids)?;
    Ok(())
}

pub(super) async fn create_poll_action_event<C: ConnectionTrait>(
    database: &C,
    poll_action_id: Uuid,
    server_id: Uuid,
    request: CreatePollActionEventRequest,
) -> AppResult<()> {
    validate_plan_event_request(&request)?;
    let host_ids = parse_event_host_ids(&request.host_ids)?;
    let memberships = server_members::Entity::find()
        .filter(server_members::Column::ServerId.eq(server_id))
        .filter(server_members::Column::UserId.is_in(host_ids.iter().copied()))
        .all(database)
        .await
        .map_err(internal_error)?;
    let member_ids: HashSet<Uuid> = memberships
        .into_iter()
        .map(|membership| membership.user_id)
        .collect();
    if host_ids.iter().any(|host_id| !member_ids.contains(host_id)) {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Event hosts must be members of the proposal's server.",
        ));
    }

    let proposed_event = poll_action_events::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        poll_action_id: Set(poll_action_id),
        name: Set(sanitize_text(&request.name)),
        description: Set(sanitize_text(&request.description)),
        starts_at: Set(request.starts_at),
        ends_at: Set(request.ends_at),
        online: Set(request.online),
        location: Set(request
            .location
            .map(|location| sanitize_text(&location))
            .filter(|location| !location.is_empty())),
        external_link: Set(request
            .external_link
            .map(|link| link.trim().to_owned())
            .filter(|link| !link.is_empty())),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)?;

    for host_id in host_ids {
        poll_action_event_hosts::ActiveModel {
            id: Set(NativeUuid::new_v4()),
            poll_action_event_id: Set(proposed_event.id),
            user_id: Set(host_id),
            ..Default::default()
        }
        .insert(database)
        .await
        .map_err(internal_error)?;
    }

    Ok(())
}

pub(crate) async fn attach_event_cover_photo<C: ConnectionTrait>(
    database: &C,
    upload_root: &Path,
    poll_id: Uuid,
    bytes: Vec<u8>,
) -> AppResult<PathBuf> {
    let bytes =
        crate::common::images::normalize_upload(bytes, "Event cover photo")
            .await?;
    let action = poll_actions::Entity::find()
        .filter(poll_actions::Column::PollId.eq(poll_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "An event cover photo requires an event proposal.",
            )
        })?;
    let event = poll_action_events::Entity::find()
        .filter(poll_action_events::Column::PollActionId.eq(action.id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "An event cover photo requires an event proposal.",
            )
        })?;
    let image_id = NativeUuid::new_v4();
    let storage_key = format!("poll-action-event-cover-photos/{image_id}");
    let destination = upload_root.join(&storage_key);
    if let Some(parent) = destination.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(internal_error)?;
    }
    if let Err(error) = tokio::fs::write(&destination, bytes).await {
        let _ = tokio::fs::remove_file(&destination).await;
        return Err(internal_error(error));
    }

    let insert_result = poll_action_event_cover_photos::ActiveModel {
        id: Set(image_id),
        poll_action_event_id: Set(event.id),
        storage_key: Set(Some(storage_key)),
        ..Default::default()
    }
    .insert(database)
    .await;
    if let Err(error) = insert_result {
        if let Err(cleanup_error) = tokio::fs::remove_file(&destination).await {
            tracing::warn!(
                "failed to clean up event cover photo after database error: {cleanup_error}"
            );
        }
        return Err(internal_error(error));
    }
    Ok(destination)
}

pub(crate) async fn get_proposed_event_cover_photo<C: ConnectionTrait>(
    database: &C,
    poll_id: Uuid,
    image_id: Uuid,
) -> AppResult<poll_action_event_cover_photos::Model> {
    let image = poll_action_event_cover_photos::Entity::find_by_id(image_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Image not found.")
        })?;
    let proposed_event =
        poll_action_events::Entity::find_by_id(image.poll_action_event_id)
            .one(database)
            .await
            .map_err(internal_error)?;
    let belongs_to_poll = match proposed_event {
        Some(proposed_event) => {
            poll_actions::Entity::find_by_id(proposed_event.poll_action_id)
                .filter(poll_actions::Column::PollId.eq(poll_id))
                .one(database)
                .await
                .map_err(internal_error)?
                .is_some()
        }
        None => false,
    };
    if belongs_to_poll {
        Ok(image)
    } else {
        Err(ApiError::new(StatusCode::NOT_FOUND, "Image not found."))
    }
}

pub(crate) async fn event_cover_photo_storage_key<C: ConnectionTrait>(
    database: &C,
    poll_id: Uuid,
) -> AppResult<Option<String>> {
    let action = poll_actions::Entity::find()
        .filter(poll_actions::Column::PollId.eq(poll_id))
        .one(database)
        .await
        .map_err(internal_error)?;
    let Some(action) = action else {
        return Ok(None);
    };
    let proposed_event = poll_action_events::Entity::find()
        .filter(poll_action_events::Column::PollActionId.eq(action.id))
        .one(database)
        .await
        .map_err(internal_error)?;
    let Some(proposed_event) = proposed_event else {
        return Ok(None);
    };
    let cover_photo = poll_action_event_cover_photos::Entity::find()
        .filter(
            poll_action_event_cover_photos::Column::PollActionEventId
                .eq(proposed_event.id),
        )
        .one(database)
        .await
        .map_err(internal_error)?;
    Ok(cover_photo.and_then(|cover_photo| cover_photo.storage_key))
}

pub(crate) async fn plan_event_closed_reason<C: ConnectionTrait>(
    database: &C,
    poll_id: Uuid,
    now: DateTime<FixedOffset>,
) -> AppResult<Option<PollClosedReason>> {
    let action = poll_actions::Entity::find()
        .filter(poll_actions::Column::PollId.eq(poll_id))
        .one(database)
        .await
        .map_err(internal_error)?;

    let Some(action) = action else {
        return Ok(None);
    };
    if action.action_type != PollActionType::PlanEvent {
        return Ok(None);
    }

    let proposed_event = poll_action_events::Entity::find()
        .filter(poll_action_events::Column::PollActionId.eq(action.id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "Proposed event is required.",
            )
        })?;
    if proposed_event.starts_at <= now {
        return Ok(Some(PollClosedReason::EventStartElapsed));
    }

    let poll = polls::Entity::find_by_id(poll_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Poll not found.")
        })?;
    let channel = channels::Entity::find_by_id(poll.channel_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Channel not found.")
        })?;
    let host_ids = poll_action_event_hosts::Entity::find()
        .filter(
            poll_action_event_hosts::Column::PollActionEventId
                .eq(proposed_event.id),
        )
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .map(|host| host.user_id)
        .collect::<Vec<_>>();
    let member_count = server_members::Entity::find()
        .filter(server_members::Column::ServerId.eq(channel.server_id))
        .filter(server_members::Column::UserId.is_in(host_ids.iter().copied()))
        .count(database)
        .await
        .map_err(internal_error)?;

    Ok((member_count < host_ids.len() as u64)
        .then_some(PollClosedReason::EventHostIneligible))
}

fn parse_event_host_ids(values: &[String]) -> AppResult<Vec<Uuid>> {
    if values.is_empty() {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Events require at least one host.",
        ));
    }

    let mut unique = HashSet::with_capacity(values.len());
    let mut host_ids = Vec::with_capacity(values.len());
    for value in values {
        let host_id = value.parse::<Uuid>().map_err(|_| {
            ApiError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "Event host IDs must be UUIDs.",
            )
        })?;
        if !unique.insert(host_id) {
            return Err(ApiError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "Event hosts must be distinct.",
            ));
        }
        host_ids.push(host_id);
    }
    Ok(host_ids)
}

fn validate_external_link(value: &str) -> AppResult<()> {
    let uri = value.parse::<axum::http::Uri>().map_err(|_| {
        ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Event external links must be valid HTTP(S) URLs.",
        )
    })?;
    if !matches!(uri.scheme_str(), Some("http" | "https"))
        || uri.authority().is_none()
    {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Event external links must be valid HTTP(S) URLs.",
        ));
    }
    Ok(())
}

pub(super) async fn implement_plan_event(
    database: &DatabaseTransaction,
    poll_id: Uuid,
    poll_action_id: Uuid,
) -> AppResult<Vec<notifications::Model>> {
    let proposed = poll_action_events::Entity::find()
        .filter(poll_action_events::Column::PollActionId.eq(poll_action_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "Proposed event is required.",
            )
        })?;
    let poll = polls::Entity::find_by_id(poll_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Poll not found.")
        })?;
    let channel = channels::Entity::find_by_id(poll.channel_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Channel not found.")
        })?;

    let existing_event = events::Entity::find()
        .filter(events::Column::SourcePollActionId.eq(poll_action_id))
        .one(database)
        .await
        .map_err(internal_error)?;
    let is_new_event = existing_event.is_none();
    let event = match existing_event {
        Some(event) => event,
        None => events::ActiveModel {
            id: Set(NativeUuid::new_v4()),
            server_id: Set(channel.server_id),
            source_poll_action_id: Set(Some(poll_action_id)),
            name: Set(proposed.name),
            description: Set(proposed.description),
            starts_at: Set(proposed.starts_at),
            ends_at: Set(proposed.ends_at),
            online: Set(proposed.online),
            location: Set(proposed.location),
            external_link: Set(proposed.external_link),
            ..Default::default()
        }
        .insert(database)
        .await
        .map_err(internal_error)?,
    };

    let hosts = poll_action_event_hosts::Entity::find()
        .filter(
            poll_action_event_hosts::Column::PollActionEventId.eq(proposed.id),
        )
        .all(database)
        .await
        .map_err(internal_error)?;
    let host_ids: Vec<Uuid> = hosts.iter().map(|host| host.user_id).collect();
    for host in hosts {
        let existing = event_attendees::Entity::find()
            .filter(event_attendees::Column::EventId.eq(event.id))
            .filter(event_attendees::Column::UserId.eq(host.user_id))
            .one(database)
            .await
            .map_err(internal_error)?;
        if let Some(attendee) = existing {
            if attendee.status != EventAttendeeStatus::Host {
                let mut active = attendee.into_active_model();
                active.status = Set(EventAttendeeStatus::Host);
                active.updated_at = Set(Utc::now().fixed_offset());
                active.update(database).await.map_err(internal_error)?;
            }
        } else {
            event_attendees::ActiveModel {
                id: Set(NativeUuid::new_v4()),
                event_id: Set(event.id),
                user_id: Set(host.user_id),
                status: Set(EventAttendeeStatus::Host),
                ..Default::default()
            }
            .insert(database)
            .await
            .map_err(internal_error)?;
        }
    }

    sync_event_cover_photo(database, proposed.id).await?;

    if !is_new_event {
        return Ok(Vec::new());
    }
    notify_event_created(
        database,
        channel.server_id,
        poll.channel_id,
        event.id,
        host_ids,
    )
    .await
}

/// Reaches the hosts it names and everyone in the channel that decided it
async fn notify_event_created(
    database: &DatabaseTransaction,
    server_id: Uuid,
    channel_id: Uuid,
    event_id: Uuid,
    host_ids: Vec<Uuid>,
) -> AppResult<Vec<notifications::Model>> {
    let mut recipient_ids =
        channels_service::get_channel_member_user_ids(database, channel_id)
            .await?;
    recipient_ids.extend(host_ids);

    crate::notifications::create_notifications(
        database,
        crate::notifications::CreateNotificationsRequest {
            kind: NotificationKind::EventCreated,
            server_id,
            // An event belongs to the server, not the channel that decided it
            channel_id: None,
            actor_user_id: None,
            target: crate::notifications::NotificationTarget::Event(event_id),
            vote_type: None,
            recipient_ids,
        },
    )
    .await
}

async fn sync_event_cover_photo<C: ConnectionTrait>(
    database: &C,
    poll_action_event_id: Uuid,
) -> AppResult<()> {
    let proposed = poll_action_events::Entity::find_by_id(poll_action_event_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Proposed event not found.")
        })?;
    let Some(event) = events::Entity::find()
        .filter(events::Column::SourcePollActionId.eq(proposed.poll_action_id))
        .one(database)
        .await
        .map_err(internal_error)?
    else {
        return Ok(());
    };
    let existing_cover = event_cover_photos::Entity::find()
        .filter(event_cover_photos::Column::EventId.eq(event.id))
        .one(database)
        .await
        .map_err(internal_error)?;
    if existing_cover.is_none() {
        let proposed_cover = poll_action_event_cover_photos::Entity::find()
            .filter(
                poll_action_event_cover_photos::Column::PollActionEventId
                    .eq(poll_action_event_id),
            )
            .one(database)
            .await
            .map_err(internal_error)?;
        if let Some(proposed_cover) = proposed_cover {
            if let Some(source_storage_key) = proposed_cover.storage_key {
                let cover_photo_id = NativeUuid::new_v4();
                let storage_key =
                    format!("event-cover-photos/{cover_photo_id}");
                let upload_root = crate::common::storage::upload_root();
                let destination = upload_root.join(&storage_key);
                if let Some(parent) = destination.parent() {
                    tokio::fs::create_dir_all(parent)
                        .await
                        .map_err(internal_error)?;
                }
                tokio::fs::copy(
                    upload_root.join(source_storage_key),
                    &destination,
                )
                .await
                .map_err(internal_error)?;
                event_cover_photos::ActiveModel {
                    id: Set(cover_photo_id),
                    event_id: Set(event.id),
                    storage_key: Set(storage_key),
                    ..Default::default()
                }
                .insert(database)
                .await
                .map_err(internal_error)?;
            }
        }
    }

    Ok(())
}

pub(super) async fn shape_poll_action_events(
    database: &DatabaseConnection,
    poll_action_ids: &[Uuid],
) -> AppResult<HashMap<Uuid, PollActionEventResponse>> {
    if poll_action_ids.is_empty() {
        return Ok(HashMap::new());
    }
    let proposed_events = poll_action_events::Entity::find()
        .filter(
            poll_action_events::Column::PollActionId
                .is_in(poll_action_ids.iter().copied()),
        )
        .all(database)
        .await
        .map_err(internal_error)?;
    if proposed_events.is_empty() {
        return Ok(HashMap::new());
    }

    let event_ids: Vec<Uuid> =
        proposed_events.iter().map(|event| event.id).collect();
    let hosts = poll_action_event_hosts::Entity::find()
        .filter(
            poll_action_event_hosts::Column::PollActionEventId
                .is_in(event_ids.clone()),
        )
        .order_by_asc(poll_action_event_hosts::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;
    let host_ids: Vec<Uuid> = hosts.iter().map(|host| host.user_id).collect();
    let users_by_id: HashMap<Uuid, users::Model> = users::Entity::find()
        .filter(users::Column::Id.is_in(host_ids.iter().copied()))
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .map(|user| (user.id, user))
        .collect();
    let profile_pictures =
        users_service::get_user_profile_pictures_map(database, &host_ids)
            .await?;
    let created_event_ids: HashMap<Uuid, String> = events::Entity::find()
        .filter(
            events::Column::SourcePollActionId
                .is_in(poll_action_ids.iter().copied()),
        )
        .all(database)
        .await
        .map_err(internal_error)?
        .into_iter()
        .filter_map(|event| {
            event
                .source_poll_action_id
                .map(|action_id| (action_id, event.id.to_string()))
        })
        .collect();
    let mut cover_photos: HashMap<Uuid, PollActionEventCoverPhotoResponse> =
        poll_action_event_cover_photos::Entity::find()
            .filter(
                poll_action_event_cover_photos::Column::PollActionEventId
                    .is_in(event_ids),
            )
            .filter(
                poll_action_event_cover_photos::Column::StorageKey
                    .is_not_null(),
            )
            .all(database)
            .await
            .map_err(internal_error)?
            .into_iter()
            .map(|image| {
                (
                    image.poll_action_event_id,
                    PollActionEventCoverPhotoResponse {
                        id: image.id.to_string(),
                        created_at: crate::messages::types::serialize_timestamp(
                            image.created_at,
                        ),
                    },
                )
            })
            .collect();

    let mut hosts_by_event: HashMap<Uuid, Vec<PollActionUserResponse>> =
        HashMap::new();
    for host in hosts {
        let Some(user) = users_by_id.get(&host.user_id) else {
            continue;
        };
        hosts_by_event
            .entry(host.poll_action_event_id)
            .or_default()
            .push(PollActionUserResponse {
                id: user.id.to_string(),
                name: user.name.clone(),
                display_name: user.display_name.clone(),
                profile_picture: profile_pictures.get(&user.id).cloned(),
            });
    }

    Ok(proposed_events
        .into_iter()
        .map(|proposed| {
            let poll_action_id = proposed.poll_action_id;
            let response = PollActionEventResponse {
                hosts: hosts_by_event.remove(&proposed.id).unwrap_or_default(),
                cover_photo: cover_photos.remove(&proposed.id),
                created_event_id: created_event_ids
                    .get(&poll_action_id)
                    .cloned(),
                id: proposed.id.to_string(),
                name: proposed.name,
                description: proposed.description,
                starts_at: crate::messages::types::serialize_timestamp(
                    proposed.starts_at,
                ),
                ends_at: proposed
                    .ends_at
                    .map(crate::messages::types::serialize_timestamp),
                online: proposed.online,
                location: proposed.location,
                external_link: proposed.external_link,
            };
            (poll_action_id, response)
        })
        .collect())
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("poll action event request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
