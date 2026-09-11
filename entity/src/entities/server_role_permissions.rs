use sea_orm::entity::prelude::*;

use crate::enums::{ServerAbilitySubject, ServerRoleAbilityAction};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "server_role_permissions")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub server_role_id: Uuid,
    pub subject: ServerAbilitySubject,
    pub action: ServerRoleAbilityAction,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::server_roles::Entity",
        from = "Column::ServerRoleId",
        to = "super::server_roles::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    ServerRole,
}

impl Related<super::server_roles::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ServerRole.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
