use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "events")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub server_id: Uuid,
    pub source_poll_action_id: Option<Uuid>,
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
        belongs_to = "super::servers::Entity",
        from = "Column::ServerId",
        to = "super::servers::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Server,
    #[sea_orm(
        belongs_to = "super::poll_actions::Entity",
        from = "Column::SourcePollActionId",
        to = "super::poll_actions::Column::Id",
        on_update = "Cascade",
        on_delete = "SetNull"
    )]
    SourcePollAction,
    #[sea_orm(has_many = "super::event_attendees::Entity")]
    Attendees,
}

impl Related<super::servers::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Server.def()
    }
}

impl Related<super::poll_actions::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::SourcePollAction.def()
    }
}

impl Related<super::event_attendees::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Attendees.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
