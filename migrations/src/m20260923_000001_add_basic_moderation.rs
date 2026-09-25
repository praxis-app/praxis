use sea_orm::{sea_query::Expr, ConnectionTrait, DbBackend};
use sea_orm_migration::prelude::{sea_query::extension::postgres::Type, *};

const ACTION_ENUM: &str = "moderation_actions_action_enum";
const TARGET_KIND_ENUM: &str = "moderation_actions_target_kind_enum";

const ACTIONS: [&str; 10] = [
    "remove_message",
    "remove_forum_post",
    "remove_member",
    "ban_member",
    "unban_member",
    "suspend_user",
    "restore_user",
    "delete_user",
    "remove_call_participant",
    "end_call",
];

const TARGET_KINDS: [&str; 4] = ["message", "forum_post", "user", "call"];

const SERVER_SUBJECTS: [&str; 7] = [
    "ServerConfig",
    "Channel",
    "Invite",
    "Message",
    "ServerRole",
    "ProposalBlock",
    "all",
];
const NEW_SERVER_SUBJECTS: [&str; 2] = ["ServerMember", "Call"];

const INSTANCE_SUBJECTS: [&str; 4] =
    ["InstanceConfig", "InstanceRole", "Server", "all"];
const NEW_INSTANCE_SUBJECTS: [&str; 3] = ["Message", "Call", "User"];

const SERVER_SUBJECT_ENUMS: [(&str, &str); 2] = [
    (
        "server_role_permissions_subject_enum",
        "server_role_permissions",
    ),
    (
        "poll_action_permissions_subject_enum",
        "poll_action_permissions",
    ),
];
const INSTANCE_SUBJECT_ENUM: (&str, &str) = (
    "instance_role_permissions_subject_enum",
    "instance_role_permissions",
);

#[derive(DeriveMigrationName)]
pub(crate) struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        add_permission_subjects(manager).await?;
        create_server_bans(manager).await?;
        create_moderation_enums(manager).await?;
        create_moderation_actions(manager).await?;
        add_moderation_columns(manager).await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        drop_moderation_columns(manager).await?;
        manager
            .drop_table(
                Table::drop().table(ModerationActions::Table).to_owned(),
            )
            .await?;
        drop_moderation_enums(manager).await?;
        manager
            .drop_table(Table::drop().table(ServerBans::Table).to_owned())
            .await?;
        remove_permission_subjects(manager).await
    }
}

async fn add_permission_subjects(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    if manager.get_database_backend() != DbBackend::Postgres {
        return Ok(());
    }

    let mut enum_values = Vec::new();
    for (enum_name, _) in SERVER_SUBJECT_ENUMS {
        for value in NEW_SERVER_SUBJECTS {
            enum_values.push((enum_name, value));
        }
    }
    for value in NEW_INSTANCE_SUBJECTS {
        enum_values.push((INSTANCE_SUBJECT_ENUM.0, value));
    }

    for (enum_name, value) in enum_values {
        manager
            .get_connection()
            .execute_unprepared(&format!(
                "ALTER TYPE {enum_name} ADD VALUE IF NOT EXISTS '{value}'"
            ))
            .await?;
    }

    Ok(())
}

async fn remove_permission_subjects(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    for (enum_name, table_name) in SERVER_SUBJECT_ENUMS {
        rebuild_subject_enum(
            manager,
            enum_name,
            table_name,
            &SERVER_SUBJECTS,
            &NEW_SERVER_SUBJECTS,
        )
        .await?;
    }

    let (enum_name, table_name) = INSTANCE_SUBJECT_ENUM;
    rebuild_subject_enum(
        manager,
        enum_name,
        table_name,
        &INSTANCE_SUBJECTS,
        &NEW_INSTANCE_SUBJECTS,
    )
    .await
}

async fn rebuild_subject_enum(
    manager: &SchemaManager<'_>,
    enum_name: &str,
    table_name: &str,
    kept_values: &[&str],
    removed_values: &[&str],
) -> Result<(), DbErr> {
    if manager.get_database_backend() != DbBackend::Postgres {
        return Ok(());
    }

    let quote = |values: &[&str]| {
        values
            .iter()
            .map(|value| format!("'{value}'"))
            .collect::<Vec<_>>()
            .join(", ")
    };
    let kept = quote(kept_values);
    let removed = quote(removed_values);

    manager
        .get_connection()
        .execute_unprepared(&format!(
            r#"
            DELETE FROM {table_name} WHERE subject::text IN ({removed});
            ALTER TYPE {enum_name} RENAME TO {enum_name}_old;
            CREATE TYPE {enum_name} AS ENUM ({kept});
            ALTER TABLE {table_name}
                ALTER COLUMN subject TYPE {enum_name}
                USING subject::text::{enum_name};
            DROP TYPE {enum_name}_old;
            "#
        ))
        .await?;

    Ok(())
}

async fn create_server_bans(manager: &SchemaManager<'_>) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(ServerBans::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(ServerBans::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(ColumnDef::new(ServerBans::ServerId).uuid().not_null())
                .col(ColumnDef::new(ServerBans::UserId).uuid().not_null())
                .col(ColumnDef::new(ServerBans::BannedBy).uuid().not_null())
                .col(timestamp(ServerBans::CreatedAt))
                .index(
                    Index::create()
                        .name("server-bans-server-id-user-id-key")
                        .col(ServerBans::ServerId)
                        .col(ServerBans::UserId)
                        .unique(),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("server-bans-server-id-fkey")
                        .from(ServerBans::Table, ServerBans::ServerId)
                        .to(Servers::Table, Servers::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("server-bans-user-id-fkey")
                        .from(ServerBans::Table, ServerBans::UserId)
                        .to(Users::Table, Users::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("server-bans-banned-by-fkey")
                        .from(ServerBans::Table, ServerBans::BannedBy)
                        .to(Users::Table, Users::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .to_owned(),
        )
        .await?;

    manager
        .create_index(
            Index::create()
                .name("server-bans-user-id-idx")
                .table(ServerBans::Table)
                .col(ServerBans::UserId)
                .to_owned(),
        )
        .await
}

async fn create_moderation_enums(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    if manager.get_database_backend() != DbBackend::Postgres {
        return Ok(());
    }

    manager
        .create_type(
            Type::create()
                .as_enum(Alias::new(ACTION_ENUM))
                .values(ACTIONS.map(Alias::new))
                .to_owned(),
        )
        .await?;

    manager
        .create_type(
            Type::create()
                .as_enum(Alias::new(TARGET_KIND_ENUM))
                .values(TARGET_KINDS.map(Alias::new))
                .to_owned(),
        )
        .await
}

async fn drop_moderation_enums(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    if manager.get_database_backend() != DbBackend::Postgres {
        return Ok(());
    }

    manager
        .drop_type(Type::drop().name(Alias::new(TARGET_KIND_ENUM)).to_owned())
        .await?;
    manager
        .drop_type(Type::drop().name(Alias::new(ACTION_ENUM)).to_owned())
        .await
}

async fn create_moderation_actions(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(ModerationActions::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(ModerationActions::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(
                    ColumnDef::new(ModerationActions::ActorUserId)
                        .uuid()
                        .not_null(),
                )
                .col(
                    ColumnDef::new(ModerationActions::Action)
                        .enumeration(
                            Alias::new(ACTION_ENUM),
                            ACTIONS.map(Alias::new),
                        )
                        .not_null(),
                )
                .col(
                    ColumnDef::new(ModerationActions::TargetKind)
                        .enumeration(
                            Alias::new(TARGET_KIND_ENUM),
                            TARGET_KINDS.map(Alias::new),
                        )
                        .not_null(),
                )
                .col(
                    ColumnDef::new(ModerationActions::TargetId)
                        .uuid()
                        .not_null(),
                )
                .col(ColumnDef::new(ModerationActions::ServerId).uuid())
                .col(ColumnDef::new(ModerationActions::Reason).text())
                .col(timestamp(ModerationActions::CreatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("moderation-actions-actor-user-id-fkey")
                        .from(
                            ModerationActions::Table,
                            ModerationActions::ActorUserId,
                        )
                        .to(Users::Table, Users::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("moderation-actions-server-id-fkey")
                        .from(
                            ModerationActions::Table,
                            ModerationActions::ServerId,
                        )
                        .to(Servers::Table, Servers::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .to_owned(),
        )
        .await?;

    manager
        .create_index(
            Index::create()
                .name("moderation-actions-server-id-created-at-idx")
                .table(ModerationActions::Table)
                .col(ModerationActions::ServerId)
                .col((ModerationActions::CreatedAt, IndexOrder::Desc))
                .to_owned(),
        )
        .await?;

    manager
        .create_index(
            Index::create()
                .name("moderation-actions-target-idx")
                .table(ModerationActions::Table)
                .col(ModerationActions::TargetKind)
                .col(ModerationActions::TargetId)
                .to_owned(),
        )
        .await
}

async fn add_moderation_columns(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .alter_table(
            Table::alter()
                .table(Messages::Table)
                .add_column(
                    ColumnDef::new(Messages::ModeratedAt)
                        .timestamp_with_time_zone()
                        .null(),
                )
                .to_owned(),
        )
        .await?;

    manager
        .alter_table(
            Table::alter()
                .table(ForumPosts::Table)
                .add_column(
                    ColumnDef::new(ForumPosts::ModeratedAt)
                        .timestamp_with_time_zone()
                        .null(),
                )
                .modify_column(ColumnDef::new(ForumPosts::Ciphertext).null())
                .modify_column(ColumnDef::new(ForumPosts::Iv).null())
                .modify_column(ColumnDef::new(ForumPosts::Tag).null())
                .to_owned(),
        )
        .await?;

    manager
        .alter_table(
            Table::alter()
                .table(Users::Table)
                .add_column(
                    ColumnDef::new(Users::DeletedAt)
                        .timestamp_with_time_zone()
                        .null(),
                )
                .to_owned(),
        )
        .await
}

async fn drop_moderation_columns(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .alter_table(
            Table::alter()
                .table(Users::Table)
                .drop_column(Users::DeletedAt)
                .to_owned(),
        )
        .await?;

    manager
        .alter_table(
            Table::alter()
                .table(ForumPosts::Table)
                .drop_column(ForumPosts::ModeratedAt)
                .to_owned(),
        )
        .await?;

    manager
        .exec_stmt(
            Query::delete()
                .from_table(ForumPosts::Table)
                .cond_where(
                    Condition::any()
                        .add(Expr::col(ForumPosts::Ciphertext).is_null())
                        .add(Expr::col(ForumPosts::Iv).is_null())
                        .add(Expr::col(ForumPosts::Tag).is_null()),
                )
                .to_owned(),
        )
        .await?;

    manager
        .alter_table(
            Table::alter()
                .table(ForumPosts::Table)
                .modify_column(
                    ColumnDef::new(ForumPosts::Ciphertext).not_null(),
                )
                .modify_column(ColumnDef::new(ForumPosts::Iv).not_null())
                .modify_column(ColumnDef::new(ForumPosts::Tag).not_null())
                .to_owned(),
        )
        .await?;

    manager
        .alter_table(
            Table::alter()
                .table(Messages::Table)
                .drop_column(Messages::ModeratedAt)
                .to_owned(),
        )
        .await
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

#[derive(DeriveIden)]
enum ServerBans {
    Table,
    Id,
    ServerId,
    UserId,
    BannedBy,
    CreatedAt,
}

#[derive(DeriveIden)]
enum ModerationActions {
    Table,
    Id,
    ActorUserId,
    Action,
    TargetKind,
    TargetId,
    ServerId,
    Reason,
    CreatedAt,
}

#[derive(DeriveIden)]
enum Messages {
    Table,
    ModeratedAt,
}

#[derive(DeriveIden)]
enum ForumPosts {
    Table,
    Ciphertext,
    Iv,
    Tag,
    ModeratedAt,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
    DeletedAt,
}

#[derive(DeriveIden)]
enum Servers {
    Table,
    Id,
}
