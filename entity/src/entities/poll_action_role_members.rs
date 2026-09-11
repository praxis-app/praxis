use sea_orm::entity::prelude::*;

use crate::enums::PollActionRoleMemberChangeType;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "poll_action_role_members")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub poll_action_role_id: Uuid,
    pub user_id: Uuid,
    pub change_type: PollActionRoleMemberChangeType,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::poll_action_roles::Entity",
        from = "Column::PollActionRoleId",
        to = "super::poll_action_roles::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    PollActionRole,
    #[sea_orm(
        belongs_to = "super::users::Entity",
        from = "Column::UserId",
        to = "super::users::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    User,
}

impl Related<super::poll_action_roles::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PollActionRole.def()
    }
}

impl Related<super::users::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
