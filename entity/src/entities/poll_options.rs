use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "poll_options")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub poll_id: Uuid,
    pub text: String,
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
    #[sea_orm(has_many = "super::poll_option_selections::Entity")]
    Selections,
}

impl Related<super::polls::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Poll.def()
    }
}

impl Related<super::poll_option_selections::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Selections.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
