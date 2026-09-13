use sea_orm::prelude::Uuid;
use serde::{Deserialize, Serialize};

use crate::{
    messages::types::{MessageResponse, MessageUser},
    polls::types::{CreatePollRequest, PollResponse},
};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ForumChannelPath {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ForumPostPath {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) post_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ForumReplyPath {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) post_id: Uuid,
    pub(super) reply_id: Uuid,
}

#[derive(Debug)]
pub(super) struct CreateForumProposalContext {
    pub(super) server_id: Uuid,
    pub(super) channel_id: Uuid,
    pub(super) post_id: Uuid,
    pub(super) user_id: Uuid,
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ListForumPostsQuery {
    pub(super) sort: Option<String>,
    pub(super) status: Option<String>,
    pub(super) before: Option<String>,
    pub(super) limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct CreateForumPostRequest {
    pub(super) title: String,
    pub(super) body: String,
    pub(super) proposal: Option<CreatePollRequest>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(crate) struct MoveProposalToForumRequest {
    pub(super) destination_channel_id: Uuid,
    pub(super) title: String,
    pub(super) body: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub(super) struct UpdateForumPostRequest {
    pub(super) title: Option<String>,
    pub(super) body: Option<String>,
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ListForumRepliesQuery {
    pub(super) before: Option<String>,
    pub(super) after: Option<String>,
    pub(super) around: Option<String>,
    pub(super) limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct CreateForumReplyRequest {
    pub(super) body: String,
    pub(super) parent_message_id: Option<Uuid>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ForumPostSummaryResponse {
    pub(super) id: String,
    pub(super) title: String,
    pub(super) root_message_id: String,
    pub(super) poll_id: Option<String>,
    pub(super) status: String,
    pub(super) user: MessageUser,
    pub(super) reply_count: usize,
    pub(super) latest_activity_at: String,
    pub(super) created_at: String,
    pub(super) updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ForumPostsResponse {
    pub(super) posts: Vec<ForumPostSummaryResponse>,
    pub(super) next_cursor: Option<String>,
    pub(super) has_more: bool,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ForumPostResponse {
    #[serde(flatten)]
    pub(super) post: ForumPostSummaryResponse,
    pub(super) body: String,
    pub(super) replies: Vec<MessageResponse>,
    pub(super) proposal: Option<PollResponse>,
}

#[derive(Debug, Serialize)]
pub(super) struct ForumPostPayload {
    pub(super) post: ForumPostResponse,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ForumPostContextResponse {
    pub(super) post: ForumPostResponse,
    pub(super) start_cursor: Option<String>,
    pub(super) next_cursor: Option<String>,
    pub(super) has_more: bool,
    pub(super) has_more_newer: bool,
}

#[derive(Debug, Serialize)]
pub(super) struct ForumReplyPayload {
    pub(super) reply: MessageResponse,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ProposalForumReferenceResponse {
    pub(crate) id: String,
    pub(super) proposal_id: String,
    pub(super) source_channel_id: String,
    pub(super) destination_channel_id: String,
    pub(super) destination_channel_name: String,
    pub(super) forum_post_id: String,
    pub(super) user: MessageUser,
    pub(crate) created_at: String,
    pub(super) moved_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct MoveProposalToForumResponse {
    pub(crate) post: ForumPostResponse,
    pub(crate) source_reference: ProposalForumReferenceResponse,
    #[serde(skip)]
    pub(crate) destination_channel_id: Uuid,
}

pub(super) struct CreatedForumReply {
    pub(super) reply: crate::messages::types::MessageResponse,
    pub(super) summary: ForumPostSummaryResponse,
}
