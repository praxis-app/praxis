use entity::enums::EventAttendeeStatus;
use sea_orm::prelude::{DateTimeWithTimeZone, Uuid};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct EventPath {
    pub(super) server_id: Uuid,
    pub(super) event_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct EventCoverPhotoPath {
    pub(super) server_id: Uuid,
    pub(super) event_id: Uuid,
    pub(super) image_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct ListEventsQuery {
    pub(super) from: DateTimeWithTimeZone,
    pub(super) to: DateTimeWithTimeZone,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct UpsertEventRsvpRequest {
    pub(super) status: EventAttendeeStatus,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct EventUserResponse {
    pub(super) id: String,
    pub(super) name: String,
    pub(super) display_name: Option<String>,
    pub(super) profile_picture: Option<crate::users::UserImageRef>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct EventResponse {
    pub(super) id: String,
    pub(super) name: String,
    pub(super) description: String,
    pub(super) starts_at: String,
    pub(super) ends_at: Option<String>,
    pub(super) online: bool,
    pub(super) location: Option<String>,
    pub(super) external_link: Option<String>,
    pub(super) cover_photo: Option<EventCoverPhotoResponse>,
    pub(super) hosts: Vec<EventUserResponse>,
    pub(super) going_count: usize,
    pub(super) interested_count: usize,
    pub(super) current_user_status: Option<EventAttendeeStatus>,
    pub(super) source_poll_action_id: Option<String>,
    pub(super) created_at: String,
    pub(super) updated_at: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct EventCoverPhotoResponse {
    pub(super) id: String,
    pub(super) created_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct EventDetailResponse {
    #[serde(flatten)]
    pub(super) event: EventResponse,
    pub(super) going: Vec<EventUserResponse>,
    pub(super) interested: Vec<EventUserResponse>,
}

#[derive(Debug, Serialize)]
pub(super) struct EventsResponse {
    pub(super) events: Vec<EventResponse>,
}

#[derive(Debug, Serialize)]
pub(super) struct EventPayload {
    pub(super) event: EventDetailResponse,
}

pub(super) struct StoredEventCoverPhoto {
    pub(super) bytes: Vec<u8>,
}
