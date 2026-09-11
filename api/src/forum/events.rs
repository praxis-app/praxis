use sea_orm::{prelude::Uuid, DatabaseConnection};

use super::types::{
    ForumPostResponse, ForumPostSummaryResponse, ProposalForumReferenceResponse,
};
use crate::{
    channels,
    messages::types::MessageResponse,
    pub_sub::{PubSubService, PubSubTopic},
};

pub(crate) async fn broadcast_forum_post(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    server_id: Uuid,
    channel_id: Uuid,
    sender_id: Uuid,
    action: &'static str,
    post: &ForumPostResponse,
) {
    broadcast_event(
        database,
        pub_sub_service,
        server_id,
        channel_id,
        sender_id,
        serde_json::json!({
            "type": "forumPost",
            "action": action,
            "post": post,
        }),
    )
    .await;
}

pub(crate) async fn broadcast_proposal_forum_reference(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    server_id: Uuid,
    source_channel_id: Uuid,
    sender_id: Uuid,
    reference: &ProposalForumReferenceResponse,
) {
    let members = match channels::get_channel_member_user_ids(
        database,
        source_channel_id,
    )
    .await
    {
        Ok(members) => members,
        Err(error) => {
            tracing::warn!("failed to load proposal move recipients: {error}");
            return;
        }
    };
    let body = serde_json::json!({
        "type": "proposalMoved",
        "reference": reference,
    });
    for member_id in members {
        if member_id == sender_id {
            continue;
        }
        let topic =
            PubSubTopic::new_poll(server_id, source_channel_id, member_id)
                .to_string();
        if let Err(error) = pub_sub_service.publish(&topic, body.clone()).await
        {
            tracing::warn!("failed to broadcast proposal move: {error}");
        }
    }
}

#[allow(clippy::too_many_arguments)]
pub(super) async fn broadcast_forum_reply(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    server_id: Uuid,
    channel_id: Uuid,
    sender_id: Uuid,
    action: &'static str,
    post_id: Uuid,
    reply: Option<&MessageResponse>,
    reply_id: Option<Uuid>,
    post: &ForumPostSummaryResponse,
) {
    broadcast_event(
        database,
        pub_sub_service,
        server_id,
        channel_id,
        sender_id,
        serde_json::json!({
            "type": "forumReply",
            "action": action,
            "postId": post_id,
            "reply": reply,
            "replyId": reply_id,
            "post": post,
        }),
    )
    .await;
}

async fn broadcast_event(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    server_id: Uuid,
    channel_id: Uuid,
    sender_id: Uuid,
    body: serde_json::Value,
) {
    let members =
        match channels::get_channel_member_user_ids(database, channel_id).await
        {
            Ok(members) => members,
            Err(error) => {
                tracing::warn!(
                    "failed to load forum event recipients: {error}"
                );
                return;
            }
        };
    for member_id in members {
        if member_id == sender_id {
            continue;
        }
        let topic =
            PubSubTopic::new_forum_post(server_id, channel_id, member_id)
                .to_string();
        if let Err(error) = pub_sub_service.publish(&topic, body.clone()).await
        {
            tracing::warn!("failed to broadcast forum event: {error}");
        }
    }
}
