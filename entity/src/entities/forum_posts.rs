use sea_orm::entity::prelude::*;

use crate::enums::ForumPostStatus;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "forum_posts")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub channel_id: Uuid,
    pub source_channel_id: Option<Uuid>,
    pub user_id: Uuid,
    #[sea_orm(unique)]
    pub root_message_id: Uuid,
    #[sea_orm(unique)]
    pub poll_id: Option<Uuid>,
    pub ciphertext: Vec<u8>,
    pub iv: Vec<u8>,
    pub tag: Vec<u8>,
    pub key_id: Uuid,
    pub status: ForumPostStatus,
    pub latest_activity_at: DateTimeWithTimeZone,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::channels::Entity",
        from = "Column::ChannelId",
        to = "super::channels::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Channel,
    #[sea_orm(
        belongs_to = "super::users::Entity",
        from = "Column::UserId",
        to = "super::users::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    User,
    #[sea_orm(
        belongs_to = "super::messages::Entity",
        from = "Column::RootMessageId",
        to = "super::messages::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    RootMessage,
    #[sea_orm(
        belongs_to = "super::polls::Entity",
        from = "Column::PollId",
        to = "super::polls::Column::Id",
        on_update = "Cascade",
        on_delete = "Restrict"
    )]
    Poll,
    #[sea_orm(
        belongs_to = "super::channels::Entity",
        from = "Column::SourceChannelId",
        to = "super::channels::Column::Id",
        on_update = "Cascade",
        on_delete = "SetNull"
    )]
    SourceChannel,
}

impl Related<super::channels::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Channel.def()
    }
}

impl Related<super::users::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl Related<super::messages::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::RootMessage.def()
    }
}

impl Related<super::polls::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Poll.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
