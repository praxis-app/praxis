use sea_orm::entity::prelude::*;

use super::macros::impl_enum_string_conversions;

#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "server_role_permissions_action_enum"
)]
pub enum ServerRoleAbilityAction {
    #[sea_orm(string_value = "delete")]
    Delete,
    #[sea_orm(string_value = "create")]
    Create,
    #[sea_orm(string_value = "read")]
    Read,
    #[sea_orm(string_value = "update")]
    Update,
    #[sea_orm(string_value = "manage")]
    Manage,
}

impl_enum_string_conversions!(ServerRoleAbilityAction {
    Delete => "delete",
    Create => "create",
    Read => "read",
    Update => "update",
    Manage => "manage",
});

#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "instance_role_permissions_action_enum"
)]
pub enum InstanceRoleAbilityAction {
    #[sea_orm(string_value = "delete")]
    Delete,
    #[sea_orm(string_value = "create")]
    Create,
    #[sea_orm(string_value = "read")]
    Read,
    #[sea_orm(string_value = "update")]
    Update,
    #[sea_orm(string_value = "manage")]
    Manage,
}

impl_enum_string_conversions!(InstanceRoleAbilityAction {
    Delete => "delete",
    Create => "create",
    Read => "read",
    Update => "update",
    Manage => "manage",
});

#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "server_role_permissions_subject_enum"
)]
pub enum ServerAbilitySubject {
    #[sea_orm(string_value = "ServerConfig")]
    ServerConfig,
    #[sea_orm(string_value = "Channel")]
    Channel,
    #[sea_orm(string_value = "Invite")]
    Invite,
    #[sea_orm(string_value = "Message")]
    Message,
    #[sea_orm(string_value = "ServerRole")]
    ServerRole,
    #[sea_orm(string_value = "ProposalBlock")]
    ProposalBlock,
    #[sea_orm(string_value = "all")]
    All,
}

impl_enum_string_conversions!(ServerAbilitySubject {
    ServerConfig => "ServerConfig",
    Channel => "Channel",
    Invite => "Invite",
    Message => "Message",
    ServerRole => "ServerRole",
    ProposalBlock => "ProposalBlock",
    All => "all",
});

#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "instance_role_permissions_subject_enum"
)]
pub enum InstanceAbilitySubject {
    #[sea_orm(string_value = "InstanceConfig")]
    InstanceConfig,
    #[sea_orm(string_value = "InstanceRole")]
    InstanceRole,
    #[sea_orm(string_value = "Server")]
    Server,
    #[sea_orm(string_value = "all")]
    All,
}

impl_enum_string_conversions!(InstanceAbilitySubject {
    InstanceConfig => "InstanceConfig",
    InstanceRole => "InstanceRole",
    Server => "Server",
    All => "all",
});
