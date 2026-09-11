use sea_orm::{sea_query::Expr, DbBackend};
use sea_orm_migration::prelude::{sea_query::extension::postgres::Type, *};

#[derive(DeriveMigrationName)]
pub(crate) struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        create_enum_type(manager, "channel_type", &["text", "forum"]).await?;
        create_enum_type(manager, "forum_post_status", &["open", "closed"])
            .await?;

        manager
            .alter_table(
                Table::alter()
                    .table(Channels::Table)
                    .add_column(
                        ColumnDef::new(Channels::ChannelType)
                            .enumeration(
                                Alias::new("channel_type"),
                                [Alias::new("text"), Alias::new("forum")],
                            )
                            .not_null()
                            .default("text"),
                    )
                    .to_owned(),
            )
            .await?;

        let thread_root_foreign_key = TableForeignKey::new()
            .name("messages-thread-root-id-fkey")
            .from_tbl(Messages::Table)
            .from_col(Messages::ThreadRootId)
            .to_tbl(Messages::Table)
            .to_col(Messages::Id)
            .on_delete(ForeignKeyAction::Cascade)
            .on_update(ForeignKeyAction::Cascade)
            .to_owned();
        let parent_message_foreign_key = TableForeignKey::new()
            .name("messages-parent-message-id-fkey")
            .from_tbl(Messages::Table)
            .from_col(Messages::ParentMessageId)
            .to_tbl(Messages::Table)
            .to_col(Messages::Id)
            .on_delete(ForeignKeyAction::Cascade)
            .on_update(ForeignKeyAction::Cascade)
            .to_owned();

        manager
            .alter_table(
                Table::alter()
                    .table(Messages::Table)
                    .add_column(ColumnDef::new(Messages::ThreadRootId).uuid())
                    .add_column(
                        ColumnDef::new(Messages::ParentMessageId).uuid(),
                    )
                    .add_foreign_key(&thread_root_foreign_key)
                    .add_foreign_key(&parent_message_foreign_key)
                    .to_owned(),
            )
            .await?;

        manager
            .create_table(
                Table::create()
                    .table(ForumPosts::Table)
                    .col(
                        ColumnDef::new(ForumPosts::Id)
                            .uuid()
                            .not_null()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(ForumPosts::ChannelId).uuid().not_null(),
                    )
                    .col(ColumnDef::new(ForumPosts::SourceChannelId).uuid())
                    .col(ColumnDef::new(ForumPosts::UserId).uuid().not_null())
                    .col(
                        ColumnDef::new(ForumPosts::RootMessageId)
                            .uuid()
                            .not_null(),
                    )
                    .col(ColumnDef::new(ForumPosts::PollId).uuid())
                    .col(
                        ColumnDef::new(ForumPosts::Ciphertext)
                            .binary()
                            .not_null(),
                    )
                    .col(ColumnDef::new(ForumPosts::Iv).binary().not_null())
                    .col(ColumnDef::new(ForumPosts::Tag).binary().not_null())
                    .col(ColumnDef::new(ForumPosts::KeyId).uuid().not_null())
                    .col(
                        ColumnDef::new(ForumPosts::Status)
                            .enumeration(
                                Alias::new("forum_post_status"),
                                [Alias::new("open"), Alias::new("closed")],
                            )
                            .not_null()
                            .default("open"),
                    )
                    .col(timestamp(ForumPosts::LatestActivityAt))
                    .col(timestamp(ForumPosts::CreatedAt))
                    .col(timestamp(ForumPosts::UpdatedAt))
                    .foreign_key(
                        ForeignKey::create()
                            .name("forum-posts-channel-id-fkey")
                            .from(ForumPosts::Table, ForumPosts::ChannelId)
                            .to(Channels::Table, Channels::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("forum-posts-source-channel-id-fkey")
                            .from(
                                ForumPosts::Table,
                                ForumPosts::SourceChannelId,
                            )
                            .to(Channels::Table, Channels::Id)
                            .on_delete(ForeignKeyAction::SetNull)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("forum-posts-user-id-fkey")
                            .from(ForumPosts::Table, ForumPosts::UserId)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("forum-posts-root-message-id-fkey")
                            .from(ForumPosts::Table, ForumPosts::RootMessageId)
                            .to(Messages::Table, Messages::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("forum-posts-poll-id-fkey")
                            .from(ForumPosts::Table, ForumPosts::PollId)
                            .to(Polls::Table, Polls::Id)
                            .on_delete(ForeignKeyAction::Restrict)
                            .on_update(ForeignKeyAction::Cascade),
                    )
                    .index(
                        Index::create()
                            .name("forum-posts-root-message-id-key")
                            .col(ForumPosts::RootMessageId)
                            .unique(),
                    )
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("forum-posts-channel-activity-idx")
                    .table(ForumPosts::Table)
                    .col(ForumPosts::ChannelId)
                    .col((ForumPosts::LatestActivityAt, IndexOrder::Desc))
                    .to_owned(),
            )
            .await?;
        manager
            .create_index(
                Index::create()
                    .name("forum-posts-channel-status-activity-idx")
                    .table(ForumPosts::Table)
                    .col(ForumPosts::ChannelId)
                    .col(ForumPosts::Status)
                    .col((ForumPosts::LatestActivityAt, IndexOrder::Desc))
                    .to_owned(),
            )
            .await?;
        manager
            .create_index(
                Index::create()
                    .name("forum-posts-poll-id-key")
                    .table(ForumPosts::Table)
                    .col(ForumPosts::PollId)
                    .unique()
                    .and_where(Expr::col(ForumPosts::PollId).is_not_null())
                    .to_owned(),
            )
            .await?;
        manager
            .create_index(
                Index::create()
                    .name("messages-thread-root-created-at-idx")
                    .table(Messages::Table)
                    .col(Messages::ThreadRootId)
                    .col(Messages::CreatedAt)
                    .to_owned(),
            )
            .await?;
        manager
            .create_index(
                Index::create()
                    .name("messages-parent-message-created-at-idx")
                    .table(Messages::Table)
                    .col(Messages::ParentMessageId)
                    .col(Messages::CreatedAt)
                    .to_owned(),
            )
            .await?;

        manager
            .create_index(
                Index::create()
                    .name("forum-posts-source-channel-id-idx")
                    .table(ForumPosts::Table)
                    .col(ForumPosts::SourceChannelId)
                    .and_where(
                        Expr::col(ForumPosts::SourceChannelId).is_not_null(),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(ForumPosts::Table).to_owned())
            .await?;
        manager
            .alter_table(
                Table::alter()
                    .table(Messages::Table)
                    .drop_foreign_key(Alias::new(
                        "messages-thread-root-id-fkey",
                    ))
                    .drop_foreign_key(Alias::new(
                        "messages-parent-message-id-fkey",
                    ))
                    .drop_column(Messages::ThreadRootId)
                    .drop_column(Messages::ParentMessageId)
                    .to_owned(),
            )
            .await?;
        manager
            .alter_table(
                Table::alter()
                    .table(Channels::Table)
                    .drop_column(Channels::ChannelType)
                    .to_owned(),
            )
            .await?;

        drop_enum_type(manager, "forum_post_status").await?;
        drop_enum_type(manager, "channel_type").await
    }
}

fn timestamp<T>(column: T) -> ColumnDef
where
    T: IntoIden,
{
    let mut column = ColumnDef::new(column);
    column
        .timestamp_with_time_zone()
        .not_null()
        .default(Expr::current_timestamp());
    column
}

async fn create_enum_type(
    manager: &SchemaManager<'_>,
    name: &str,
    values: &[&str],
) -> Result<(), DbErr> {
    if manager.get_database_backend() == DbBackend::Postgres {
        manager
            .create_type(
                Type::create()
                    .as_enum(Alias::new(name))
                    .values(values.iter().copied().map(Alias::new))
                    .to_owned(),
            )
            .await?;
    }

    Ok(())
}

async fn drop_enum_type(
    manager: &SchemaManager<'_>,
    name: &str,
) -> Result<(), DbErr> {
    if manager.get_database_backend() == DbBackend::Postgres {
        manager
            .drop_type(Type::drop().name(Alias::new(name)).to_owned())
            .await?;
    }

    Ok(())
}

#[derive(DeriveIden)]
enum Channels {
    Table,
    Id,
    ChannelType,
}

#[derive(DeriveIden)]
enum Messages {
    Table,
    Id,
    ThreadRootId,
    ParentMessageId,
    CreatedAt,
}

#[derive(DeriveIden)]
enum ForumPosts {
    Table,
    Id,
    ChannelId,
    SourceChannelId,
    UserId,
    RootMessageId,
    PollId,
    Ciphertext,
    Iv,
    Tag,
    KeyId,
    Status,
    LatestActivityAt,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Polls {
    Table,
    Id,
}
