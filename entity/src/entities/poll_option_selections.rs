use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "poll_option_selections")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub vote_id: Uuid,
    pub poll_option_id: Uuid,
    pub rank: Option<i32>,
    pub score: Option<i32>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::votes::Entity",
        from = "Column::VoteId",
        to = "super::votes::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    Vote,
    #[sea_orm(
        belongs_to = "super::poll_options::Entity",
        from = "Column::PollOptionId",
        to = "super::poll_options::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    PollOption,
}

impl Related<super::votes::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Vote.def()
    }
}

impl Related<super::poll_options::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PollOption.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
