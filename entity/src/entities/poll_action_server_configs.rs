use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "poll_action_server_configs")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub poll_action_id: Uuid,
    pub anonymous_users_enabled: Option<bool>,
    pub prev_anonymous_users_enabled: Option<bool>,
    pub decision_making_model: Option<String>,
    pub prev_decision_making_model: Option<String>,
    pub disagreements_limit: Option<i32>,
    pub prev_disagreements_limit: Option<i32>,
    pub abstains_limit: Option<i32>,
    pub prev_abstains_limit: Option<i32>,
    pub agreement_threshold: Option<i32>,
    pub prev_agreement_threshold: Option<i32>,
    pub quorum_enabled: Option<bool>,
    pub prev_quorum_enabled: Option<bool>,
    pub quorum_threshold: Option<i32>,
    pub prev_quorum_threshold: Option<i32>,
    pub voting_time_limit: Option<i32>,
    pub prev_voting_time_limit: Option<i32>,
    pub blocks_open_to_all: Option<bool>,
    pub prev_blocks_open_to_all: Option<bool>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::poll_actions::Entity",
        from = "Column::PollActionId",
        to = "super::poll_actions::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    PollAction,
}

impl Related<super::poll_actions::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PollAction.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
