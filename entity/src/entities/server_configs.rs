use sea_orm::entity::prelude::*;

use crate::enums::ServerDecisionMakingModel;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "server_configs")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub server_id: Uuid,
    pub decision_making_model: ServerDecisionMakingModel,
    pub disagreements_limit: i32,
    pub abstains_limit: i32,
    pub agreement_threshold: i32,
    pub quorum_enabled: bool,
    pub quorum_threshold: i32,
    pub voting_time_limit: i32,
    pub blocks_open_to_all: bool,
    pub anonymous_users_enabled: bool,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::servers::Entity",
        from = "Column::ServerId",
        to = "super::servers::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Server,
}

impl Related<super::servers::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Server.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
