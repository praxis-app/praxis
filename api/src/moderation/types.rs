use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ModerationReasonRequest {
    pub(crate) reason: Option<String>,
}

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct AuditLogQuery {
    pub(super) cursor: Option<String>,
    pub(super) limit: Option<u64>,
    pub(super) action: Option<String>,
    pub(super) actor_id: Option<String>,
    pub(super) target_kind: Option<String>,
    pub(super) target_id: Option<String>,
    pub(super) server_id: Option<String>,
    pub(super) from: Option<String>,
    pub(super) to: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct AuditLogResponse {
    pub(super) entries: Vec<AuditLogEntryResponse>,
    pub(super) next_cursor: Option<String>,
    pub(super) has_more: bool,
    pub(super) filter_values: AuditLogFilterValues,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct AuditLogEntryResponse {
    pub(super) id: String,
    pub(super) actor: Option<AuditLogActorResponse>,
    pub(super) origin: String,
    pub(super) proposal_id: Option<String>,
    pub(super) action: String,
    pub(super) target: AuditLogTargetResponse,
    pub(super) scope: AuditLogScopeResponse,
    pub(super) reason: Option<String>,
    pub(super) before_value: Option<Value>,
    pub(super) after_value: Option<Value>,
    pub(super) created_at: String,
    pub(super) application_path: Option<String>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct AuditLogActorResponse {
    pub(super) id: String,
    pub(super) label: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct AuditLogTargetResponse {
    pub(super) kind: String,
    pub(super) id: String,
    pub(super) label: Option<String>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct AuditLogScopeResponse {
    pub(super) server_id: Option<String>,
    pub(super) server_label: Option<String>,
    pub(super) channel_id: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct AuditLogFilterValues {
    pub(super) actors: Vec<AuditLogActorResponse>,
    pub(super) servers: Vec<AuditLogScopeResponse>,
    pub(super) actions: Vec<String>,
    pub(super) target_kinds: Vec<String>,
}
