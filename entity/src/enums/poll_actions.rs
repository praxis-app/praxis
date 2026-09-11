use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

use super::{
    macros::impl_enum_string_conversions,
    roles::{ServerAbilitySubject, ServerRoleAbilityAction},
};

#[derive(
    Clone,
    Copy,
    Debug,
    PartialEq,
    Eq,
    EnumIter,
    DeriveActiveEnum,
    Deserialize,
    Serialize,
)]
#[serde(rename_all = "kebab-case")]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "poll_actions_action_type_enum"
)]
pub enum PollActionType {
    #[sea_orm(string_value = "general")]
    General,
    #[sea_orm(string_value = "change-settings")]
    ChangeSettings,
    #[sea_orm(string_value = "change-role")]
    ChangeRole,
    #[sea_orm(string_value = "create-role")]
    CreateRole,
    #[sea_orm(string_value = "plan-event")]
    PlanEvent,
    #[sea_orm(string_value = "test")]
    Test,
}

impl_enum_string_conversions!(PollActionType {
    General => "general",
    ChangeSettings => "change-settings",
    ChangeRole => "change-role",
    CreateRole => "create-role",
    PlanEvent => "plan-event",
    Test => "test",
});

#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "poll_action_permissions_action_enum"
)]
pub enum PollActionPermissionAbilityAction {
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

impl_enum_string_conversions!(PollActionPermissionAbilityAction {
    Delete => "delete",
    Create => "create",
    Read => "read",
    Update => "update",
    Manage => "manage",
});

impl From<PollActionPermissionAbilityAction> for ServerRoleAbilityAction {
    fn from(value: PollActionPermissionAbilityAction) -> Self {
        match value {
            PollActionPermissionAbilityAction::Delete => Self::Delete,
            PollActionPermissionAbilityAction::Create => Self::Create,
            PollActionPermissionAbilityAction::Read => Self::Read,
            PollActionPermissionAbilityAction::Update => Self::Update,
            PollActionPermissionAbilityAction::Manage => Self::Manage,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "poll_action_permissions_subject_enum"
)]
pub enum PollActionPermissionSubject {
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

impl_enum_string_conversions!(PollActionPermissionSubject {
    ServerConfig => "ServerConfig",
    Channel => "Channel",
    Invite => "Invite",
    Message => "Message",
    ServerRole => "ServerRole",
    ProposalBlock => "ProposalBlock",
    All => "all",
});

impl From<PollActionPermissionSubject> for ServerAbilitySubject {
    fn from(value: PollActionPermissionSubject) -> Self {
        match value {
            PollActionPermissionSubject::ServerConfig => Self::ServerConfig,
            PollActionPermissionSubject::Channel => Self::Channel,
            PollActionPermissionSubject::Invite => Self::Invite,
            PollActionPermissionSubject::Message => Self::Message,
            PollActionPermissionSubject::ServerRole => Self::ServerRole,
            PollActionPermissionSubject::ProposalBlock => Self::ProposalBlock,
            PollActionPermissionSubject::All => Self::All,
        }
    }
}

#[derive(
    Clone,
    Copy,
    Debug,
    PartialEq,
    Eq,
    EnumIter,
    DeriveActiveEnum,
    Deserialize,
    Serialize,
)]
#[serde(rename_all = "lowercase")]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "poll_action_permissions_change_type_enum"
)]
pub enum PollActionPermissionChangeType {
    #[sea_orm(string_value = "add")]
    Add,
    #[sea_orm(string_value = "remove")]
    Remove,
}

impl_enum_string_conversions!(PollActionPermissionChangeType {
    Add => "add",
    Remove => "remove",
});

#[derive(
    Clone,
    Copy,
    Debug,
    PartialEq,
    Eq,
    EnumIter,
    DeriveActiveEnum,
    Deserialize,
    Serialize,
)]
#[serde(rename_all = "lowercase")]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "poll_action_role_members_change_type_enum"
)]
pub enum PollActionRoleMemberChangeType {
    #[sea_orm(string_value = "add")]
    Add,
    #[sea_orm(string_value = "remove")]
    Remove,
}

impl_enum_string_conversions!(PollActionRoleMemberChangeType {
    Add => "add",
    Remove => "remove",
});

impl From<PollActionPermissionChangeType> for PollActionRoleMemberChangeType {
    fn from(value: PollActionPermissionChangeType) -> Self {
        match value {
            PollActionPermissionChangeType::Add => Self::Add,
            PollActionPermissionChangeType::Remove => Self::Remove,
        }
    }
}
