use sea_orm::ConnectionTrait;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub(crate) struct Migration;

const RENAMES: [(&str, &str, &str); 4] = [
    ("server_configs", "blocks_restricted", "blocks_open_to_all"),
    ("poll_configs", "blocks_restricted", "blocks_open_to_all"),
    (
        "poll_action_server_configs",
        "blocks_restricted",
        "blocks_open_to_all",
    ),
    (
        "poll_action_server_configs",
        "prev_blocks_restricted",
        "prev_blocks_open_to_all",
    ),
];

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        for (table, from, to) in RENAMES {
            rename_and_invert(manager, table, from, to).await?;
        }
        set_default(manager, "server_configs", "blocks_open_to_all", "true")
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        for (table, from, to) in RENAMES {
            rename_and_invert(manager, table, to, from).await?;
        }
        set_default(manager, "server_configs", "blocks_restricted", "false")
            .await
    }
}

/// The flag flipped polarity along with its name, so stored values invert too
async fn rename_and_invert(
    manager: &SchemaManager<'_>,
    table: &str,
    from: &str,
    to: &str,
) -> Result<(), DbErr> {
    let connection = manager.get_connection();
    connection
        .execute_unprepared(&format!(
            r#"ALTER TABLE "{table}" RENAME COLUMN "{from}" TO "{to}""#
        ))
        .await?;
    connection
        .execute_unprepared(&format!(
            r#"UPDATE "{table}" SET "{to}" = NOT "{to}" WHERE "{to}" IS NOT NULL"#
        ))
        .await?;
    Ok(())
}

async fn set_default(
    manager: &SchemaManager<'_>,
    table: &str,
    column: &str,
    value: &str,
) -> Result<(), DbErr> {
    manager
        .get_connection()
        .execute_unprepared(&format!(
            r#"ALTER TABLE "{table}" ALTER COLUMN "{column}" SET DEFAULT {value}"#
        ))
        .await
        .map(|_| ())
}
