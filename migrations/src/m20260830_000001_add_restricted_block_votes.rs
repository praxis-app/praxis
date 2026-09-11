use sea_orm::{ConnectionTrait, DbBackend};
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub(crate) struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(ServerConfigs::Table)
                    .add_column(
                        ColumnDef::new(ServerConfigs::BlocksRestricted)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(PollConfigs::Table)
                    .add_column(
                        ColumnDef::new(PollConfigs::BlocksRestricted).boolean(),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(PollActionServerConfigs::Table)
                    .add_column(
                        ColumnDef::new(
                            PollActionServerConfigs::BlocksRestricted,
                        )
                        .boolean(),
                    )
                    .add_column(
                        ColumnDef::new(
                            PollActionServerConfigs::PrevBlocksRestricted,
                        )
                        .boolean(),
                    )
                    .to_owned(),
            )
            .await?;

        add_subject_enum_value(manager, "server_role_permissions_subject_enum")
            .await?;
        add_subject_enum_value(manager, "poll_action_permissions_subject_enum")
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        remove_subject_enum_value(
            manager,
            "poll_action_permissions_subject_enum",
            "poll_action_permissions",
        )
        .await?;
        remove_subject_enum_value(
            manager,
            "server_role_permissions_subject_enum",
            "server_role_permissions",
        )
        .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(PollActionServerConfigs::Table)
                    .drop_column(PollActionServerConfigs::BlocksRestricted)
                    .drop_column(PollActionServerConfigs::PrevBlocksRestricted)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(PollConfigs::Table)
                    .drop_column(PollConfigs::BlocksRestricted)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(ServerConfigs::Table)
                    .drop_column(ServerConfigs::BlocksRestricted)
                    .to_owned(),
            )
            .await
    }
}

async fn add_subject_enum_value(
    manager: &SchemaManager<'_>,
    enum_name: &str,
) -> Result<(), DbErr> {
    if manager.get_database_backend() != DbBackend::Postgres {
        return Ok(());
    }

    manager
        .get_connection()
        .execute_unprepared(&format!(
            "ALTER TYPE {enum_name} ADD VALUE IF NOT EXISTS 'ProposalBlock'"
        ))
        .await?;

    Ok(())
}

/// Postgres cannot drop a single enum value, so the type is rebuilt without it
async fn remove_subject_enum_value(
    manager: &SchemaManager<'_>,
    enum_name: &str,
    table_name: &str,
) -> Result<(), DbErr> {
    if manager.get_database_backend() != DbBackend::Postgres {
        return Ok(());
    }

    manager
        .get_connection()
        .execute_unprepared(&format!(
            r#"
            DELETE FROM {table_name} WHERE subject = 'ProposalBlock';
            ALTER TYPE {enum_name} RENAME TO {enum_name}_old;
            CREATE TYPE {enum_name} AS ENUM (
                'ServerConfig', 'Channel', 'Invite', 'Message',
                'ServerRole', 'all'
            );
            ALTER TABLE {table_name}
                ALTER COLUMN subject TYPE {enum_name}
                USING subject::text::{enum_name};
            DROP TYPE {enum_name}_old;
            "#
        ))
        .await?;

    Ok(())
}

#[derive(DeriveIden)]
enum ServerConfigs {
    Table,
    BlocksRestricted,
}

#[derive(DeriveIden)]
enum PollConfigs {
    Table,
    BlocksRestricted,
}

#[derive(DeriveIden)]
enum PollActionServerConfigs {
    Table,
    BlocksRestricted,
    PrevBlocksRestricted,
}
