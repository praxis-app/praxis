use sea_orm::prelude::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CallPath {
    pub(crate) server_id: Uuid,
    pub(crate) channel_id: Uuid,
    pub(crate) call_id: Uuid,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct JoinCallResponse {
    pub(super) livekit_url: String,
    pub(super) room_name: String,
    pub(super) token: String,
    pub(super) call: CallResponse,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct CallResponse {
    pub(super) id: String,
    pub(super) server_id: String,
    pub(super) channel_id: String,
    pub(super) room_name: String,
    pub(super) status: String,
}

#[derive(Debug, Serialize)]
pub(super) struct CallPayload {
    pub(super) call: CallResponse,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct CallUserResponse {
    pub(super) id: String,
    pub(super) name: String,
    pub(super) display_name: Option<String>,
    pub(super) profile_picture: Option<crate::users::UserImageRef>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct CallSummaryResponse {
    pub(super) messages: u64,
    pub(super) proposals: u64,
    pub(super) polls: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CallArtifactResponse {
    #[serde(rename = "type")]
    pub(super) kind: &'static str,
    pub(crate) id: String,
    pub(super) server_id: String,
    pub(super) channel_id: String,
    pub(super) room_name: String,
    pub(super) status: String,
    pub(super) started_by: CallUserResponse,
    pub(super) participants: Vec<CallUserResponse>,
    pub(super) participant_count: usize,
    pub(super) duration_seconds: i64,
    pub(super) summary: CallSummaryResponse,
    pub(crate) created_at: String,
    pub(super) ended_at: Option<String>,
}
