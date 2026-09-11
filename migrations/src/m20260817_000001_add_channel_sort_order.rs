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
                    .table(Channels::Table)
                    .add_column(
                        ColumnDef::new(Channels::SortOrder)
                            .integer()
                            .not_null()
                            .default(0),
                    )
                    .to_owned(),
            )
            .await?;

        if manager.get_database_backend() == DbBackend::Postgres {
            manager
                .get_connection()
                .execute_unprepared(
                    r#"
                    WITH ordered_channels AS (
                        SELECT id, ROW_NUMBER() OVER (
                            PARTITION BY server_id ORDER BY created_at, id
                        ) - 1 AS sort_order
                        FROM channels
                    )
                    UPDATE channels
                    SET sort_order = ordered_channels.sort_order
                    FROM ordered_channels
                    WHERE channels.id = ordered_channels.id
                    "#,
                )
                .await?;
        }

        manager
            .create_index(
                Index::create()
                    .name("channels-server-id-sort-order-idx")
                    .table(Channels::Table)
                    .col(Channels::ServerId)
                    .col(Channels::SortOrder)
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_index(
                Index::drop()
                    .name("channels-server-id-sort-order-idx")
                    .table(Channels::Table)
                    .to_owned(),
            )
            .await?;
        manager
            .alter_table(
                Table::alter()
                    .table(Channels::Table)
                    .drop_column(Channels::SortOrder)
                    .to_owned(),
            )
            .await
    }
}

#[derive(DeriveIden)]
enum Channels {
    Table,
    ServerId,
    SortOrder,
}
