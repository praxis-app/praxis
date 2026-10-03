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

    /// Creates a server or instance role
    #[sea_orm(string_value = "create_role")]
    CreateRole,

    /// Changes a server or instance role's name or color
    #[sea_orm(string_value = "update_role")]
    UpdateRole,

    /// Changes the permissions granted by a server or instance role
    #[sea_orm(string_value = "update_role_permissions")]
    UpdateRolePermissions,

    /// Deletes a server or instance role
    #[sea_orm(string_value = "delete_role")]
    DeleteRole,

    /// Adds one or more users to a server or instance role
    #[sea_orm(string_value = "add_role_members")]
    AddRoleMembers,

    /// Removes a user from a server or instance role
    #[sea_orm(string_value = "remove_role_member")]
    RemoveRoleMember,

    /// Changes a server's name, description, or other properties
    #[sea_orm(string_value = "update_server")]
    UpdateServer,

    /// Changes a server's configuration
    #[sea_orm(string_value = "update_server_config")]
    UpdateServerConfig,
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
    CreateRole => "create_role",
    UpdateRole => "update_role",
    UpdateRolePermissions => "update_role_permissions",
    DeleteRole => "delete_role",
    AddRoleMembers => "add_role_members",
    RemoveRoleMember => "remove_role_member",
    UpdateServer => "update_server",
    UpdateServerConfig => "update_server_config",
});

#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "moderation_actions_origin_enum"
)]
pub enum AuditLogOrigin {
    #[sea_orm(string_value = "direct")]
    Direct,
    #[sea_orm(string_value = "proposal")]
    Proposal,
    #[sea_orm(string_value = "system")]
    System,
}

impl_enum_string_conversions!(AuditLogOrigin {
    Direct => "direct",
    Proposal => "proposal",
    System => "system",
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
    #[sea_orm(string_value = "server")]
    Server,
    #[sea_orm(string_value = "server_config")]
    ServerConfig,
    #[sea_orm(string_value = "server_role")]
    ServerRole,
    #[sea_orm(string_value = "instance_role")]
    InstanceRole,
}

impl_enum_string_conversions!(ModerationTargetKind {
    Message => "message",
    ForumPost => "forum_post",
    User => "user",
    Call => "call",
    Server => "server",
    ServerConfig => "server_config",
    ServerRole => "server_role",
    InstanceRole => "instance_role",
});
