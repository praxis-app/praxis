use sea_orm::{sea_query::Expr, DbBackend};
use sea_orm_migration::prelude::{sea_query::extension::postgres::Type, *};

#[derive(DeriveMigrationName)]
pub(crate) struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        create_role_enum_types(manager).await?;
        create_instance_roles(manager).await?;
        create_instance_role_permissions(manager).await?;
        create_instance_role_members(manager).await?;
        create_server_roles(manager).await?;
        create_server_role_permissions(manager).await?;
        create_server_role_members(manager).await?;
        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(
                Table::drop().table(ServerRoleMembers::Table).to_owned(),
            )
            .await?;
        manager
            .drop_table(
                Table::drop().table(ServerRolePermissions::Table).to_owned(),
            )
            .await?;
        manager
            .drop_table(Table::drop().table(ServerRoles::Table).to_owned())
            .await?;
        manager
            .drop_table(
                Table::drop().table(InstanceRoleMembers::Table).to_owned(),
            )
            .await?;
        manager
            .drop_table(
                Table::drop()
                    .table(InstanceRolePermissions::Table)
                    .to_owned(),
            )
            .await?;
        manager
            .drop_table(Table::drop().table(InstanceRoles::Table).to_owned())
            .await?;
        drop_role_enum_types(manager).await?;
        Ok(())
    }
}

async fn create_role_enum_types(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    create_enum_type(
        manager,
        "instance_role_permissions_action_enum",
        &["delete", "create", "read", "update", "manage"],
    )
    .await?;
    create_enum_type(
        manager,
        "instance_role_permissions_subject_enum",
        &["InstanceConfig", "InstanceRole", "Server", "all"],
    )
    .await?;
    create_enum_type(
        manager,
        "server_role_permissions_action_enum",
        &["delete", "create", "read", "update", "manage"],
    )
    .await?;
    create_enum_type(
        manager,
        "server_role_permissions_subject_enum",
        &[
            "ServerConfig",
            "Channel",
            "Invite",
            "Message",
            "ServerRole",
            "all",
        ],
    )
    .await
}

async fn drop_role_enum_types(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    drop_enum_type(manager, "server_role_permissions_subject_enum").await?;
    drop_enum_type(manager, "server_role_permissions_action_enum").await?;
    drop_enum_type(manager, "instance_role_permissions_subject_enum").await?;
    drop_enum_type(manager, "instance_role_permissions_action_enum").await
}

async fn create_instance_roles(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(InstanceRoles::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(InstanceRoles::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(ColumnDef::new(InstanceRoles::Name).string().not_null())
                .col(ColumnDef::new(InstanceRoles::Color).string().not_null())
                .col(timestamp(InstanceRoles::CreatedAt))
                .col(timestamp(InstanceRoles::UpdatedAt))
                .index(
                    Index::create()
                        .name("instance-roles-name-key")
                        .col(InstanceRoles::Name)
                        .unique(),
                )
                .to_owned(),
        )
        .await
}

async fn create_instance_role_permissions(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(InstanceRolePermissions::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(InstanceRolePermissions::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(
                    ColumnDef::new(InstanceRolePermissions::InstanceRoleId)
                        .uuid()
                        .not_null(),
                )
                .col(
                    ColumnDef::new(InstanceRolePermissions::Subject)
                        .enumeration(
                            Alias::new(
                                "instance_role_permissions_subject_enum",
                            ),
                            [
                                Alias::new("InstanceConfig"),
                                Alias::new("InstanceRole"),
                                Alias::new("Server"),
                                Alias::new("all"),
                            ],
                        )
                        .not_null(),
                )
                .col(
                    ColumnDef::new(InstanceRolePermissions::Action)
                        .enumeration(
                            Alias::new("instance_role_permissions_action_enum"),
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
                .col(timestamp(InstanceRolePermissions::CreatedAt))
                .col(timestamp(InstanceRolePermissions::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("instance-role-permissions-role-id-fkey")
                        .from(
                            InstanceRolePermissions::Table,
                            InstanceRolePermissions::InstanceRoleId,
                        )
                        .to(InstanceRoles::Table, InstanceRoles::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name(
                            "instance-role-permissions-role-subject-action-key",
                        )
                        .col(InstanceRolePermissions::InstanceRoleId)
                        .col(InstanceRolePermissions::Subject)
                        .col(InstanceRolePermissions::Action)
                        .unique(),
                )
                .to_owned(),
        )
        .await
}

async fn create_instance_role_members(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(InstanceRoleMembers::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(InstanceRoleMembers::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(
                    ColumnDef::new(InstanceRoleMembers::InstanceRoleId)
                        .uuid()
                        .not_null(),
                )
                .col(
                    ColumnDef::new(InstanceRoleMembers::UserId)
                        .uuid()
                        .not_null(),
                )
                .col(timestamp(InstanceRoleMembers::CreatedAt))
                .col(timestamp(InstanceRoleMembers::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("instance-role-members-role-id-fkey")
                        .from(
                            InstanceRoleMembers::Table,
                            InstanceRoleMembers::InstanceRoleId,
                        )
                        .to(InstanceRoles::Table, InstanceRoles::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("instance-role-members-user-id-fkey")
                        .from(
                            InstanceRoleMembers::Table,
                            InstanceRoleMembers::UserId,
                        )
                        .to(Users::Table, Users::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name("instance-role-members-role-user-key")
                        .col(InstanceRoleMembers::InstanceRoleId)
                        .col(InstanceRoleMembers::UserId)
                        .unique(),
                )
                .to_owned(),
        )
        .await
}

async fn create_server_roles(manager: &SchemaManager<'_>) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(ServerRoles::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(ServerRoles::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(ColumnDef::new(ServerRoles::ServerId).uuid().not_null())
                .col(ColumnDef::new(ServerRoles::Name).string().not_null())
                .col(ColumnDef::new(ServerRoles::Color).string().not_null())
                .col(timestamp(ServerRoles::CreatedAt))
                .col(timestamp(ServerRoles::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("server-roles-server-id-fkey")
                        .from(ServerRoles::Table, ServerRoles::ServerId)
                        .to(Servers::Table, Servers::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name("server-roles-server-id-name-key")
                        .col(ServerRoles::ServerId)
                        .col(ServerRoles::Name)
                        .unique(),
                )
                .to_owned(),
        )
        .await
}

async fn create_server_role_permissions(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(ServerRolePermissions::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(ServerRolePermissions::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(
                    ColumnDef::new(ServerRolePermissions::ServerRoleId)
                        .uuid()
                        .not_null(),
                )
                .col(
                    ColumnDef::new(ServerRolePermissions::Subject)
                        .enumeration(
                            Alias::new("server_role_permissions_subject_enum"),
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
                    ColumnDef::new(ServerRolePermissions::Action)
                        .enumeration(
                            Alias::new("server_role_permissions_action_enum"),
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
                .col(timestamp(ServerRolePermissions::CreatedAt))
                .col(timestamp(ServerRolePermissions::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("server-role-permissions-role-id-fkey")
                        .from(
                            ServerRolePermissions::Table,
                            ServerRolePermissions::ServerRoleId,
                        )
                        .to(ServerRoles::Table, ServerRoles::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name("server-role-permissions-role-subject-action-key")
                        .col(ServerRolePermissions::ServerRoleId)
                        .col(ServerRolePermissions::Subject)
                        .col(ServerRolePermissions::Action)
                        .unique(),
                )
                .to_owned(),
        )
        .await
}

async fn create_server_role_members(
    manager: &SchemaManager<'_>,
) -> Result<(), DbErr> {
    manager
        .create_table(
            Table::create()
                .table(ServerRoleMembers::Table)
                .if_not_exists()
                .col(
                    ColumnDef::new(ServerRoleMembers::Id)
                        .uuid()
                        .not_null()
                        .primary_key(),
                )
                .col(
                    ColumnDef::new(ServerRoleMembers::ServerRoleId)
                        .uuid()
                        .not_null(),
                )
                .col(
                    ColumnDef::new(ServerRoleMembers::UserId).uuid().not_null(),
                )
                .col(timestamp(ServerRoleMembers::CreatedAt))
                .col(timestamp(ServerRoleMembers::UpdatedAt))
                .foreign_key(
                    ForeignKey::create()
                        .name("server-role-members-role-id-fkey")
                        .from(
                            ServerRoleMembers::Table,
                            ServerRoleMembers::ServerRoleId,
                        )
                        .to(ServerRoles::Table, ServerRoles::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .foreign_key(
                    ForeignKey::create()
                        .name("server-role-members-user-id-fkey")
                        .from(
                            ServerRoleMembers::Table,
                            ServerRoleMembers::UserId,
                        )
                        .to(Users::Table, Users::Id)
                        .on_delete(ForeignKeyAction::Cascade)
                        .on_update(ForeignKeyAction::Cascade),
                )
                .index(
                    Index::create()
                        .name("server-role-members-role-user-key")
                        .col(ServerRoleMembers::ServerRoleId)
                        .col(ServerRoleMembers::UserId)
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
    ColumnDef::new(column)
        .timestamp_with_time_zone()
        .not_null()
        .default(Expr::current_timestamp())
        .to_owned()
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
enum Users {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum Servers {
    Table,
    Id,
}

#[derive(DeriveIden)]
enum InstanceRoles {
    Table,
    Id,
    Name,
    Color,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum InstanceRolePermissions {
    Table,
    Id,
    InstanceRoleId,
    Subject,
    Action,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum InstanceRoleMembers {
    Table,
    Id,
    InstanceRoleId,
    UserId,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum ServerRoles {
    Table,
    Id,
    ServerId,
    Name,
    Color,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum ServerRolePermissions {
    Table,
    Id,
    ServerRoleId,
    Subject,
    Action,
    CreatedAt,
    UpdatedAt,
}

#[derive(DeriveIden)]
enum ServerRoleMembers {
    Table,
    Id,
    ServerRoleId,
    UserId,
    CreatedAt,
    UpdatedAt,
}
