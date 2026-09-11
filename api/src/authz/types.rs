use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PermissionRule {
    pub(crate) subject: String,
    pub(crate) action: Vec<String>,
}

pub(crate) type PermissionMap = BTreeMap<String, Vec<PermissionRule>>;
