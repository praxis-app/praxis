use sea_orm::{sea_query::Expr, DbBackend};
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub(crate) struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Calls::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Calls::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Calls::ServerId).uuid().not_null())
                    .col(ColumnDef::new(Calls::ChannelId).uuid().not_null())
                    .col(ColumnDef::new(Calls::LivekitRoom).string().not_null())
                    .col(
                        ColumnDef::new(Calls::Status)
                            .string()
                            .not_null()
                            .default("starting"),
                    )
                    .col(ColumnDef::new(Calls::StartedBy).uuid().not_null())
                    .col(ColumnDef::new(Calls::EndedBy).uuid())
                    .col(ColumnDef::new(Calls::EndedReason).string())
                    .col(
                        ColumnDef::new(Calls::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(Calls::UpdatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("calls-server-id-fkey")
                            .from(Calls::Table, Calls::ServerId)
                            .to(Servers::Table, Servers::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("calls-channel-id-fkey")
                            .from(Calls::Table, Calls::ChannelId)
                            .to(Channels::Table, Channels::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("calls-started-by-fkey")
                            .from(Calls::Table, Calls::StartedBy)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("calls-ended-by-fkey")
                            .from(Calls::Table, Calls::EndedBy)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::SetNull)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .index(
                        Index::create()
                            .name("calls-livekit-room-key")
                            .col(Calls::LivekitRoom)
                            .unique(),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Messages::Table)
                    .add_column(ColumnDef::new(Messages::CallId).uuid())
                    .to_owned(),
            )
            .await?;
        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("messages-call-id-fkey")
                    .from(Messages::Table, Messages::CallId)
                    .to(Calls::Table, Calls::Id)
                    .on_delete(ForeignKeyAction::Cascade)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Polls::Table)
                    .add_column(ColumnDef::new(Polls::CallId).uuid())
                    .to_owned(),
            )
            .await?;
        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("polls-call-id-fkey")
                    .from(Polls::Table, Polls::CallId)
                    .to(Calls::Table, Calls::Id)
                    .on_delete(ForeignKeyAction::Cascade)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await?;

        if manager.get_database_backend() == DbBackend::Postgres {
            manager
                .get_connection()
                .execute_unprepared(
                    r#"CREATE UNIQUE INDEX "calls-one-active-per-channel-key" ON calls (channel_id) WHERE status IN ('starting', 'active')"#,
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
                    r#"DROP INDEX IF EXISTS "calls-one-active-per-channel-key""#,
                )
                .await?;
        }

        manager
            .alter_table(
                Table::alter()
                    .table(Polls::Table)
                    .drop_foreign_key(Alias::new("polls-call-id-fkey"))
                    .drop_column(Polls::CallId)
                    .to_owned(),
            )
            .await?;
        manager
            .alter_table(
                Table::alter()
                    .table(Messages::Table)
                    .drop_foreign_key(Alias::new("messages-call-id-fkey"))
                    .drop_column(Messages::CallId)
                    .to_owned(),
            )
            .await?;
        manager
            .drop_table(Table::drop().table(Calls::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Calls {
    Table,
    Id,
    ServerId,
    ChannelId,
    LivekitRoom,
    Status,
    StartedBy,
    EndedBy,
    EndedReason,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Messages {
    Table,
    CallId,
}

#[derive(DeriveIden)]
enum Polls {
    Table,
    CallId,
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
enum Users {
    Table,
    Id,
}
