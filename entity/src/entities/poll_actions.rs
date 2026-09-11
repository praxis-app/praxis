use sea_orm::entity::prelude::*;

use crate::enums::PollActionType;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "poll_actions")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub poll_id: Uuid,
    pub action_type: PollActionType,
    pub executed_at: Option<DateTimeWithTimeZone>,
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
    #[sea_orm(has_one = "super::poll_action_roles::Entity")]
    ServerRole,
    #[sea_orm(has_one = "super::poll_action_server_configs::Entity")]
    ServerConfig,
    #[sea_orm(has_one = "super::poll_action_events::Entity")]
    ProposedEvent,
    #[sea_orm(has_one = "super::events::Entity")]
    CreatedEvent,
}

impl Related<super::polls::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Poll.def()
    }
}

impl Related<super::poll_action_roles::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ServerRole.def()
    }
}

impl Related<super::poll_action_server_configs::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ServerConfig.def()
    }
}

impl Related<super::poll_action_events::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ProposedEvent.def()
    }
}

impl Related<super::events::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::CreatedEvent.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
