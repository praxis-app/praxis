use sea_orm::entity::prelude::*;

use super::macros::impl_enum_string_conversions;

#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "notifications_kind_enum"
)]
/// Notification kinds - every kind of notification the app supports
pub enum NotificationKind {
    /// A message sent in a channel you've joined
    #[sea_orm(string_value = "new_message")]
    NewMessage,

    /// A proposal created in, or moved into, a channel you've joined
    #[sea_orm(string_value = "new_proposal")]
    NewProposal,

    /// A reply in a thread on your message, poll, or proposal
    #[sea_orm(string_value = "message_reply")]
    MessageReply,

    /// A reply on your forum post
    #[sea_orm(string_value = "forum_reply")]
    ForumReply,

    /// Someone voted on your proposal
    #[sea_orm(string_value = "proposal_vote")]
    ProposalVote,

    /// A proposal you authored or voted on was ratified
    #[sea_orm(string_value = "proposal_ratified")]
    ProposalRatified,

    /// A proposal you authored or voted on closed without ratifying
    #[sea_orm(string_value = "proposal_closed")]
    ProposalClosed,

    /// You were granted a server role
    #[sea_orm(string_value = "server_role_granted")]
    ServerRoleGranted,

    /// A ratified proposal scheduled an event
    #[sea_orm(string_value = "event_created")]
    EventCreated,
}

impl_enum_string_conversions!(NotificationKind {
    NewMessage => "new_message",
    NewProposal => "new_proposal",
    MessageReply => "message_reply",
    ForumReply => "forum_reply",
    ProposalVote => "proposal_vote",
    ProposalRatified => "proposal_ratified",
    ProposalClosed => "proposal_closed",
    ServerRoleGranted => "server_role_granted",
    EventCreated => "event_created",
});
