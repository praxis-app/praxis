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
                    .table(PollActions::Table)
                    .add_column(
                        ColumnDef::new(PollActions::ExecutedAt)
                            .timestamp_with_time_zone(),
                    )
                    .to_owned(),
            )
            .await?;

        // Actions attached to already-ratified polls ran under the legacy
        // execution path. Mark them complete so deploying this migration does
        // not replay non-idempotent effects such as role creation
        if manager.get_database_backend() == DbBackend::Postgres {
            manager
                .get_connection()
                .execute_unprepared(
                    r#"UPDATE poll_actions SET executed_at = updated_at WHERE executed_at IS NULL AND poll_id IN (SELECT id FROM polls WHERE stage = 'ratified')"#,
                )
                .await?;
        }

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(PollActions::Table)
                    .drop_column(PollActions::ExecutedAt)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum PollActions {
    Table,
    ExecutedAt,
}
