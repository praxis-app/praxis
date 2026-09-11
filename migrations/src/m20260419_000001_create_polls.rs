use sea_orm::{sea_query::Expr, DbBackend};
use sea_orm_migration::prelude::{sea_query::extension::postgres::Type, *};

#[derive(DeriveMigrationName)]
pub(crate) struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        create_poll_enum_types(manager).await?;
        create_polls(manager).await?;
        create_poll_configs(manager).await?;
        create_poll_options(manager).await?;
        create_poll_actions(manager).await?;
        create_poll_action_roles(manager).await?;
        create_poll_action_permissions(manager).await?;
        create_poll_action_role_members(manager).await?;
        create_votes(manager).await?;
        create_poll_option_selections(manager).await?;
        create_poll_images(manager).await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(
                Table::drop().table(PollOptionSelections::Table).to_owned(),
            )
            .await?;
        manager
            .drop_table(Table::drop().table(Votes::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(PollImages::Table).to_owned())
            .await?;
        manager
            .drop_table(
                Table::drop().table(PollActionRoleMembers::Table).to_owned(),
            )
            .await?;
        manager
            .drop_table(
                Table::drop().table(PollActionPermissions::Table).to_owned(),
            )
            .await?;
        manager
            .drop_table(Table::drop().table(PollActionRoles::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(PollActions::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(PollOptions::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(PollConfigs::Table).to_owned())
            .await?;
        manager
            .drop_table(Table::drop().table(Polls::Table).to_owned())
            .await?;
        drop_poll_enum_types(manager).await
    }
}

async fn create_poll_enum_types(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    create_enum_type(
        manager,
        "polls_stage_enum",
        &["voting", "ratified", "revision", "closed"],
    )
    .await?;
    create_enum_type(manager, "polls_poll_type_enum", &["proposal", "poll"])
        .await?;
    create_enum_type(
        manager,
        "poll_configs_decision_making_model_enum",
        &["consent", "consensus", "majority-vote"],
    )
    .await?;
    create_enum_type(
        manager,
        "poll_actions_action_type_enum",
        &[
            "general",
            "change-settings",
            "change-role",
            "create-role",
            "plan-event",
            "test",
        ],
    )
    .await?;
    create_enum_type(
        manager,
        "poll_action_permissions_action_enum",
        &["delete", "create", "read", "update", "manage"],
    )
    .await?;
    create_enum_type(
        manager,
        "poll_action_permissions_subject_enum",
        &[
            "ServerConfig",
            "Channel",
            "Invite",
            "Message",
            "ServerRole",
            "all",
        ],
    )
    .await?;
    create_enum_type(
        manager,
        "poll_action_permissions_change_type_enum",
        &["add", "remove"],
    )
    .await?;
    create_enum_type(
        manager,
        "poll_action_role_members_change_type_enum",
        &["add", "remove"],
    )
    .await?;
    create_enum_type(
        manager,
        "votes_vote_type_enum",
        &["agree", "disagree", "abstain", "block"],
    )
    .await
}

async fn drop_poll_enum_types(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    drop_enum_type(manager, "votes_vote_type_enum").await?;
    drop_enum_type(manager, "poll_action_role_members_change_type_enum")
        .await?;
    drop_enum_type(manager, "poll_action_permissions_change_type_enum").await?;
    drop_enum_type(manager, "poll_action_permissions_subject_enum").await?;
    drop_enum_type(manager, "poll_action_permissions_action_enum").await?;
    drop_enum_type(manager, "poll_actions_action_type_enum").await?;
    drop_enum_type(manager, "poll_configs_decision_making_model_enum").await?;
    drop_enum_type(manager, "polls_poll_type_enum").await?;
    drop_enum_type(manager, "polls_stage_enum").await
}

async fn create_polls(manager: &SchemaManager<'_>) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(Polls::Table)
                .if_not_exists()
                .col(ColumnDef::new(Polls::Id).uuid().not_null().primary_key())
                .col(ColumnDef::new(Polls::Ciphertext).binary())
                .col(ColumnDef::new(Polls::Iv).binary())
                .col(ColumnDef::new(Polls::Tag).binary())
                .col(ColumnDef::new(Polls::KeyId).uuid())
                .col(
                    ColumnDef::new(Polls::Stage)
                        .enumeration(
                            Alias::new("polls_stage_enum"),
                            [
                                Alias::new("voting"),
                                Alias::new("ratified"),
                                Alias::new("revision"),
                                Alias::new("closed"),
                            ],
                        )
                        .not_null()
                        .default("voting"),
                )
                .col(
                    ColumnDef::new(Polls::PollType)
                        .enumeration(
                            Alias::new("polls_poll_type_enum"),
                            [Alias::new("proposal"), Alias::new("poll")],
                        )
                        .not_null()
                        .default("proposal"),
                )
                .col(ColumnDef::new(Polls::UserId).uuid().not_null())
                .col(ColumnDef::new(Polls::ChannelId).uuid().not_null())
                .col(timestamp(Polls::CreatedAt))
                .col(timestamp(Polls::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("polls-user-id-fkey")
                        .from(Polls::Table, Polls::UserId)
                        .to(Users::Table, Users::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("polls-channel-id-fkey")
                        .from(Polls::Table, Polls::ChannelId)
                        .to(Channels::Table, Channels::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .to_owned(),
        )
        .await
}

async fn create_poll_configs(manager: &SchemaManager<'_>) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(PollConfigs::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(PollConfigs::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(ColumnDef::new(PollConfigs::PollId).uuid().not_null())
                .col(
                    ColumnDef::new(PollConfigs::DecisionMakingModel)
                        .enumeration(
                            Alias::new(
                                "poll_configs_decision_making_model_enum",
                            ),
                            [
                                Alias::new("consent"),
                                Alias::new("consensus"),
                                Alias::new("majority-vote"),
                            ],
                        )
                        .default("consensus"),
                )
                .col(ColumnDef::new(PollConfigs::DisagreementsLimit).integer())
                .col(ColumnDef::new(PollConfigs::AbstainsLimit).integer())
                .col(ColumnDef::new(PollConfigs::AgreementThreshold).integer())
                .col(ColumnDef::new(PollConfigs::QuorumEnabled).boolean())
                .col(ColumnDef::new(PollConfigs::QuorumThreshold).integer())
                .col(ColumnDef::new(PollConfigs::MultipleChoice).boolean())
                .col(
                    ColumnDef::new(PollConfigs::ClosingAt)
                        .timestamp_with_time_zone(),
                )
                .col(timestamp(PollConfigs::CreatedAt))
                .col(timestamp(PollConfigs::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("poll-configs-poll-id-fkey")
                        .from(PollConfigs::Table, PollConfigs::PollId)
                        .to(Polls::Table, Polls::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name("poll-configs-poll-id-key")
                        .col(PollConfigs::PollId)
                        .unique(),
                )
                .to_owned(),
        )
        .await
}

async fn create_poll_options(manager: &SchemaManager<'_>) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(PollOptions::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(PollOptions::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(ColumnDef::new(PollOptions::PollId).uuid().not_null())
                .col(ColumnDef::new(PollOptions::Text).string().not_null())
                .col(timestamp(PollOptions::CreatedAt))
                .col(timestamp(PollOptions::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("poll-options-poll-id-fkey")
                        .from(PollOptions::Table, PollOptions::PollId)
                        .to(Polls::Table, Polls::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .to_owned(),
        )
        .await
}

async fn create_poll_actions(manager: &SchemaManager<'_>) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(PollActions::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(PollActions::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(ColumnDef::new(PollActions::PollId).uuid().not_null())
                .col(
                    ColumnDef::new(PollActions::ActionType)
                        .enumeration(
                            Alias::new("poll_actions_action_type_enum"),
                            [
                                Alias::new("general"),
                                Alias::new("change-settings"),
                                Alias::new("change-role"),
                                Alias::new("create-role"),
                                Alias::new("plan-event"),
                                Alias::new("test"),
                            ],
                        )
                        .not_null(),
                )
                .col(timestamp(PollActions::CreatedAt))
                .col(timestamp(PollActions::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("poll-actions-poll-id-fkey")
                        .from(PollActions::Table, PollActions::PollId)
                        .to(Polls::Table, Polls::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name("poll-actions-poll-id-key")
                        .col(PollActions::PollId)
                        .unique(),
                )
                .to_owned(),
        )
        .await
}

async fn create_poll_action_roles(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(PollActionRoles::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(PollActionRoles::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(
                    ColumnDef::new(PollActionRoles::PollActionId)
                        .uuid()
                        .not_null(),
                )
                .col(ColumnDef::new(PollActionRoles::ServerRoleId).uuid())
                .col(ColumnDef::new(PollActionRoles::Name).string())
                .col(ColumnDef::new(PollActionRoles::Color).string())
                .col(ColumnDef::new(PollActionRoles::PrevName).string())
                .col(ColumnDef::new(PollActionRoles::PrevColor).string())
                .col(timestamp(PollActionRoles::CreatedAt))
                .col(timestamp(PollActionRoles::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("poll-action-roles-action-id-fkey")
                        .from(
                            PollActionRoles::Table,
                            PollActionRoles::PollActionId,
                        )
                        .to(PollActions::Table, PollActions::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("poll-action-roles-server-role-id-fkey")
                        .from(
                            PollActionRoles::Table,
                            PollActionRoles::ServerRoleId,
                        )
                        .to(ServerRoles::Table, ServerRoles::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name("poll-action-roles-action-id-key")
                        .col(PollActionRoles::PollActionId)
                        .unique(),
                )
                .to_owned(),
        )
        .await
}

async fn create_poll_action_permissions(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(PollActionPermissions::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(PollActionPermissions::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(
                    ColumnDef::new(PollActionPermissions::PollActionRoleId)
                        .uuid()
                        .not_null(),
                )
                .col(
                    ColumnDef::new(PollActionPermissions::Subject)
                        .enumeration(
                            Alias::new("poll_action_permissions_subject_enum"),
                            [
                                Alias::new("ServerConfig"),
                                Alias::new("Channel"),
                                Alias::new("Invite"),
                                Alias::new("Message"),
                                Alias::new("ServerRole"),
                                Alias::new("all"),
                            ],
                        )
                        .not_null(),
                )
                .col(
                    ColumnDef::new(PollActionPermissions::Action)
                        .enumeration(
                            Alias::new("poll_action_permissions_action_enum"),
                            [
                                Alias::new("delete"),
                                Alias::new("create"),
                                Alias::new("read"),
                                Alias::new("update"),
                                Alias::new("manage"),
                            ],
                        )
                        .not_null(),
                )
                .col(
                    ColumnDef::new(PollActionPermissions::ChangeType)
                        .enumeration(
                            Alias::new(
                                "poll_action_permissions_change_type_enum",
                            ),
                            [Alias::new("add"), Alias::new("remove")],
                        )
                        .not_null(),
                )
                .col(timestamp(PollActionPermissions::CreatedAt))
                .col(timestamp(PollActionPermissions::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("poll-action-permissions-action-role-id-fkey")
                        .from(
                            PollActionPermissions::Table,
                            PollActionPermissions::PollActionRoleId,
                        )
                        .to(PollActionRoles::Table, PollActionRoles::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name("poll-action-permissions-role-subject-action-key")
                        .col(PollActionPermissions::PollActionRoleId)
                        .col(PollActionPermissions::Subject)
                        .col(PollActionPermissions::Action)
                        .unique(),
                )
                .to_owned(),
        )
        .await
}

async fn create_poll_action_role_members(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(PollActionRoleMembers::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(PollActionRoleMembers::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(
                    ColumnDef::new(PollActionRoleMembers::PollActionRoleId)
                        .uuid()
                        .not_null(),
                )
                .col(
                    ColumnDef::new(PollActionRoleMembers::UserId)
                        .uuid()
                        .not_null(),
                )
                .col(
                    ColumnDef::new(PollActionRoleMembers::ChangeType)
                        .enumeration(
                            Alias::new(
                                "poll_action_role_members_change_type_enum",
                            ),
                            [Alias::new("add"), Alias::new("remove")],
                        )
                        .not_null(),
                )
                .col(timestamp(PollActionRoleMembers::CreatedAt))
                .col(timestamp(PollActionRoleMembers::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("poll-action-role-members-action-role-id-fkey")
                        .from(
                            PollActionRoleMembers::Table,
                            PollActionRoleMembers::PollActionRoleId,
                        )
                        .to(PollActionRoles::Table, PollActionRoles::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("poll-action-role-members-user-id-fkey")
                        .from(
                            PollActionRoleMembers::Table,
                            PollActionRoleMembers::UserId,
                        )
                        .to(Users::Table, Users::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .to_owned(),
        )
        .await
}

async fn create_votes(manager: &SchemaManager<'_>) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(Votes::Table)
                .if_not_exists()
                .col(ColumnDef::new(Votes::Id).uuid().not_null().primary_key())
                .col(ColumnDef::new(Votes::PollId).uuid().not_null())
                .col(ColumnDef::new(Votes::UserId).uuid().not_null())
                .col(ColumnDef::new(Votes::VoteType).enumeration(
                    Alias::new("votes_vote_type_enum"),
                    [
                        Alias::new("agree"),
                        Alias::new("disagree"),
                        Alias::new("abstain"),
                        Alias::new("block"),
                    ],
                ))
                .col(timestamp(Votes::CreatedAt))
                .col(timestamp(Votes::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("votes-poll-id-fkey")
                        .from(Votes::Table, Votes::PollId)
                        .to(Polls::Table, Polls::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("votes-user-id-fkey")
                        .from(Votes::Table, Votes::UserId)
                        .to(Users::Table, Users::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name("votes-poll-id-user-id-key")
                        .col(Votes::PollId)
                        .col(Votes::UserId)
                        .unique(),
                )
                .to_owned(),
        )
        .await
}

async fn create_poll_option_selections(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(PollOptionSelections::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(PollOptionSelections::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(
                    ColumnDef::new(PollOptionSelections::VoteId)
                        .uuid()
                        .not_null(),
                )
                .col(
                    ColumnDef::new(PollOptionSelections::PollOptionId)
                        .uuid()
                        .not_null(),
                )
                .col(ColumnDef::new(PollOptionSelections::Rank).integer())
                .col(ColumnDef::new(PollOptionSelections::Score).integer())
                .col(timestamp(PollOptionSelections::CreatedAt))
                .col(timestamp(PollOptionSelections::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("poll-option-selections-vote-id-fkey")
                        .from(
                            PollOptionSelections::Table,
                            PollOptionSelections::VoteId,
                        )
                        .to(Votes::Table, Votes::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("poll-option-selections-option-id-fkey")
                        .from(
                            PollOptionSelections::Table,
                            PollOptionSelections::PollOptionId,
                        )
                        .to(PollOptions::Table, PollOptions::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name("poll-option-selections-vote-option-key")
                        .col(PollOptionSelections::VoteId)
                        .col(PollOptionSelections::PollOptionId)
                        .unique(),
                )
                .to_owned(),
        )
        .await
}

async fn create_poll_images(manager: &SchemaManager<'_>) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(PollImages::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(PollImages::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(ColumnDef::new(PollImages::PollId).uuid().not_null())
                .col(ColumnDef::new(PollImages::StorageKey).string())
                .col(ColumnDef::new(PollImages::ContentType).string())
                .col(timestamp(PollImages::CreatedAt))
                .col(timestamp(PollImages::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("poll-images-poll-id-fkey")
                        .from(PollImages::Table, PollImages::PollId)
                        .to(Polls::Table, Polls::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .to_owned(),
        )
        .await
}

fn timestamp<T>(column: T) -> ColumnDef
where
    T: IntoIden,
{
    ColumnDef::new(column)
        .timestamp_with_time_zone()
        .not_null()
        .default(Expr::current_timestamp())
        .take()
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
enum Polls {
    Table,
    Id,
    Ciphertext,
    Iv,
    Tag,
    KeyId,
    Stage,
    PollType,
    UserId,
    ChannelId,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum PollConfigs {
    Table,
    Id,
    PollId,
    DecisionMakingModel,
    DisagreementsLimit,
    AbstainsLimit,
    AgreementThreshold,
    QuorumEnabled,
    QuorumThreshold,
    MultipleChoice,
    ClosingAt,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum PollOptions {
    Table,
    Id,
    PollId,
    Text,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum PollActions {
    Table,
    Id,
    PollId,
    ActionType,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum PollActionRoles {
    Table,
    Id,
    PollActionId,
    ServerRoleId,
    Name,
    Color,
    PrevName,
    PrevColor,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum PollActionPermissions {
    Table,
    Id,
    PollActionRoleId,
    Subject,
    Action,
    ChangeType,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum PollActionRoleMembers {
    Table,
    Id,
    PollActionRoleId,
    UserId,
    ChangeType,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Votes {
    Table,
    Id,
    PollId,
    UserId,
    VoteType,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum PollOptionSelections {
    Table,
    Id,
    VoteId,
    PollOptionId,
    Rank,
    Score,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum PollImages {
    Table,
    Id,
    PollId,
    StorageKey,
    ContentType,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum Users {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Channels {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum ServerRoles {
    Table,
    Id,
}
