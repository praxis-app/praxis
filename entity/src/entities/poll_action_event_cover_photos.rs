use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "poll_action_event_cover_photos")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub poll_action_event_id: Uuid,
    pub storage_key: Option<String>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::poll_action_events::Entity",
        from = "Column::PollActionEventId",
        to = "super::poll_action_events::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    PollActionEvent,
}

impl Related<super::poll_action_events::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PollActionEvent.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
