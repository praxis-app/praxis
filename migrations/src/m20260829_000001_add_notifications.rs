use sea_orm::{sea_query::Expr, ConnectionTrait, DbBackend};
use sea_orm_migration::prelude::{sea_query::extension::postgres::Type, *};

const KIND_ENUM: &str = "notifications_kind_enum";

const KINDS: [&str; 7] = [
    "new_message",
    "message_reply",
    "forum_reply",
    "proposal_vote",
    "proposal_ratified",
    "proposal_closed",
    "server_role_granted",
];

#[derive(DeriveMigrationName)]
pub(crate) struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        create_kind_enum(manager).await?;
        create_notifications(manager).await?;
        create_target_check(manager).await?;
        create_notification_indexes(manager).await?;
        create_dedup_indexes(manager).await?;
        create_unread_message_index(manager).await?;
        create_user_configs(manager).await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(UserConfigs::Table).to_owned())
            .await?;
        drop_unread_message_index(manager).await?;
        drop_dedup_indexes(manager).await?;
        drop_notification_indexes(manager).await?;
        manager
            .drop_table(Table::drop().table(Notifications::Table).to_owned())
            .await?;
        drop_kind_enum(manager).await
    }
}

async fn create_notifications(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(Notifications::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(Notifications::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(
                    ColumnDef::new(Notifications::RecipientUserId)
                        .uuid()
                        .not_null(),
                )
                .col(ColumnDef::new(Notifications::ActorUserId).uuid())
                .col(ColumnDef::new(Notifications::ServerId).uuid().not_null())
                .col(ColumnDef::new(Notifications::ChannelId).uuid())
                .col(
                    ColumnDef::new(Notifications::Kind)
                        .enumeration(
                            Alias::new(KIND_ENUM),
                            KINDS.map(Alias::new),
                        )
                        .not_null(),
                )
                .col(ColumnDef::new(Notifications::MessageId).uuid())
                .col(ColumnDef::new(Notifications::PollId).uuid())
                .col(ColumnDef::new(Notifications::ServerRoleId).uuid())
                .col(ColumnDef::new(Notifications::VoteType).enumeration(
                    Alias::new("votes_vote_type_enum"),
                    [
                        Alias::new("agree"),
                        Alias::new("disagree"),
                        Alias::new("abstain"),
                        Alias::new("block"),
                    ],
                ))
                .col(ColumnDef::new(Notifications::UnreadCount).integer())
                .col(
                    ColumnDef::new(Notifications::ReadAt)
                        .timestamp_with_time_zone(),
                )
                .col(timestamp(Notifications::CreatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("notifications-recipient-user-id-fkey")
                        .from(
                            Notifications::Table,
                            Notifications::RecipientUserId,
                        )
                        .to(Users::Table, Users::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("notifications-actor-user-id-fkey")
                        .from(Notifications::Table, Notifications::ActorUserId)
                        .to(Users::Table, Users::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("notifications-server-id-fkey")
                        .from(Notifications::Table, Notifications::ServerId)
                        .to(Servers::Table, Servers::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("notifications-channel-id-fkey")
                        .from(Notifications::Table, Notifications::ChannelId)
                        .to(Channels::Table, Channels::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("notifications-message-id-fkey")
                        .from(Notifications::Table, Notifications::MessageId)
                        .to(Messages::Table, Messages::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("notifications-poll-id-fkey")
                        .from(Notifications::Table, Notifications::PollId)
                        .to(Polls::Table, Polls::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("notifications-server-role-id-fkey")
                        .from(Notifications::Table, Notifications::ServerRoleId)
                        .to(ServerRoles::Table, ServerRoles::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .to_owned(),
        )
        .await
}

async fn create_kind_enum(manager: &SchemaManager<'_>) -> Result<(), DbErr> {
    if manager.get_database_backend() == DbBackend::Postgres {
        manager
            .create_type(
                Type::create()
                    .as_enum(Alias::new(KIND_ENUM))
                    .values(KINDS.map(Alias::new))
                    .to_owned(),
            )
            .await?;
    }

    Ok(())
}

async fn drop_kind_enum(manager: &SchemaManager<'_>) -> Result<(), DbErr> {
    if manager.get_database_backend() == DbBackend::Postgres {
        manager
            .drop_type(Type::drop().name(Alias::new(KIND_ENUM)).to_owned())
            .await?;
    }

    Ok(())
}

async fn create_target_check(manager: &SchemaManager<'_>) -> Result<(), DbErr> {
    if manager.get_database_backend() == DbBackend::Postgres {
        manager
            .get_connection()
            .execute_unprepared(
                r#"ALTER TABLE notifications ADD CONSTRAINT notifications_one_target_check CHECK (num_nonnulls(message_id, poll_id, server_role_id) = 1)"#,
            )
            .await?;
    }

    Ok(())
}

async fn create_dedup_indexes(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    if manager.get_database_backend() != DbBackend::Postgres {
        return Ok(());
    }

    for (name, columns, filter) in DEDUP_INDEXES {
        manager
            .get_connection()
            .execute_unprepared(&format!(
                r#"CREATE UNIQUE INDEX "{name}" ON notifications ({columns}) WHERE {filter}"#
            ))
            .await?;
    }

    Ok(())
}

async fn create_user_configs(manager: &SchemaManager<'_>) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(UserConfigs::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(UserConfigs::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(
                    ColumnDef::new(UserConfigs::UserId)
                        .uuid()
                        .not_null()
                        .unique_key(),
                )
                .col(notifications_enabled(
                    UserConfigs::MessageNotificationsEnabled,
                ))
                .col(notifications_enabled(
                    UserConfigs::ReplyNotificationsEnabled,
                ))
                .col(notifications_enabled(
                    UserConfigs::ProposalNotificationsEnabled,
                ))
                .col(notifications_enabled(
                    UserConfigs::RoleNotificationsEnabled,
                ))
                .col(timestamp(UserConfigs::CreatedAt))
                .col(timestamp(UserConfigs::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("user-configs-user-id-fkey")
                        .from(UserConfigs::Table, UserConfigs::UserId)
                        .to(Users::Table, Users::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .to_owned(),
        )
        .await
}

async fn create_unread_message_index(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    if manager.get_database_backend() != DbBackend::Postgres {
        return manager
            .create_index(
                Index::create()
                    .name(UNREAD_MESSAGE_INDEX)
                    .table(Messages::Table)
                    .col(Messages::ChannelId)
                    .col(Messages::CreatedAt)
                    .to_owned(),
            )
            .await;
    }

    manager
        .get_connection()
        .execute_unprepared(&format!(
            r#"CREATE INDEX "{UNREAD_MESSAGE_INDEX}" ON messages (channel_id, created_at) WHERE call_id IS NULL"#
        ))
        .await?;

    Ok(())
}

async fn drop_unread_message_index(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .drop_index(
            Index::drop()
                .name(UNREAD_MESSAGE_INDEX)
                .table(Messages::Table)
                .to_owned(),
        )
        .await
}

async fn drop_dedup_indexes(manager: &SchemaManager<'_>) -> Result<(), DbErr> {
    for (name, _, _) in DEDUP_INDEXES {
        manager
            .drop_index(
                Index::drop()
                    .name(name)
                    .table(Notifications::Table)
                    .to_owned(),
            )
            .await?;
    }

    Ok(())
}

async fn create_notification_indexes(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_index(
            Index::create()
                .name("notifications-recipient-created-at-id-idx")
                .table(Notifications::Table)
                .col(Notifications::RecipientUserId)
                .col((Notifications::CreatedAt, IndexOrder::Desc))
                .col((Notifications::Id, IndexOrder::Desc))
                .to_owned(),
        )
        .await?;

    manager
        .create_index(
            Index::create()
                .name("notifications-recipient-read-at-created-at-idx")
                .table(Notifications::Table)
                .col(Notifications::RecipientUserId)
                .col(Notifications::ReadAt)
                .col((Notifications::CreatedAt, IndexOrder::Desc))
                .to_owned(),
        )
        .await?;

    for (name, column) in TARGET_INDEXES {
        manager
            .create_index(
                Index::create()
                    .name(name)
                    .table(Notifications::Table)
                    .col(column)
                    .to_owned(),
            )
            .await?;
    }

    Ok(())
}

async fn drop_notification_indexes(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    for (name, _) in TARGET_INDEXES {
        manager
            .drop_index(
                Index::drop()
                    .name(name)
                    .table(Notifications::Table)
                    .to_owned(),
            )
            .await?;
    }

    manager
        .drop_index(
            Index::drop()
                .name("notifications-recipient-read-at-created-at-idx")
                .table(Notifications::Table)
                .to_owned(),
        )
        .await?;

    manager
        .drop_index(
            Index::drop()
                .name("notifications-recipient-created-at-id-idx")
                .table(Notifications::Table)
                .to_owned(),
        )
        .await
}

/// The natural key differs by kind, so each gets its own partial unique index
const DEDUP_INDEXES: [(&str, &str, &str); 5] = [
    (
        "notifications-new-message-key",
        "recipient_user_id, channel_id",
        "kind = 'new_message' AND read_at IS NULL",
    ),
    (
        "notifications-reply-key",
        "recipient_user_id, message_id",
        "kind IN ('message_reply', 'forum_reply')",
    ),
    (
        "notifications-proposal-vote-key",
        "recipient_user_id, poll_id, actor_user_id",
        "kind = 'proposal_vote'",
    ),
    (
        "notifications-proposal-outcome-key",
        "recipient_user_id, kind, poll_id",
        "kind IN ('proposal_ratified', 'proposal_closed')",
    ),
    (
        "notifications-server-role-granted-key",
        "recipient_user_id, server_role_id",
        "kind = 'server_role_granted'",
    ),
];

const UNREAD_MESSAGE_INDEX: &str = "messages-channel-id-created-at-unread-idx";

const TARGET_INDEXES: [(&str, Notifications); 3] = [
    ("notifications-message-id-idx", Notifications::MessageId),
    ("notifications-poll-id-idx", Notifications::PollId),
    (
        "notifications-server-role-id-idx",
        Notifications::ServerRoleId,
    ),
];

fn notifications_enabled<T>(column: T) -> ColumnDef
where
    T: IntoIden,
{
    ColumnDef::new(column)
        .boolean()
        .not_null()
        .default(true)
        .take()
}

fn timestamp<T>(column: T) -> ColumnDef
where
    T: IntoIden,
{
    let mut column = ColumnDef::new(column);
    column
        .timestamp_with_time_zone()
        .not_null()
        .default(Expr::current_timestamp());
    column
}

#[derive(Clone, Copy, DeriveIden)]
enum Notifications {
    Table,
    Id,
    RecipientUserId,
    ActorUserId,
    ServerId,
    ChannelId,
    Kind,
    MessageId,
    PollId,
    ServerRoleId,
    VoteType,
    UnreadCount,
    ReadAt,
    CreatedAt,
}

#[derive(DeriveIden)]
enum UserConfigs {
    Table,
    Id,
    UserId,
    MessageNotificationsEnabled,
    ReplyNotificationsEnabled,
    ProposalNotificationsEnabled,
    RoleNotificationsEnabled,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Servers {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Channels {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Messages {
    Table,
    Id,
    ChannelId,
    CreatedAt,
}

#[derive(DeriveIden)]
enum Polls {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum ServerRoles {
    Table,
    Id,
}
