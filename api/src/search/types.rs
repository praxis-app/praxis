use serde::{Deserialize, Serialize};

#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct SearchQuery {
    pub(super) q: Option<String>,
    pub(super) channel_id: Option<String>,
    pub(super) kind: Option<String>,
    pub(super) before: Option<String>,
    pub(super) limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct SearchPath {
    pub(super) server_id: sea_orm::prelude::Uuid,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(super) enum SearchKind {
    Message,
    ThreadReply,
    CallMessage,
    Poll,
    Proposal,
    ForumPost,
    ForumReply,
}

impl SearchKind {
    pub(super) const ALL: [Self; 7] = [
        Self::Message,
        Self::ThreadReply,
        Self::CallMessage,
        Self::Poll,
        Self::Proposal,
        Self::ForumPost,
        Self::ForumReply,
    ];

    pub(super) fn as_str(self) -> &'static str {
        match self {
            Self::Message => "message",
            Self::ThreadReply => "threadReply",
            Self::CallMessage => "callMessage",
            Self::Poll => "poll",
            Self::Proposal => "proposal",
            Self::ForumPost => "forumPost",
            Self::ForumReply => "forumReply",
        }
    }

    pub(super) fn parse(value: &str) -> Option<Self> {
        Self::ALL.into_iter().find(|kind| kind.as_str() == value)
    }
}

impl Serialize for SearchKind {
    fn serialize<S: serde::Serializer>(
        &self,
        serializer: S,
    ) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(self.as_str())
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct SearchAuthor {
    pub(super) id: String,
    pub(super) name: String,
    pub(super) display_name: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct SearchResult {
    pub(super) kind: SearchKind,
    pub(super) id: String,
    pub(super) server_id: String,
    pub(super) server_slug: String,
    pub(super) channel_id: String,
    pub(super) channel_name: String,
    pub(super) author: SearchAuthor,
    pub(super) created_at: String,
    pub(super) excerpt: String,
    pub(super) call_id: Option<String>,
    pub(super) thread_root_id: Option<String>,
    pub(super) thread_root_kind: Option<&'static str>,
    pub(super) forum_post_id: Option<String>,
    pub(super) poll_id: Option<String>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct SearchCoverageSource {
    pub(super) source: &'static str,
    pub(super) cap: u64,
    pub(super) scanned: usize,
    pub(super) truncated: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct SearchCoverage {
    pub(super) mode: &'static str,
    pub(super) window_start: String,
    pub(super) window_end: String,
    pub(super) sources: Vec<SearchCoverageSource>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(super) struct SearchResponse {
    pub(super) results: Vec<SearchResult>,
    pub(super) next_cursor: Option<String>,
    pub(super) has_more: bool,
    pub(super) search_coverage: SearchCoverage,
}
