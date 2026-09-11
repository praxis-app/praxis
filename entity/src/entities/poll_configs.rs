use sea_orm::entity::prelude::*;

use crate::enums::PollDecisionMakingModel;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "poll_configs")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub poll_id: Uuid,
    pub decision_making_model: Option<PollDecisionMakingModel>,
    pub disagreements_limit: Option<i32>,
    pub abstains_limit: Option<i32>,
    pub agreement_threshold: Option<i32>,
    pub quorum_enabled: Option<bool>,
    pub quorum_threshold: Option<i32>,
    pub blocks_open_to_all: Option<bool>,
    pub multiple_choice: Option<bool>,
    pub closing_at: Option<DateTimeWithTimeZone>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::polls::Entity",
        from = "Column::PollId",
        to = "super::polls::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Poll,
}

impl Related<super::polls::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Poll.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
