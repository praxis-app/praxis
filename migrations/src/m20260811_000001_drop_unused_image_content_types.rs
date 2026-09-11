use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub(crate) struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        drop_content_type(
            manager,
            MessageImages::Table,
            MessageImages::ContentType,
        )
        .await?;
        drop_content_type(manager, UserImages::Table, UserImages::ContentType)
            .await?;
        drop_content_type(manager, PollImages::Table, PollImages::ContentType)
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        add_content_type(
            manager,
            MessageImages::Table,
            MessageImages::ContentType,
        )
        .await?;
        add_content_type(manager, UserImages::Table, UserImages::ContentType)
            .await?;
        add_content_type(manager, PollImages::Table, PollImages::ContentType)
            .await
    }
}

async fn drop_content_type<T: Iden + 'static, C: Iden + 'static>(
    manager: &SchemaManager<'_>,
    table: T,
    column: C,
) -> Result<(), DbErr> {
    manager
        .alter_table(Table::alter().table(table).drop_column(column).to_owned())
        .await
}

async fn add_content_type<T: Iden + 'static, C: Iden + 'static>(
    manager: &SchemaManager<'_>,
    table: T,
    column: C,
) -> Result<(), DbErr> {
    manager
        .alter_table(
            Table::alter()
                .table(table)
                .add_column(ColumnDef::new(column).string())
                .to_owned(),
        )
        .await
}

#[derive(DeriveIden)]
enum MessageImages {
    Table,
    ContentType,
}

#[derive(DeriveIden)]
enum UserImages {
    Table,
    ContentType,
}

#[derive(DeriveIden)]
enum PollImages {
    Table,
    ContentType,
}
