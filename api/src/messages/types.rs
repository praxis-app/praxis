use sea_orm::prelude::{DateTimeWithTimeZone, Uuid};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct MessageImagePath {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) message_id: Uuid,
    pub(super) image_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct CallMessageImagePath {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) call_id: Uuid,
    pub(super) message_id: Uuid,
    pub(super) image_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ThreadPath {
    pub(super) root_message_id: Uuid,
}

pub(crate) struct ListRepliesPage {
    pub(crate) before: Option<String>,
    pub(crate) after: Option<String>,
    pub(crate) around: Option<Uuid>,
    pub(crate) limit: u64,
}

#[derive(Debug, Default, Deserialize)]
pub(crate) struct ListRepliesQuery {
    pub(crate) before: Option<String>,
    pub(crate) after: Option<String>,
    pub(crate) around: Option<String>,
    pub(crate) limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct CreateMessageRequest {
    pub(crate) body: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(crate) struct CreateReplyRequest {
    pub(crate) body: Option<String>,
    pub(crate) parent_message_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct MessagePath {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) message_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct CallMessagePath {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) call_id: Uuid,
    pub(super) message_id: Uuid,
}

#[derive(Debug)]
pub(super) struct RemoveMessageRequest {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) call_id: Option<Uuid>,
    pub(super) message_id: Uuid,
    pub(super) actor_user_id: Uuid,
    pub(super) reason: Option<String>,
}

#[derive(Debug)]
pub(super) struct CreateReplyContext {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) root_message_id: Uuid,
    pub(super) user_id: Uuid,
}

#[derive(Debug)]
pub(super) struct CreateCallMessageContext {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) call_id: Uuid,
    pub(super) user_id: Uuid,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ImageResponse {
    pub(super) id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) is_placeholder: Option<bool>,
    pub(super) created_at: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct MessageUser {
    pub(crate) id: String,
    pub(crate) name: String,
    pub(crate) display_name: Option<String>,
    pub(crate) profile_picture: Option<crate::users::UserImageRef>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct MessageResponse {
    pub(crate) id: String,
    pub(crate) body: Option<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub(super) images: Vec<ImageResponse>,
    pub(super) user: Option<MessageUser>,
    pub(super) user_id: Option<String>,
    pub(super) bot_id: Option<String>,
    pub(super) bot: Option<serde_json::Value>,
    pub(super) command_status: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) thread_root_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) thread_poll_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(super) parent_message_id: Option<String>,
    pub(crate) reply_count: usize,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub(crate) reply_users: Vec<MessageUser>,
    pub(crate) latest_reply_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) moderated_at: Option<String>,
    pub(crate) created_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ThreadResponse {
    pub(super) root: MessageResponse,
    pub(super) replies: Vec<MessageResponse>,
    pub(super) start_cursor: Option<String>,
    pub(super) next_cursor: Option<String>,
    pub(super) has_more: bool,
    pub(super) has_more_newer: bool,
}

#[derive(Debug, Serialize)]
pub(crate) struct MessagePayload {
    pub(crate) message: MessageResponse,
}

#[derive(Debug, Clone)]
pub(super) struct StoredImage {
    pub(super) bytes: Vec<u8>,
}

pub(crate) fn serialize_timestamp(value: DateTimeWithTimeZone) -> String {
    value.to_rfc3339()
}
