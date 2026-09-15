use chrono::{Duration, Utc};
use entity::calls;
use sea_orm::{
    sea_query::Expr, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter,
};
use std::env;
use tokio::time::{self, MissedTickBehavior};

use super::{
    livekit::{livekit_room_participant_count, LiveKitConfig},
    service::{
        broadcast_call, end_call, internal_error, shape_call_artifact,
        ACTIVE_STATUSES,
    },
};
use crate::{common::AppResult, pub_sub::PubSubService};

const STALE_CALL_CLEANUP_INTERVAL_SECONDS: u64 = 10;
const STALE_STARTING_MINUTES: i64 = 15;
const STALE_ACTIVE_HOURS: i64 = 24;
const STALE_ENDING_MINUTES: i64 = 5;
const EMPTY_ROOM_CLEANUP_GRACE_SECONDS: i64 = 30;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
struct StaleCallCleanupSummary {
    failed_starting: u64,
    ended_empty: u64,
    ended_active: u64,
    ended_ending: u64,
}

#[derive(Debug)]
struct StaleCallCleanup {
    summary: StaleCallCleanupSummary,
    calls: Vec<calls::Model>,
}

pub(crate) fn spawn_stale_call_cleaner(
    database: DatabaseConnection,
    pub_sub_service: PubSubService,
    livekit: Option<LiveKitConfig>,
) {
    let Some(livekit) = livekit else {
        return;
    };

    tokio::spawn(async move {
        let mut interval = time::interval(std::time::Duration::from_secs(
            configured_interval_seconds(
                "STALE_CALL_CLEANUP_INTERVAL_SECONDS",
                STALE_CALL_CLEANUP_INTERVAL_SECONDS,
            ),
        ));
        interval.set_missed_tick_behavior(MissedTickBehavior::Skip);

        // Intentionally infinite: this task lives as long as the server. Each
        // pass awaits the interval tick and only logs errors, so a failing
        // pass waits for the next tick instead of spinning
        loop {
            interval.tick().await;

            match cleanup_stale_calls(&database).await {
                Ok(cleanup) => {
                    if cleanup.summary.failed_starting > 0
                        || cleanup.summary.ended_empty > 0
                        || cleanup.summary.ended_active > 0
                        || cleanup.summary.ended_ending > 0
                    {
                        tracing::info!(
                            failed_starting = cleanup.summary.failed_starting,
                            ended_empty = cleanup.summary.ended_empty,
                            ended_active = cleanup.summary.ended_active,
                            ended_ending = cleanup.summary.ended_ending,
                            "Cleaned up stale calls."
                        );
                    }

                    broadcast_cleaned_call_updates(
                        &database,
                        &pub_sub_service,
                        cleanup.calls,
                    )
                    .await;
                }
                Err(error) => {
                    tracing::warn!("Failed to clean up stale calls: {error}");
                }
            }

            match cleanup_empty_active_calls(&database, &livekit).await {
                Ok(cleaned_calls) if cleaned_calls.is_empty() => {}
                Ok(cleaned_calls) => {
                    tracing::info!(
                        ended_empty = cleaned_calls.len(),
                        "Ended active calls with empty LiveKit rooms."
                    );
                    broadcast_cleaned_call_updates(
                        &database,
                        &pub_sub_service,
                        cleaned_calls,
                    )
                    .await;
                }
                Err(error) => {
                    tracing::warn!("Failed to clean up empty calls: {error}");
                }
            }
        }
    });
}

async fn cleanup_stale_calls(
    database: &DatabaseConnection,
) -> AppResult<StaleCallCleanup> {
    let now = Utc::now().fixed_offset();
    let failed_starting = cleanup_stale_calls_by_status(
        database,
        now,
        "starting",
        "failed",
        "stale_starting",
        now - Duration::minutes(STALE_STARTING_MINUTES),
    )
    .await?;
    let ended_active = cleanup_stale_calls_by_status(
        database,
        now,
        "active",
        "ended",
        "stale_active",
        now - Duration::hours(STALE_ACTIVE_HOURS),
    )
    .await?;
    let ended_ending = cleanup_stale_calls_by_status(
        database,
        now,
        "ending",
        "ended",
        "stale_ending",
        now - Duration::minutes(STALE_ENDING_MINUTES),
    )
    .await?;

    let summary = StaleCallCleanupSummary {
        failed_starting: failed_starting.len() as u64,
        ended_empty: 0,
        ended_active: ended_active.len() as u64,
        ended_ending: ended_ending.len() as u64,
    };
    let calls = failed_starting
        .into_iter()
        .chain(ended_active)
        .chain(ended_ending)
        .collect();

    Ok(StaleCallCleanup { summary, calls })
}

async fn cleanup_stale_calls_by_status(
    database: &DatabaseConnection,
    now: chrono::DateTime<chrono::FixedOffset>,
    current_status: &str,
    next_status: &str,
    reason: &str,
    stale_before: chrono::DateTime<chrono::FixedOffset>,
) -> AppResult<Vec<calls::Model>> {
    let candidates = calls::Entity::find()
        .filter(calls::Column::Status.eq(current_status))
        .filter(calls::Column::UpdatedAt.lt(stale_before))
        .all(database)
        .await
        .map_err(internal_error)?;
    let mut cleaned_calls = Vec::new();

    for call in candidates {
        let result = calls::Entity::update_many()
            .col_expr(calls::Column::Status, Expr::value(next_status))
            .col_expr(calls::Column::EndedReason, Expr::value(reason))
            .col_expr(calls::Column::UpdatedAt, Expr::value(now))
            .filter(calls::Column::Id.eq(call.id))
            .filter(calls::Column::Status.eq(current_status))
            .filter(calls::Column::UpdatedAt.lt(stale_before))
            .exec(database)
            .await
            .map_err(internal_error)?;

        if result.rows_affected == 0 {
            continue;
        }

        if let Some(call) = calls::Entity::find_by_id(call.id)
            .one(database)
            .await
            .map_err(internal_error)?
        {
            cleaned_calls.push(call);
        }
    }

    Ok(cleaned_calls)
}

async fn broadcast_cleaned_call_updates(
    database: &DatabaseConnection,
    pub_sub_service: &PubSubService,
    calls: Vec<calls::Model>,
) {
    for call in calls {
        let server_id = call.server_id;
        let channel_id = call.channel_id;
        let artifact = match shape_call_artifact(database, call).await {
            Ok(artifact) => artifact,
            Err(error) => {
                tracing::warn!(
                    "failed to load cleaned call artifact for broadcast: {error}"
                );
                continue;
            }
        };

        if let Err(error) = broadcast_call(
            database,
            Some(pub_sub_service),
            server_id,
            channel_id,
            None,
            &artifact,
        )
        .await
        {
            tracing::warn!("failed to broadcast cleaned call update: {error}");
        }
    }
}

async fn cleanup_empty_active_calls(
    database: &DatabaseConnection,
    livekit: &LiveKitConfig,
) -> AppResult<Vec<calls::Model>> {
    let active_calls = calls::Entity::find()
        .filter(calls::Column::Status.is_in(ACTIVE_STATUSES))
        .filter(calls::Column::UpdatedAt.lt(Utc::now().fixed_offset()
            - Duration::seconds(EMPTY_ROOM_CLEANUP_GRACE_SECONDS)))
        .all(database)
        .await
        .map_err(internal_error)?;
    let mut cleaned_calls = Vec::new();

    for call in active_calls {
        let participant_count =
            livekit_room_participant_count(livekit, &call.livekit_room).await?;

        if participant_count > 0 {
            continue;
        }

        let call = end_call(database, call, None, "empty_livekit_room").await?;
        cleaned_calls.push(call);
    }

    Ok(cleaned_calls)
}

fn configured_interval_seconds(env_key: &str, default: u64) -> u64 {
    env::var(env_key)
        .ok()
        .and_then(|value| value.parse::<u64>().ok())
        .filter(|value| *value > 0)
        .unwrap_or(default)
}
