use redis::AsyncCommands;
use std::env;

use crate::common::{ApiError, AppResult};

#[derive(Clone, Debug)]
pub(super) struct RedisCache {
    client: redis::Client,
}

impl RedisCache {
    pub(super) fn connect(redis_url: &str) -> Result<Self, redis::RedisError> {
        Ok(Self {
            client: redis::Client::open(redis_url)?,
        })
    }

    pub(super) async fn get(&self, key: &str) -> AppResult<Option<String>> {
        let mut connection = self.connection().await?;
        connection.get(key).await.map_err(internal_error)
    }

    pub(super) async fn set(
        &self,
        key: &str,
        value: &str,
        expiry_secs: u64,
    ) -> AppResult<()> {
        let mut connection = self.connection().await?;
        connection
            .set_ex(key, value, expiry_secs)
            .await
            .map_err(internal_error)
    }

    pub(super) async fn add_member(
        &self,
        key: &str,
        value: &str,
    ) -> AppResult<()> {
        let mut connection = self.connection().await?;
        let _: usize =
            connection.sadd(key, value).await.map_err(internal_error)?;
        Ok(())
    }

    pub(super) async fn remove_member(
        &self,
        key: &str,
        value: &str,
    ) -> AppResult<()> {
        let mut connection = self.connection().await?;
        let _: usize =
            connection.srem(key, value).await.map_err(internal_error)?;
        Ok(())
    }

    pub(super) async fn members(&self, key: &str) -> AppResult<Vec<String>> {
        let mut connection = self.connection().await?;
        connection.smembers(key).await.map_err(internal_error)
    }

    async fn connection(&self) -> AppResult<redis::aio::MultiplexedConnection> {
        self.client
            .get_multiplexed_async_connection()
            .await
            .map_err(internal_error)
    }
}

pub(super) fn redis_url_from_env() -> Option<String> {
    if let Ok(redis_url) = env::var("REDIS_URL") {
        if !redis_url.trim().is_empty() {
            return Some(redis_url);
        }
    }

    let host = env::var("REDIS_HOST").ok()?;
    if host.trim().is_empty() {
        return None;
    }
    let port = env::var("REDIS_PORT").unwrap_or_else(|_| "6379".to_owned());
    let password = env::var("REDIS_PASSWORD").ok();

    Some(match password {
        Some(password) if !password.is_empty() => {
            format!("redis://:{password}@{host}:{port}")
        }
        _ => format!("redis://{host}:{port}"),
    })
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("cache request failed: {error}");
    ApiError::new(
        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        "Internal server error.",
    )
}
