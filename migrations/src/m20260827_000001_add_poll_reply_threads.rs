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
                    .table(Messages::Table)
                    .add_column(ColumnDef::new(Messages::ThreadPollId).uuid())
                    .to_owned(),
            )
            .await?;
        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("messages-thread-poll-id-fkey")
                    .from(Messages::Table, Messages::ThreadPollId)
                    .to(Polls::Table, Polls::Id)
                    .on_delete(ForeignKeyAction::Cascade)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await?;
        manager
            .create_index(
                Index::create()
                    .name("messages-thread-poll-id-created-at-id-idx")
                    .table(Messages::Table)
                    .col(Messages::ThreadPollId)
                    .col(Messages::CreatedAt)
                    .col(Messages::Id)
                    .to_owned(),
            )
            .await?;

        if manager.get_database_backend() == DbBackend::Postgres {
            manager
                .get_connection()
                .execute_unprepared(
                    r#"ALTER TABLE messages ADD CONSTRAINT messages_one_thread_root_check CHECK (NOT (thread_root_id IS NOT NULL AND thread_poll_id IS NOT NULL))"#,
                )
                .await?;
        }

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        if manager.get_database_backend() == DbBackend::Postgres {
            manager
                .get_connection()
                .execute_unprepared(
                    r#"ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_one_thread_root_check"#,
                )
                .await?;
        }
        manager
            .drop_index(
                Index::drop()
                    .name("messages-thread-poll-id-created-at-id-idx")
                    .table(Messages::Table)
                    .to_owned(),
            )
            .await?;
        manager
            .alter_table(
                Table::alter()
                    .table(Messages::Table)
                    .drop_foreign_key(Alias::new(
                        "messages-thread-poll-id-fkey",
                    ))
                    .drop_column(Messages::ThreadPollId)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum Messages {
    Table,
    Id,
    ThreadPollId,
    CreatedAt,
}

#[derive(DeriveIden)]
enum Polls {
    Table,
    Id,
}
