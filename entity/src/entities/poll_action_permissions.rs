use sea_orm::entity::prelude::*;

use crate::enums::{
    PollActionPermissionAbilityAction, PollActionPermissionChangeType,
    PollActionPermissionSubject,
};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "poll_action_permissions")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub poll_action_role_id: Uuid,
    pub subject: PollActionPermissionSubject,
    pub action: PollActionPermissionAbilityAction,
    pub change_type: PollActionPermissionChangeType,
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
}

impl Related<super::poll_action_roles::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PollActionRole.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
