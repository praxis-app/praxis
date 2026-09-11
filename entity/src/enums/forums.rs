use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

use super::macros::impl_enum_string_conversions;

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
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "channel_type")]
pub enum ChannelType {
    #[sea_orm(string_value = "text")]
    Text,
    #[sea_orm(string_value = "forum")]
    Forum,
}

impl_enum_string_conversions!(ChannelType {
    Text => "text",
    Forum => "forum",
});

#[derive(Clone, Copy, Debug, PartialEq, Eq, EnumIter, DeriveActiveEnum)]
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "forum_post_status"
)]
pub enum ForumPostStatus {
    #[sea_orm(string_value = "open")]
    Open,
    #[sea_orm(string_value = "closed")]
    Closed,
}

impl_enum_string_conversions!(ForumPostStatus {
    Open => "open",
    Closed => "closed",
});
