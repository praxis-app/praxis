use sea_orm::entity::prelude::*;

use super::macros::impl_enum_string_conversions;

#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "votes_vote_type_enum"
)]
pub enum VoteType {
    #[sea_orm(string_value = "agree")]
    Agree,
    #[sea_orm(string_value = "disagree")]
    Disagree,
    #[sea_orm(string_value = "abstain")]
    Abstain,
    #[sea_orm(string_value = "block")]
    Block,
}

impl_enum_string_conversions!(VoteType {
    Agree => "agree",
    Disagree => "disagree",
    Abstain => "abstain",
    Block => "block",
});
