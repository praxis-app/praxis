use entity::enums::{ChannelType, PollType};
use sea_orm::prelude::{DateTimeWithTimeZone, Uuid};
use serde::{Deserialize, Serialize};

use crate::{
    messages::types::{MessageResponse, MessageUser},
    poll_actions::types::{CreatePollActionRequest, PollActionResponse},
    votes::types::VoteResponse,
};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PollPath {
    pub(crate) server_id: Uuid,
    pub(crate) channel_id: Uuid,
    pub(crate) poll_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct PollImagePath {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) poll_id: Uuid,
    pub(super) image_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct PollActionEventCoverPhotoPath {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) poll_id: Uuid,
    pub(super) image_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CreatePollRequest {
    pub(super) body: Option<String>,
    #[serde(default = "default_poll_type")]
    pub(super) poll_type: PollType,
    pub(super) action: Option<CreatePollActionRequest>,
    pub(super) options: Option<Vec<String>>,
    pub(super) multiple_choice: Option<bool>,
    pub(super) closing_at: Option<DateTimeWithTimeZone>,
}

fn default_poll_type() -> PollType {
    PollType::Proposal
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ListActiveDecisionsQuery {
    pub(super) before: Option<String>,
    pub(super) limit: Option<u64>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PollResponse {
    pub(crate) id: String,
    pub(super) body: Option<String>,
    pub(super) poll_type: PollType,
    pub(super) stage: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) closed_reason: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) action: Option<PollActionResponse>,
    pub(super) config: PollConfigResponse,
    pub(super) options: Vec<PollOptionResponse>,
    pub(super) user: PollUserResponse,
    pub(super) votes: Vec<VoteResponse>,
    pub(super) images: Vec<PollImageResponse>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) my_vote: Option<VoteResponse>,
    pub(super) agreement_vote_count: usize,
    pub(super) member_count: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) source_call_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) source_call_status: Option<String>,
    pub(crate) reply_count: usize,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub(crate) reply_users: Vec<MessageUser>,
    pub(crate) latest_reply_at: Option<String>,
    pub(crate) created_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct PollThreadResponse {
    pub(super) root: PollResponse,
    pub(super) replies: Vec<MessageResponse>,
    pub(super) start_cursor: Option<String>,
    pub(super) next_cursor: Option<String>,
    pub(super) has_more: bool,
    pub(super) has_more_newer: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct MovedPollThreadResponse {
    pub(super) error: &'static str,
    pub(super) moved_to: MovedPollThreadDestination,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct MovedPollThreadDestination {
    pub(super) destination_channel_id: String,
    pub(super) forum_post_id: String,
}

#[derive(Debug, Serialize)]
pub(super) struct PollPayload {
    pub(super) poll: PollResponse,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct CallDecisionResponse {
    pub(super) active_item: Option<PollResponse>,
    pub(super) recent_result: Option<PollResponse>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ActiveDecisionResponse {
    pub(super) id: String,
    pub(super) poll_type: PollType,
    pub(super) body: Option<String>,
    pub(super) closing_at: Option<String>,
    pub(super) response_count: usize,
    pub(super) member_count: usize,
    pub(super) has_responded: bool,
    pub(super) created_at: String,
    pub(super) channel_id: String,
    pub(super) channel_name: String,
    pub(super) channel_type: ChannelType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) forum_post_id: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ActiveDecisionsResponse {
    pub(super) decisions: Vec<ActiveDecisionResponse>,
    pub(super) next_cursor: Option<String>,
    pub(super) has_more: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct PollConfigResponse {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) decision_making_model: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) agreement_threshold: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) quorum_enabled: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) quorum_threshold: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) disagreements_limit: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) abstains_limit: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) blocks_open_to_all: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) closing_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) multiple_choice: Option<bool>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct PollOptionResponse {
    pub(super) id: String,
    pub(super) text: String,
    pub(super) vote_count: usize,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct PollImageResponse {
    pub(super) id: String,
}

#[derive(Debug, Serialize)]
pub(super) struct DeletePollResponse {
    pub(super) affected: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct PollUserResponse {
    pub(super) id: String,
    pub(super) name: String,
    pub(super) display_name: Option<String>,
    pub(super) profile_picture: Option<crate::users::UserImageRef>,
}

#[derive(Debug, Clone)]
pub(super) struct StoredPollImage {
    pub(super) bytes: Vec<u8>,
}
