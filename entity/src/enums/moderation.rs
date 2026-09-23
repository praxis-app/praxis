use sea_orm::entity::prelude::*;

use super::macros::impl_enum_string_conversions;

#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "moderation_actions_action_enum"
)]
pub enum ModerationAction {
    #[sea_orm(string_value = "remove_message")]
    RemoveMessage,
    #[sea_orm(string_value = "remove_forum_post")]
    RemoveForumPost,
    #[sea_orm(string_value = "remove_member")]
    RemoveMember,
    #[sea_orm(string_value = "ban_member")]
    BanMember,
    #[sea_orm(string_value = "unban_member")]
    UnbanMember,
    #[sea_orm(string_value = "suspend_user")]
    SuspendUser,
    #[sea_orm(string_value = "restore_user")]
    RestoreUser,
    #[sea_orm(string_value = "delete_user")]
    DeleteUser,
    #[sea_orm(string_value = "remove_call_participant")]
    RemoveCallParticipant,
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
