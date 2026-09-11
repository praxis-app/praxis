use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub(crate) struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Users::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Users::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Users::Name).string().not_null())
                    .col(ColumnDef::new(Users::DisplayName).string())
                    .col(ColumnDef::new(Users::Email).string())
                    .col(ColumnDef::new(Users::Password).string())
                    .col(ColumnDef::new(Users::Bio).string())
                    .col(
                        ColumnDef::new(Users::Anonymous)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .col(
                        ColumnDef::new(Users::Locked)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .col(
                        ColumnDef::new(Users::CreatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(
                                sea_orm::sea_query::Expr::current_timestamp(),
                            ),
                    )
                    .col(
                        ColumnDef::new(Users::UpdatedAt)
                            .timestamp_with_time_zone()
                            .not_null()
                            .default(
                                sea_orm::sea_query::Expr::current_timestamp(),
                            ),
                    )
                    .index(
                        Index::create()
                            .name("users-email-key")
                            .col(Users::Email)
                            .unique(),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Users::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
    Name,
    DisplayName,
    Email,
    Password,
    Bio,
    Anonymous,
    Locked,
    CreatedAt,
    UpdatedAt,
}
