use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "poll_action_roles")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub poll_action_id: Uuid,
    pub server_role_id: Option<Uuid>,
    pub name: Option<String>,
    pub color: Option<String>,
    pub prev_name: Option<String>,
    pub prev_color: Option<String>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::poll_actions::Entity",
        from = "Column::PollActionId",
        to = "super::poll_actions::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    PollAction,
    #[sea_orm(
        belongs_to = "super::server_roles::Entity",
        from = "Column::ServerRoleId",
        to = "super::server_roles::Column::Id",
        on_update = "Cascade",
        on_delete = "Cascade"
    )]
    ServerRole,
    #[sea_orm(has_many = "super::poll_action_permissions::Entity")]
    Permissions,
    #[sea_orm(has_many = "super::poll_action_role_members::Entity")]
    Members,
}

impl Related<super::poll_actions::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PollAction.def()
    }
}

impl Related<super::server_roles::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::ServerRole.def()
    }
}

impl Related<super::poll_action_permissions::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Permissions.def()
    }
}

impl Related<super::poll_action_role_members::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Members.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
