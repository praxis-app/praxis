use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "users")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub name: String,
    pub display_name: Option<String>,
    pub email: Option<String>,
    pub password: Option<String>,
    pub bio: Option<String>,
    pub anonymous: bool,
    pub locked: bool,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::user_images::Entity")]
    UserImages,
    #[sea_orm(has_many = "super::forum_posts::Entity")]
    ForumPosts,
    #[sea_orm(has_many = "super::poll_action_event_hosts::Entity")]
    PollActionEventHosts,
    #[sea_orm(has_many = "super::event_attendees::Entity")]
    EventAttendances,
}

impl Related<super::user_images::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::UserImages.def()
    }
}

impl Related<super::forum_posts::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ForumPosts.def()
    }
}

impl Related<super::poll_action_event_hosts::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PollActionEventHosts.def()
    }
}

impl Related<super::event_attendees::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::EventAttendances.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
