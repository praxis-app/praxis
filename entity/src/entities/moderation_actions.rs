use sea_orm::entity::prelude::*;

use crate::enums::{AuditLogOrigin, ModerationAction, ModerationTargetKind};

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "moderation_actions")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub actor_user_id: Option<Uuid>,
    pub action: ModerationAction,
    pub origin: AuditLogOrigin,
    pub target_kind: ModerationTargetKind,
    pub target_id: Uuid,
    pub server_id: Option<Uuid>,
    pub proposal_id: Option<Uuid>,
    pub channel_id: Option<Uuid>,
    pub target_label: Option<String>,
    pub server_label: Option<String>,
    pub before_value: Option<Json>,
    pub after_value: Option<Json>,
    pub reason: Option<String>,
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::users::Entity",
        from = "Column::ActorUserId",
        to = "super::users::Column::Id",
        on_update = "Cascade",
        on_delete = "SetNull"
    )]
    Actor,
    #[sea_orm(
        belongs_to = "super::servers::Entity",
        from = "Column::ServerId",
        to = "super::servers::Column::Id",
        on_update = "Cascade",
        on_delete = "SetNull"
    )]
    Server,
    #[sea_orm(
        belongs_to = "super::polls::Entity",
        from = "Column::ProposalId",
        to = "super::polls::Column::Id",
        on_update = "Cascade",
        on_delete = "SetNull"
    )]
    Proposal,
    #[sea_orm(
        belongs_to = "super::channels::Entity",
        from = "Column::ChannelId",
        to = "super::channels::Column::Id",
        on_update = "Cascade",
        on_delete = "SetNull"
    )]
    Channel,
}

impl Related<super::users::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Actor.def()
    }
}

impl Related<super::servers::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Server.def()
    }
}

impl Related<super::polls::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Proposal.def()
    }
}

impl Related<super::channels::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Channel.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
