use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "messages")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub ciphertext: Option<Vec<u8>>,
    pub iv: Option<Vec<u8>>,
    pub tag: Option<Vec<u8>>,
    pub channel_id: Uuid,
    pub call_id: Option<Uuid>,
    pub user_id: Uuid,
    pub bot_id: Option<Uuid>,
    pub command_status: Option<String>,
    pub key_id: Option<Uuid>,
    pub thread_root_id: Option<Uuid>,
    pub thread_poll_id: Option<Uuid>,
    pub parent_message_id: Option<Uuid>,
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
        belongs_to = "super::calls::Entity",
        from = "Column::CallId",
        to = "super::calls::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Call,
    #[sea_orm(has_many = "super::message_images::Entity")]
    Images,
    #[sea_orm(
        belongs_to = "Entity",
        from = "Column::ThreadRootId",
        to = "Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    ThreadRoot,
    #[sea_orm(
        belongs_to = "super::polls::Entity",
        from = "Column::ThreadPollId",
        to = "super::polls::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    ThreadPoll,
    #[sea_orm(
        belongs_to = "Entity",
        from = "Column::ParentMessageId",
        to = "Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    ParentMessage,
    #[sea_orm(has_one = "super::forum_posts::Entity")]
    RootForumPost,
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

impl Related<super::calls::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Call.def()
    }
}

impl Related<super::message_images::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Images.def()
    }
}

impl Related<super::forum_posts::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::RootForumPost.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
