use sea_orm::entity::prelude::*;

use crate::enums::{InstanceAbilitySubject, InstanceRoleAbilityAction};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "instance_role_permissions")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub instance_role_id: Uuid,
    pub subject: InstanceAbilitySubject,
    pub action: InstanceRoleAbilityAction,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::instance_roles::Entity",
        from = "Column::InstanceRoleId",
        to = "super::instance_roles::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    InstanceRole,
}

impl Related<super::instance_roles::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::InstanceRole.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
