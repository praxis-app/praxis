use serde::Deserialize;

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ModerationReasonRequest {
    pub(crate) reason: Option<String>,
}
