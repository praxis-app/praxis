use sea_orm::entity::prelude::*;

use crate::enums::{NotificationKind, VoteType};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "notifications")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub recipient_user_id: Uuid,
    pub actor_user_id: Option<Uuid>,
    pub server_id: Uuid,
    pub channel_id: Option<Uuid>,
    pub kind: NotificationKind,
    pub message_id: Option<Uuid>,
    pub poll_id: Option<Uuid>,
    pub server_role_id: Option<Uuid>,
    pub event_id: Option<Uuid>,
    pub vote_type: Option<VoteType>,
    pub unread_count: Option<i32>,
    pub read_at: Option<DateTimeWithTimeZone>,
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::users::Entity",
        from = "Column::RecipientUserId",
        to = "super::users::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Recipient,
    #[sea_orm(
        belongs_to = "super::users::Entity",
        from = "Column::ActorUserId",
        to = "super::users::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Actor,
    #[sea_orm(
        belongs_to = "super::servers::Entity",
        from = "Column::ServerId",
        to = "super::servers::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Server,
    #[sea_orm(
        belongs_to = "super::channels::Entity",
        from = "Column::ChannelId",
        to = "super::channels::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Channel,
    #[sea_orm(
        belongs_to = "super::messages::Entity",
        from = "Column::MessageId",
        to = "super::messages::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Message,
    #[sea_orm(
        belongs_to = "super::polls::Entity",
        from = "Column::PollId",
        to = "super::polls::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Poll,
    #[sea_orm(
        belongs_to = "super::events::Entity",
        from = "Column::EventId",
        to = "super::events::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Event,
    #[sea_orm(
        belongs_to = "super::server_roles::Entity",
        from = "Column::ServerRoleId",
        to = "super::server_roles::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    ServerRole,
}

impl Related<super::servers::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Server.def()
    }
}

impl Related<super::channels::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Channel.def()
    }
}

impl Related<super::messages::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Message.def()
    }
}

impl Related<super::polls::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Poll.def()
    }
}

impl Related<super::events::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Event.def()
    }
}

impl Related<super::server_roles::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ServerRole.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
