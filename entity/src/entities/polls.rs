use sea_orm::entity::prelude::*;

use crate::enums::{PollClosedReason, PollStage, PollType};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "polls")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub ciphertext: Option<Vec<u8>>,
    pub iv: Option<Vec<u8>>,
    pub tag: Option<Vec<u8>>,
    pub key_id: Option<Uuid>,
    pub stage: PollStage,
    pub closed_reason: Option<PollClosedReason>,
    pub poll_type: PollType,
    pub user_id: Uuid,
    pub channel_id: Uuid,
    pub call_id: Option<Uuid>,
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
        on_delete = "SetNull"
    )]
    Call,
    #[sea_orm(has_one = "super::poll_configs::Entity")]
    Config,
    #[sea_orm(has_one = "super::poll_actions::Entity")]
    Action,
    #[sea_orm(has_many = "super::poll_options::Entity")]
    Options,
    #[sea_orm(has_many = "super::votes::Entity")]
    Votes,
    #[sea_orm(has_many = "super::poll_images::Entity")]
    Images,
    #[sea_orm(has_one = "super::forum_posts::Entity")]
    ForumPost,
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

impl Related<super::poll_configs::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Config.def()
    }
}

impl Related<super::poll_actions::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Action.def()
    }
}

impl Related<super::poll_options::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Options.def()
    }
}

impl Related<super::votes::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Votes.def()
    }
}

impl Related<super::poll_images::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Images.def()
    }
}

impl Related<super::forum_posts::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ForumPost.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
