use sea_orm::{ConnectionTrait, DbBackend};
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub(crate) struct Migration;

const KINDS: [&str; 2] = ["new_proposal", "event_created"];
const TARGET_CHECK: &str = "notifications_one_target_check";
const EVENT_ID_INDEX: &str = "notifications-event-id-idx";

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        if manager.get_database_backend() != DbBackend::Postgres {
            return Ok(());
        }

        let connection = manager.get_connection();
        for kind in KINDS {
            connection
                .execute_unprepared(&format!(
                    r#"ALTER TYPE notifications_kind_enum ADD VALUE IF NOT EXISTS '{kind}'"#
                ))
                .await?;
        }
        connection
            .execute_unprepared(
                r#"ALTER TABLE notifications ADD COLUMN event_id uuid"#,
            )
            .await?;
        connection
            .execute_unprepared(
                r#"ALTER TABLE notifications ADD CONSTRAINT "notifications-event-id-fkey" FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE ON UPDATE CASCADE"#,
            )
            .await?;
        connection
            .execute_unprepared(&format!(
                r#"CREATE INDEX "{EVENT_ID_INDEX}" ON notifications (event_id)"#
            ))
            .await?;
        replace_target_check(
            manager,
            "num_nonnulls(message_id, poll_id, server_role_id, event_id) = 1",
        )
        .await
    }

    /// Postgres cannot drop an enum value, so only the rows are reverted
    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        if manager.get_database_backend() != DbBackend::Postgres {
            return Ok(());
        }

        let connection = manager.get_connection();
        connection
            .execute_unprepared(
                r#"DELETE FROM notifications WHERE kind IN ('new_proposal', 'event_created')"#,
            )
            .await?;
        replace_target_check(
            manager,
            "num_nonnulls(message_id, poll_id, server_role_id) = 1",
        )
        .await?;
        connection
            .execute_unprepared(&format!(
                r#"DROP INDEX IF EXISTS "{EVENT_ID_INDEX}""#
            ))
            .await?;
        connection
            .execute_unprepared(
                r#"ALTER TABLE notifications DROP COLUMN event_id"#,
            )
            .await?;

        Ok(())
    }
}

async fn replace_target_check(
    manager: &SchemaManager<'_>,
    check: &str,
) -> Result<(), DbErr> {
    let connection = manager.get_connection();
    connection
        .execute_unprepared(&format!(
            r#"ALTER TABLE notifications DROP CONSTRAINT IF EXISTS {TARGET_CHECK}"#
        ))
        .await?;
    connection
        .execute_unprepared(&format!(
            r#"ALTER TABLE notifications ADD CONSTRAINT {TARGET_CHECK} CHECK ({check})"#
        ))
        .await?;

    Ok(())
}
