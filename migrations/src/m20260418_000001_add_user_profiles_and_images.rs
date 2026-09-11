use sea_orm::sea_query::Expr;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub(crate) struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(UserImages::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(UserImages::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(UserImages::UserId).uuid().not_null())
                    .col(ColumnDef::new(UserImages::Kind).string().not_null())
                    .col(ColumnDef::new(UserImages::StorageKey).string())
                    .col(ColumnDef::new(UserImages::ContentType).string())
                    .col(
                        ColumnDef::new(UserImages::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .col(
                        ColumnDef::new(UserImages::UpdatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(Expr::current_timestamp()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("user-images-user-id-fkey")
                            .from(UserImages::Table, UserImages::UserId)
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
                    .name("user-images-user-id-kind-created-at-idx")
                    .table(UserImages::Table)
                    .col(UserImages::UserId)
                    .col(UserImages::Kind)
                    .col(UserImages::CreatedAt)
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(UserImages::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum UserImages {
    Table,
    Id,
    UserId,
    Kind,
    StorageKey,
    ContentType,
    CreatedAt,
    UpdatedAt,
}
