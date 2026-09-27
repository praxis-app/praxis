use sea_orm::entity::prelude::*;

use super::macros::impl_enum_string_conversions;

/// Every supported moderation action
#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "moderation_actions_action_enum"
)]
pub enum ModerationAction {
    /// Erases a message's content and images, leaving a placeholder
    #[sea_orm(string_value = "remove_message")]
    RemoveMessage,

    /// Erases a forum post and its opening message but keeps replies
    #[sea_orm(string_value = "remove_forum_post")]
    RemoveForumPost,

    /// Removes a member from a server without preventing them from rejoining
    #[sea_orm(string_value = "remove_member")]
    RemoveMember,

    /// Removes a member from a server and blocks them from rejoining
    #[sea_orm(string_value = "ban_member")]
    BanMember,

    /// Lifts a server ban so the user can rejoin
    #[sea_orm(string_value = "unban_member")]
    UnbanMember,

    /// Locks an account out of the instance until restored
    #[sea_orm(string_value = "suspend_user")]
    SuspendUser,

    /// Unlocks a suspended account
    #[sea_orm(string_value = "restore_user")]
    RestoreUser,

    /// Anonymizes an account and erases its content and memberships
    #[sea_orm(string_value = "delete_user")]
    DeleteUser,

    /// Disconnects a participant from an active call
    #[sea_orm(string_value = "remove_call_participant")]
    RemoveCallParticipant,

    /// Ends an active call for all participants
    #[sea_orm(string_value = "end_call")]
    EndCall,
}

impl_enum_string_conversions!(ModerationAction {
    RemoveMessage => "remove_message",
    RemoveForumPost => "remove_forum_post",
    RemoveMember => "remove_member",
    BanMember => "ban_member",
    UnbanMember => "unban_member",
    SuspendUser => "suspend_user",
    RestoreUser => "restore_user",
    DeleteUser => "delete_user",
    RemoveCallParticipant => "remove_call_participant",
    EndCall => "end_call",
});

#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "moderation_actions_target_kind_enum"
)]
pub enum ModerationTargetKind {
    #[sea_orm(string_value = "message")]
    Message,
    #[sea_orm(string_value = "forum_post")]
    ForumPost,
    #[sea_orm(string_value = "user")]
    User,
    #[sea_orm(string_value = "call")]
    Call,
}

impl_enum_string_conversions!(ModerationTargetKind {
    Message => "message",
    ForumPost => "forum_post",
    User => "user",
    Call => "call",
});
