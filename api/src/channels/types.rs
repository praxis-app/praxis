use entity::enums::ChannelType;
use serde::{Deserialize, Serialize};

pub(super) use crate::servers::types::ServerPath;
use sea_orm::prelude::Uuid;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ChannelPath {
    pub(crate) server_id: Uuid,
    pub(crate) channel_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ChannelRequest {
    pub(super) name: String,
    pub(super) description: Option<String>,
    pub(super) channel_type: Option<ChannelType>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ChannelOrderRequest {
    pub(super) channel_ids: Vec<Uuid>,
}

#[derive(Debug, Clone, Serialize)]
pub(super) struct ChannelServer {
    pub(super) id: String,
    pub(super) slug: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct ChannelResponse {
    pub(super) id: String,
    pub(super) name: String,
    pub(super) description: Option<String>,
    pub(super) channel_type: ChannelType,
    pub(super) server: ChannelServer,
}

#[derive(Debug, Serialize)]
pub(super) struct ChannelPayload {
    pub(super) channel: ChannelResponse,
}

#[derive(Debug, Serialize)]
pub(super) struct ChannelsPayload {
    pub(super) channels: Vec<ChannelResponse>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct UnreadChannelsPayload {
    pub(super) channel_ids: Vec<String>,
}
