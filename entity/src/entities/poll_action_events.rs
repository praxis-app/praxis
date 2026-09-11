use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "poll_action_events")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub poll_action_id: Uuid,
    pub name: String,
    pub description: String,
    pub starts_at: DateTimeWithTimeZone,
    pub ends_at: Option<DateTimeWithTimeZone>,
    pub online: bool,
    pub location: Option<String>,
    pub external_link: Option<String>,
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
    #[sea_orm(has_many = "super::poll_action_event_hosts::Entity")]
    Hosts,
}

impl Related<super::poll_actions::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PollAction.def()
    }
}

impl Related<super::poll_action_event_hosts::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Hosts.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
