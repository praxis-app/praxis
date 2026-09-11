use axum::Json;
use serde::Serialize;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Serialize)]
pub(crate) struct HealthResponse {
    status: &'static str,
    timestamp: u64,
}

pub(crate) async fn health() -> Json<HealthResponse> {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system clock should be after Unix epoch")
        .as_secs();

    Json(HealthResponse {
        status: "ok",
        timestamp,
    })
}
