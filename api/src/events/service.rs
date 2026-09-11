use axum::http::StatusCode;
use chrono::{Duration, Utc};
use entity::{
    enums::EventAttendeeStatus, event_attendees, event_cover_photos, events,
    users,
};
use sea_orm::{
    prelude::Uuid, sea_query::LockType, ActiveModelTrait, ColumnTrait,
    Condition, ConnectionTrait, DatabaseConnection, EntityTrait,
    IntoActiveModel, ModelTrait, QueryFilter, QueryOrder, QuerySelect, Set,
    TransactionTrait,
};
use std::{
    collections::{HashMap, HashSet},
    path::Path,
};
use uuid::Uuid as NativeUuid;

use super::types::{
    EventCoverPhotoResponse, EventDetailResponse, EventResponse,
    EventUserResponse, EventsResponse, ListEventsQuery, StoredEventCoverPhoto,
};
use crate::{
    common::{ApiError, AppResult},
    messages::types::serialize_timestamp,
    servers, users as users_service,
};

const MAX_EVENT_RANGE_DAYS: i64 = 366;

pub(super) async fn list_events(
    database: &DatabaseConnection,
    server_id: Uuid,
    user_id: Option<Uuid>,
    invite_token: Option<&str>,
    query: ListEventsQuery,
) -> AppResult<EventsResponse> {
    servers::is_server_audience(database, server_id, user_id, invite_token)
        .await?;
    validate_date_range(query.from, query.to)?;

    let event_query = events::Entity::find()
        .filter(events::Column::ServerId.eq(server_id))
        .filter(events::Column::StartsAt.lt(query.to))
        .filter(
            Condition::any()
                .add(events::Column::EndsAt.gt(query.from))
                .add(
                    Condition::all()
                        .add(events::Column::EndsAt.is_null())
                        .add(events::Column::StartsAt.gte(query.from)),
                ),
        )
        .order_by_asc(events::Column::StartsAt)
        .order_by_asc(events::Column::Id);

    let events = event_query.all(database).await.map_err(internal_error)?;
    let context = load_attendee_context(database, &events).await?;
    let events = events
        .into_iter()
        .map(|event| shape_event(event, user_id, &context))
        .collect();

    Ok(EventsResponse { events })
}

pub(super) async fn get_event(
    database: &DatabaseConnection,
    server_id: Uuid,
    event_id: Uuid,
    user_id: Option<Uuid>,
    invite_token: Option<&str>,
) -> AppResult<EventDetailResponse> {
    servers::is_server_audience(database, server_id, user_id, invite_token)
        .await?;
    let event = load_event(database, server_id, event_id).await?;
    shape_event_detail(database, event, user_id).await
}

pub(super) async fn upsert_rsvp(
    database: &DatabaseConnection,
    server_id: Uuid,
    event_id: Uuid,
    user_id: Uuid,
    status: EventAttendeeStatus,
) -> AppResult<EventDetailResponse> {
    ensure_server_member(database, server_id, user_id).await?;
    if status == EventAttendeeStatus::Host {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "RSVP status must be interested or going.",
        ));
    }

    let transaction = database.begin().await.map_err(internal_error)?;
    let event =
        load_event_for_update(&transaction, server_id, event_id).await?;
    let existing = event_attendees::Entity::find()
        .filter(event_attendees::Column::EventId.eq(event_id))
        .filter(event_attendees::Column::UserId.eq(user_id))
        .one(&transaction)
        .await
        .map_err(internal_error)?;

    if let Some(attendee) = existing {
        ensure_not_host(&attendee)?;
        let mut active = attendee.into_active_model();
        active.status = Set(status);
        active.updated_at = Set(Utc::now().fixed_offset());
        active.update(&transaction).await.map_err(internal_error)?;
    } else {
        event_attendees::ActiveModel {
            id: Set(NativeUuid::new_v4()),
            event_id: Set(event_id),
            user_id: Set(user_id),
            status: Set(status),
            ..Default::default()
        }
        .insert(&transaction)
        .await
        .map_err(internal_error)?;
    }

    transaction.commit().await.map_err(internal_error)?;
    shape_event_detail(database, event, Some(user_id)).await
}

pub(super) async fn clear_rsvp(
    database: &DatabaseConnection,
    server_id: Uuid,
    event_id: Uuid,
    user_id: Uuid,
) -> AppResult<EventDetailResponse> {
    ensure_server_member(database, server_id, user_id).await?;
    let transaction = database.begin().await.map_err(internal_error)?;
    let event =
        load_event_for_update(&transaction, server_id, event_id).await?;
    let existing = event_attendees::Entity::find()
        .filter(event_attendees::Column::EventId.eq(event_id))
        .filter(event_attendees::Column::UserId.eq(user_id))
        .one(&transaction)
        .await
        .map_err(internal_error)?;

    if let Some(attendee) = existing {
        ensure_not_host(&attendee)?;
        attendee
            .delete(&transaction)
            .await
            .map_err(internal_error)?;
    }

    transaction.commit().await.map_err(internal_error)?;
    shape_event_detail(database, event, Some(user_id)).await
}

pub(super) async fn get_event_cover_photo(
    database: &DatabaseConnection,
    upload_root: &Path,
    server_id: Uuid,
    event_id: Uuid,
    image_id: Uuid,
    user_id: Option<Uuid>,
    invite_token: Option<&str>,
) -> AppResult<StoredEventCoverPhoto> {
    servers::is_server_audience(database, server_id, user_id, invite_token)
        .await?;
    load_event(database, server_id, event_id).await?;
    let image = event_cover_photos::Entity::find_by_id(image_id)
        .filter(event_cover_photos::Column::EventId.eq(event_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "Image not found.")
        })?;
    let bytes = tokio::fs::read(upload_root.join(image.storage_key))
        .await
        .map_err(|_| {
            ApiError::new(StatusCode::NOT_FOUND, "Image file not found.")
        })?;
    Ok(StoredEventCoverPhoto { bytes })
}

async fn ensure_server_member(
    database: &DatabaseConnection,
    server_id: Uuid,
    user_id: Uuid,
) -> AppResult<()> {
    servers::ensure_server(database, server_id).await?;

    if servers::is_server_member(database, server_id, user_id).await? {
        Ok(())
    } else {
        Err(ApiError::new(StatusCode::FORBIDDEN, "Forbidden."))
    }
}

fn validate_date_range(
    from: chrono::DateTime<chrono::FixedOffset>,
    to: chrono::DateTime<chrono::FixedOffset>,
) -> AppResult<()> {
    if to <= from {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Event range end must be after its start.",
        ));
    }
    if to - from > Duration::days(MAX_EVENT_RANGE_DAYS) {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Event ranges cannot exceed 366 days.",
        ));
    }
    Ok(())
}

async fn load_event<C: ConnectionTrait>(
    database: &C,
    server_id: Uuid,
    event_id: Uuid,
) -> AppResult<events::Model> {
    events::Entity::find_by_id(event_id)
        .filter(events::Column::ServerId.eq(server_id))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| ApiError::new(StatusCode::NOT_FOUND, "Event not found."))
}

async fn load_event_for_update<C: ConnectionTrait>(
    database: &C,
    server_id: Uuid,
    event_id: Uuid,
) -> AppResult<events::Model> {
    events::Entity::find_by_id(event_id)
        .filter(events::Column::ServerId.eq(server_id))
        .lock(LockType::Update)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| ApiError::new(StatusCode::NOT_FOUND, "Event not found."))
}

fn ensure_not_host(attendee: &event_attendees::Model) -> AppResult<()> {
    if attendee.status == EventAttendeeStatus::Host {
        Err(ApiError::new(
            StatusCode::CONFLICT,
            "Event hosts cannot change or clear their RSVP.",
        ))
    } else {
        Ok(())
    }
}

async fn shape_event_detail(
    database: &DatabaseConnection,
    event: events::Model,
    user_id: Option<Uuid>,
) -> AppResult<EventDetailResponse> {
    let context =
        load_attendee_context(database, std::slice::from_ref(&event)).await?;
    let attendees = context
        .attendees_by_event
        .get(&event.id)
        .map(Vec::as_slice)
        .unwrap_or(&[]);
    let going = attendees
        .iter()
        .filter(|attendee| {
            matches!(
                attendee.status,
                EventAttendeeStatus::Host | EventAttendeeStatus::Going
            )
        })
        .filter_map(|attendee| context.users.get(&attendee.user_id))
        .map(|user| event_user_response(user, &context))
        .collect();
    let interested =
        attendee_users(attendees, EventAttendeeStatus::Interested, &context);

    Ok(EventDetailResponse {
        event: shape_event(event, user_id, &context),
        going,
        interested,
    })
}

struct AttendeeContext {
    attendees_by_event: HashMap<Uuid, Vec<event_attendees::Model>>,
    users: HashMap<Uuid, users::Model>,
    profile_pictures:
        std::collections::BTreeMap<Uuid, users_service::UserImageRef>,
    cover_photos: HashMap<Uuid, event_cover_photos::Model>,
}

async fn load_attendee_context(
    database: &DatabaseConnection,
    events: &[events::Model],
) -> AppResult<AttendeeContext> {
    let event_ids: Vec<Uuid> = events.iter().map(|event| event.id).collect();
    if event_ids.is_empty() {
        return Ok(AttendeeContext {
            attendees_by_event: HashMap::new(),
            users: HashMap::new(),
            profile_pictures: std::collections::BTreeMap::new(),
            cover_photos: HashMap::new(),
        });
    }

    let attendees = event_attendees::Entity::find()
        .filter(
            event_attendees::Column::EventId.is_in(event_ids.iter().copied()),
        )
        .order_by_asc(event_attendees::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;
    let user_ids: Vec<Uuid> = attendees
        .iter()
        .map(|attendee| attendee.user_id)
        .collect::<HashSet<_>>()
        .into_iter()
        .collect();
    let users = if user_ids.is_empty() {
        vec![]
    } else {
        users::Entity::find()
            .filter(users::Column::Id.is_in(user_ids.iter().copied()))
            .all(database)
            .await
            .map_err(internal_error)?
    };
    let profile_pictures =
        users_service::get_user_profile_pictures_map(database, &user_ids)
            .await?;
    let cover_photos = event_cover_photos::Entity::find()
        .filter(event_cover_photos::Column::EventId.is_in(event_ids))
        .all(database)
        .await
        .map_err(internal_error)?;

    let mut attendees_by_event: HashMap<Uuid, Vec<event_attendees::Model>> =
        HashMap::new();
    for attendee in attendees {
        attendees_by_event
            .entry(attendee.event_id)
            .or_default()
            .push(attendee);
    }

    Ok(AttendeeContext {
        attendees_by_event,
        users: users.into_iter().map(|user| (user.id, user)).collect(),
        profile_pictures,
        cover_photos: cover_photos
            .into_iter()
            .map(|image| (image.event_id, image))
            .collect(),
    })
}

fn shape_event(
    event: events::Model,
    current_user_id: Option<Uuid>,
    context: &AttendeeContext,
) -> EventResponse {
    let attendees = context
        .attendees_by_event
        .get(&event.id)
        .map(Vec::as_slice)
        .unwrap_or(&[]);
    let hosts = attendee_users(attendees, EventAttendeeStatus::Host, context);
    let going_count = attendees
        .iter()
        .filter(|attendee| {
            matches!(
                attendee.status,
                EventAttendeeStatus::Host | EventAttendeeStatus::Going
            )
        })
        .count();
    let interested_count = attendees
        .iter()
        .filter(|attendee| attendee.status == EventAttendeeStatus::Interested)
        .count();
    let current_user_status = attendees
        .iter()
        .find(|attendee| Some(attendee.user_id) == current_user_id)
        .map(|attendee| attendee.status);

    EventResponse {
        id: event.id.to_string(),
        name: event.name,
        description: event.description,
        starts_at: serialize_timestamp(event.starts_at),
        ends_at: event.ends_at.map(serialize_timestamp),
        online: event.online,
        location: event.location,
        external_link: event.external_link,
        cover_photo: context.cover_photos.get(&event.id).map(|image| {
            EventCoverPhotoResponse {
                id: image.id.to_string(),
                created_at: serialize_timestamp(image.created_at),
            }
        }),
        hosts,
        going_count,
        interested_count,
        current_user_status,
        source_poll_action_id: event
            .source_poll_action_id
            .map(|id| id.to_string()),
        created_at: serialize_timestamp(event.created_at),
        updated_at: serialize_timestamp(event.updated_at),
    }
}

fn attendee_users(
    attendees: &[event_attendees::Model],
    status: EventAttendeeStatus,
    context: &AttendeeContext,
) -> Vec<EventUserResponse> {
    attendees
        .iter()
        .filter(|attendee| attendee.status == status)
        .filter_map(|attendee| context.users.get(&attendee.user_id))
        .map(|user| event_user_response(user, context))
        .collect()
}

fn event_user_response(
    user: &users::Model,
    context: &AttendeeContext,
) -> EventUserResponse {
    EventUserResponse {
        id: user.id.to_string(),
        name: user.name.clone(),
        display_name: user.display_name.clone(),
        profile_picture: context.profile_pictures.get(&user.id).cloned(),
    }
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("event request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
