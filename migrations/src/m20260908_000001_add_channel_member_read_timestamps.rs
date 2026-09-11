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
                    .table(ChannelMembers::Table)
                    .add_column(
                        ColumnDef::new(ChannelMembers::LastReadAt)
                            .timestamp_with_time_zone()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        if manager.get_database_backend() == DbBackend::Postgres {
            manager
                .get_connection()
                .execute_unprepared(
                    r#"
                    UPDATE channel_members
                    SET last_read_at = messages.created_at
                    FROM messages
                    WHERE messages.id = channel_members.last_message_read_id
                    "#,
                )
                .await?;
        }

        manager
            .alter_table(
                Table::alter()
                    .table(ChannelMembers::Table)
                    .drop_column(ChannelMembers::LastMessageReadId)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .alter_table(
                Table::alter()
                    .table(ChannelMembers::Table)
                    .add_column(
                        ColumnDef::new(ChannelMembers::LastMessageReadId)
                            .uuid()
                            .null(),
                    )
                    .to_owned(),
            )
            .await?;

        if manager.get_database_backend() == DbBackend::Postgres {
            manager
                .get_connection()
                .execute_unprepared(
                    r#"
                    UPDATE channel_members
                    SET last_message_read_id = (
                        SELECT messages.id
                        FROM messages
                        WHERE messages.channel_id = channel_members.channel_id
                          AND messages.call_id IS NULL
                          AND messages.created_at <= channel_members.last_read_at
                        ORDER BY messages.created_at DESC
                        LIMIT 1
                    )
                    WHERE channel_members.last_read_at IS NOT NULL
                    "#,
                )
                .await?;
        }

        manager
            .alter_table(
                Table::alter()
                    .table(ChannelMembers::Table)
                    .drop_column(ChannelMembers::LastReadAt)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum ChannelMembers {
    Table,
    LastMessageReadId,
    LastReadAt,
}
