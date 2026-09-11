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
#[sea_orm(
    rs_type = "String",
    db_type = "Enum",
    enum_name = "event_attendee_status_enum"
)]
pub enum EventAttendeeStatus {
    #[sea_orm(string_value = "host")]
    Host,
    #[sea_orm(string_value = "going")]
    Going,
    #[sea_orm(string_value = "interested")]
    Interested,
}

impl_enum_string_conversions!(EventAttendeeStatus {
    Host => "host",
    Going => "going",
    Interested => "interested",
});
