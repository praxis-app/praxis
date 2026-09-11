use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

use super::macros::impl_enum_string_conversions;

#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "server_configs_decision_making_model_enum"
)]
pub enum ServerDecisionMakingModel {
    #[sea_orm(string_value = "consent")]
    Consent,
    #[sea_orm(string_value = "consensus")]
    Consensus,
    #[sea_orm(string_value = "majority-vote")]
    MajorityVote,
}

impl_enum_string_conversions!(ServerDecisionMakingModel {
    Consent => "consent",
    Consensus => "consensus",
    MajorityVote => "majority-vote",
});

#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "poll_configs_decision_making_model_enum"
)]
pub enum PollDecisionMakingModel {
    #[sea_orm(string_value = "consent")]
    Consent,
    #[sea_orm(string_value = "consensus")]
    Consensus,
    #[sea_orm(string_value = "majority-vote")]
    MajorityVote,
}

impl_enum_string_conversions!(PollDecisionMakingModel {
    Consent => "consent",
    Consensus => "consensus",
    MajorityVote => "majority-vote",
});

impl From<ServerDecisionMakingModel> for PollDecisionMakingModel {
    fn from(value: ServerDecisionMakingModel) -> Self {
        match value {
            ServerDecisionMakingModel::Consent => Self::Consent,
            ServerDecisionMakingModel::Consensus => Self::Consensus,
            ServerDecisionMakingModel::MajorityVote => Self::MajorityVote,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "polls_stage_enum")]
pub enum PollStage {
    #[sea_orm(string_value = "voting")]
    Voting,
    #[sea_orm(string_value = "ratified")]
    Ratified,
    #[sea_orm(string_value = "revision")]
    Revision,
    #[sea_orm(string_value = "closed")]
    Closed,
}

impl_enum_string_conversions!(PollStage {
    Voting => "voting",
    Ratified => "ratified",
    Revision => "revision",
    Closed => "closed",
});

#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "poll_closed_reason_enum"
)]
pub enum PollClosedReason {
    #[sea_orm(string_value = "event-start-elapsed")]
    EventStartElapsed,
    #[sea_orm(string_value = "event-host-ineligible")]
    EventHostIneligible,
}

impl_enum_string_conversions!(PollClosedReason {
    EventStartElapsed => "event-start-elapsed",
    EventHostIneligible => "event-host-ineligible",
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
    enum_name = "polls_poll_type_enum"
)]
pub enum PollType {
    #[sea_orm(string_value = "proposal")]
    Proposal,
    #[sea_orm(string_value = "poll")]
    Poll,
}

impl_enum_string_conversions!(PollType {
    Proposal => "proposal",
    Poll => "poll",
});
