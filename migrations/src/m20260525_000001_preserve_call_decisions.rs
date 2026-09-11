use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub(crate) struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_foreign_key(
                ForeignKey::drop()
                    .name("polls-call-id-fkey")
                    .table(Polls::Table)
                    .to_owned(),
            )
            .await?;
        manager
            .create_foreign_key(
                ForeignKey::create()
                    .name("polls-call-id-fkey")
                    .from(Polls::Table, Polls::CallId)
                    .to(Calls::Table, Calls::Id)
                    .on_delete(ForeignKeyAction::SetNull)
                    .on_update(ForeignKeyAction::Cascade)
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_foreign_key(
                ForeignKey::drop()
                    .name("polls-call-id-fkey")
                    .table(Polls::Table)
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
            .await
    }
}

#[derive(DeriveIden)]
enum Calls {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Polls {
    Table,
    CallId,
}
