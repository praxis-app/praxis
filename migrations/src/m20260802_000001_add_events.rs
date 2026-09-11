use sea_orm::{sea_query::Expr, DbBackend};
use sea_orm_migration::prelude::{sea_query::extension::postgres::Type, *};

#[derive(DeriveMigrationName)]
pub(crate) struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        create_event_attendee_status_enum(manager).await?;
        create_poll_closed_reason_enum(manager).await?;
        add_poll_closed_reason(manager).await?;
        create_poll_action_events(manager).await?;
        create_poll_synchronization_indexes(manager).await?;
        create_poll_action_event_hosts(manager).await?;
        create_poll_action_event_cover_photos(manager).await?;
        create_events(manager).await?;
        create_event_attendees(manager).await?;
        create_event_cover_photos(manager).await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        drop_poll_synchronization_indexes(manager).await?;
        manager
            .drop_table(Table::drop().table(EventCoverPhotos::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(EventAttendees::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Events::Table).to_owned())
            .await?;
        manager
            .drop_table(
                Table::drop()
                    .table(PollActionEventCoverPhotos::Table)
                    .to_owned(),
            )
            .await?;
        manager
            .drop_table(
                Table::drop().table(PollActionEventHosts::Table).to_owned(),
            )
            .await?;
        manager
            .drop_table(Table::drop().table(PollActionEvents::Table).to_owned())
            .await?;
        drop_poll_closed_reason(manager).await?;
        drop_poll_closed_reason_enum(manager).await?;
        drop_event_attendee_status_enum(manager).await
    }
}

async fn create_poll_synchronization_indexes(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_index(
            Index::create()
                .name("polls-type-stage-id-idx")
                .table(Polls::Table)
                .col(Polls::PollType)
                .col(Polls::Stage)
                .col(Polls::Id)
                .to_owned(),
        )
        .await?;

    manager
        .create_index(
            Index::create()
                .name("poll-configs-closing-at-poll-id-idx")
                .table(PollConfigs::Table)
                .col(PollConfigs::ClosingAt)
                .col(PollConfigs::PollId)
                .to_owned(),
        )
        .await
}

async fn drop_poll_synchronization_indexes(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .drop_index(
            Index::drop()
                .name("poll-configs-closing-at-poll-id-idx")
                .to_owned(),
        )
        .await?;

    manager
        .drop_index(Index::drop().name("polls-type-stage-id-idx").to_owned())
        .await
}

async fn create_event_attendee_status_enum(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    if manager.get_database_backend() == DbBackend::Postgres {
        manager
            .create_type(
                Type::create()
                    .as_enum(Alias::new("event_attendee_status_enum"))
                    .values([
                        Alias::new("host"),
                        Alias::new("going"),
                        Alias::new("interested"),
                    ])
                    .to_owned(),
            )
            .await?;
    }

    Ok(())
}

async fn drop_event_attendee_status_enum(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    if manager.get_database_backend() == DbBackend::Postgres {
        manager
            .drop_type(
                Type::drop()
                    .name(Alias::new("event_attendee_status_enum"))
                    .to_owned(),
            )
            .await?;
    }

    Ok(())
}

async fn create_poll_closed_reason_enum(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    if manager.get_database_backend() == DbBackend::Postgres {
        manager
            .create_type(
                Type::create()
                    .as_enum(Alias::new("poll_closed_reason_enum"))
                    .values([
                        Alias::new("event-start-elapsed"),
                        Alias::new("event-host-ineligible"),
                    ])
                    .to_owned(),
            )
            .await?;
    }

    Ok(())
}

async fn drop_poll_closed_reason_enum(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    if manager.get_database_backend() == DbBackend::Postgres {
        manager
            .drop_type(
                Type::drop()
                    .name(Alias::new("poll_closed_reason_enum"))
                    .to_owned(),
            )
            .await?;
    }

    Ok(())
}

async fn add_poll_closed_reason(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .alter_table(
            Table::alter()
                .table(Polls::Table)
                .add_column(ColumnDef::new(Polls::ClosedReason).enumeration(
                    Alias::new("poll_closed_reason_enum"),
                    [
                        Alias::new("event-start-elapsed"),
                        Alias::new("event-host-ineligible"),
                    ],
                ))
                .to_owned(),
        )
        .await
}

async fn drop_poll_closed_reason(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .alter_table(
            Table::alter()
                .table(Polls::Table)
                .drop_column(Polls::ClosedReason)
                .to_owned(),
        )
        .await
}

async fn create_poll_action_events(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(PollActionEvents::Table)
                .col(
                    ColumnDef::new(PollActionEvents::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(
                    ColumnDef::new(PollActionEvents::PollActionId)
                        .uuid()
                        .not_null(),
                )
                .col(
                    ColumnDef::new(PollActionEvents::Name)
                        .string_len(255)
                        .not_null(),
                )
                .col(
                    ColumnDef::new(PollActionEvents::Description)
                        .text()
                        .not_null(),
                )
                .col(
                    ColumnDef::new(PollActionEvents::StartsAt)
                        .timestamp_with_time_zone()
                        .not_null(),
                )
                .col(
                    ColumnDef::new(PollActionEvents::EndsAt)
                        .timestamp_with_time_zone(),
                )
                .col(
                    ColumnDef::new(PollActionEvents::Online)
                        .boolean()
                        .not_null()
                        .default(false),
                )
                .col(ColumnDef::new(PollActionEvents::Location).string_len(255))
                .col(ColumnDef::new(PollActionEvents::ExternalLink).text())
                .col(timestamp(PollActionEvents::CreatedAt))
                .col(timestamp(PollActionEvents::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("poll-action-events-poll-action-id-fkey")
                        .from(
                            PollActionEvents::Table,
                            PollActionEvents::PollActionId,
                        )
                        .to(PollActions::Table, PollActions::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name("poll-action-events-poll-action-id-key")
                        .col(PollActionEvents::PollActionId)
                        .unique(),
                )
                .check(Expr::cust("btrim(name) <> ''"))
                .check(Expr::cust("btrim(description) <> ''"))
                .check(Expr::cust("ends_at IS NULL OR ends_at > starts_at"))
                .check(Expr::cust(
                    "online OR (location IS NOT NULL AND btrim(location) <> '')",
                ))
                .to_owned(),
        )
        .await?;

    manager
        .create_index(
            Index::create()
                .name("poll-action-events-starts-at-action-id-idx")
                .table(PollActionEvents::Table)
                .col(PollActionEvents::StartsAt)
                .col(PollActionEvents::PollActionId)
                .to_owned(),
        )
        .await
}

async fn create_poll_action_event_hosts(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(PollActionEventHosts::Table)
                .col(
                    ColumnDef::new(PollActionEventHosts::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(
                    ColumnDef::new(PollActionEventHosts::PollActionEventId)
                        .uuid()
                        .not_null(),
                )
                .col(
                    ColumnDef::new(PollActionEventHosts::UserId)
                        .uuid()
                        .not_null(),
                )
                .col(timestamp(PollActionEventHosts::CreatedAt))
                .col(timestamp(PollActionEventHosts::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name(
                            "poll-action-event-hosts-poll-action-event-id-fkey",
                        )
                        .from(
                            PollActionEventHosts::Table,
                            PollActionEventHosts::PollActionEventId,
                        )
                        .to(PollActionEvents::Table, PollActionEvents::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("poll-action-event-hosts-user-id-fkey")
                        .from(
                            PollActionEventHosts::Table,
                            PollActionEventHosts::UserId,
                        )
                        .to(Users::Table, Users::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name("poll-action-event-hosts-event-user-key")
                        .col(PollActionEventHosts::PollActionEventId)
                        .col(PollActionEventHosts::UserId)
                        .unique(),
                )
                .to_owned(),
        )
        .await
}

async fn create_poll_action_event_cover_photos(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(PollActionEventCoverPhotos::Table)
                .col(
                    ColumnDef::new(PollActionEventCoverPhotos::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(
                    ColumnDef::new(
                        PollActionEventCoverPhotos::PollActionEventId,
                    )
                    .uuid()
                    .not_null(),
                )
                .col(
                    ColumnDef::new(PollActionEventCoverPhotos::StorageKey)
                        .string()
                        .not_null(),
                )
                .col(timestamp(PollActionEventCoverPhotos::CreatedAt))
                .col(timestamp(PollActionEventCoverPhotos::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("poll-action-event-cover-photos-event-id-fkey")
                        .from(
                            PollActionEventCoverPhotos::Table,
                            PollActionEventCoverPhotos::PollActionEventId,
                        )
                        .to(PollActionEvents::Table, PollActionEvents::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name("poll-action-event-cover-photos-event-id-key")
                        .col(PollActionEventCoverPhotos::PollActionEventId)
                        .unique(),
                )
                .to_owned(),
        )
        .await
}

async fn create_events(manager: &SchemaManager<'_>) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(Events::Table)
                .col(
                    ColumnDef::new(Events::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(ColumnDef::new(Events::ServerId).uuid().not_null())
                .col(ColumnDef::new(Events::SourcePollActionId).uuid())
                .col(
                    ColumnDef::new(Events::Name)
                        .string_len(255)
                        .not_null(),
                )
                .col(ColumnDef::new(Events::Description).text().not_null())
                .col(
                    ColumnDef::new(Events::StartsAt)
                        .timestamp_with_time_zone()
                        .not_null(),
                )
                .col(ColumnDef::new(Events::EndsAt).timestamp_with_time_zone())
                .col(
                    ColumnDef::new(Events::Online)
                        .boolean()
                        .not_null()
                        .default(false),
                )
                .col(ColumnDef::new(Events::Location).string_len(255))
                .col(ColumnDef::new(Events::ExternalLink).text())
                .col(timestamp(Events::CreatedAt))
                .col(timestamp(Events::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("events-server-id-fkey")
                        .from(Events::Table, Events::ServerId)
                        .to(Servers::Table, Servers::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("events-source-poll-action-id-fkey")
                        .from(Events::Table, Events::SourcePollActionId)
                        .to(PollActions::Table, PollActions::Id)
                        .on_delete(ForeignKeyAction::SetNull)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name("events-source-poll-action-id-key")
                        .col(Events::SourcePollActionId)
                        .unique(),
                )
                .check(Expr::cust("btrim(name) <> ''"))
                .check(Expr::cust("btrim(description) <> ''"))
                .check(Expr::cust("ends_at IS NULL OR ends_at > starts_at"))
                .check(Expr::cust(
                    "online OR (location IS NOT NULL AND btrim(location) <> '')",
                ))
                .to_owned(),
        )
        .await?;

    manager
        .create_index(
            Index::create()
                .name("events-server-starts-at-id-idx")
                .table(Events::Table)
                .col(Events::ServerId)
                .col(Events::StartsAt)
                .col(Events::Id)
                .to_owned(),
        )
        .await?;

    manager
        .create_index(
            Index::create()
                .name("events-server-online-starts-at-id-idx")
                .table(Events::Table)
                .col(Events::ServerId)
                .col(Events::Online)
                .col(Events::StartsAt)
                .col(Events::Id)
                .to_owned(),
        )
        .await
}

async fn create_event_attendees(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(EventAttendees::Table)
                .col(
                    ColumnDef::new(EventAttendees::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(ColumnDef::new(EventAttendees::EventId).uuid().not_null())
                .col(ColumnDef::new(EventAttendees::UserId).uuid().not_null())
                .col(
                    ColumnDef::new(EventAttendees::Status)
                        .enumeration(
                            Alias::new("event_attendee_status_enum"),
                            [
                                Alias::new("host"),
                                Alias::new("going"),
                                Alias::new("interested"),
                            ],
                        )
                        .not_null(),
                )
                .col(timestamp(EventAttendees::CreatedAt))
                .col(timestamp(EventAttendees::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("event-attendees-event-id-fkey")
                        .from(EventAttendees::Table, EventAttendees::EventId)
                        .to(Events::Table, Events::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("event-attendees-user-id-fkey")
                        .from(EventAttendees::Table, EventAttendees::UserId)
                        .to(Users::Table, Users::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name("event-attendees-event-user-key")
                        .col(EventAttendees::EventId)
                        .col(EventAttendees::UserId)
                        .unique(),
                )
                .to_owned(),
        )
        .await?;

    manager
        .create_index(
            Index::create()
                .name("event-attendees-event-status-idx")
                .table(EventAttendees::Table)
                .col(EventAttendees::EventId)
                .col(EventAttendees::Status)
                .to_owned(),
        )
        .await?;

    manager
        .create_index(
            Index::create()
                .name("event-attendees-user-event-idx")
                .table(EventAttendees::Table)
                .col(EventAttendees::UserId)
                .col(EventAttendees::EventId)
                .to_owned(),
        )
        .await
}

async fn create_event_cover_photos(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(EventCoverPhotos::Table)
                .col(
                    ColumnDef::new(EventCoverPhotos::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(
                    ColumnDef::new(EventCoverPhotos::EventId).uuid().not_null(),
                )
                .col(
                    ColumnDef::new(EventCoverPhotos::StorageKey)
                        .string()
                        .not_null(),
                )
                .col(timestamp(EventCoverPhotos::CreatedAt))
                .col(timestamp(EventCoverPhotos::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("event-cover-photos-event-id-fkey")
                        .from(
                            EventCoverPhotos::Table,
                            EventCoverPhotos::EventId,
                        )
                        .to(Events::Table, Events::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name("event-cover-photos-event-id-key")
                        .col(EventCoverPhotos::EventId)
                        .unique(),
                )
                .to_owned(),
        )
        .await
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

#[derive(DeriveIden)]
enum PollActionEvents {
    Table,
    Id,
    PollActionId,
    Name,
    Description,
    StartsAt,
    EndsAt,
    Online,
    Location,
    ExternalLink,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum PollActionEventHosts {
    Table,
    Id,
    PollActionEventId,
    UserId,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum PollActionEventCoverPhotos {
    Table,
    Id,
    PollActionEventId,
    StorageKey,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Events {
    Table,
    Id,
    ServerId,
    SourcePollActionId,
    Name,
    Description,
    StartsAt,
    EndsAt,
    Online,
    Location,
    ExternalLink,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum EventAttendees {
    Table,
    Id,
    EventId,
    UserId,
    Status,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum EventCoverPhotos {
    Table,
    Id,
    EventId,
    StorageKey,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum PollActions {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Polls {
    Table,
    Id,
    Stage,
    PollType,
    ClosedReason,
}

#[derive(DeriveIden)]
enum PollConfigs {
    Table,
    PollId,
    ClosingAt,
}

#[derive(DeriveIden)]
enum Servers {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
}
