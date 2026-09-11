use std::{error::Error, io, sync::Arc, time::Duration};

use super::redis::{redis_url_from_env, RedisCache};
use crate::common::AppResult;

#[derive(Clone, Debug)]
pub(crate) struct CacheService {
    cache: Arc<RedisCache>,
}

impl CacheService {
    pub(crate) fn from_env() -> Result<Self, Box<dyn Error + Send + Sync>> {
        let redis_url = redis_url_from_env().ok_or_else(|| {
            io::Error::new(
                io::ErrorKind::InvalidInput,
                "Redis must be configured via REDIS_URL, or REDIS_HOST and \
                 REDIS_PORT, before starting the server.",
            )
        })?;
        let redis = RedisCache::connect(&redis_url)?;

        Ok(Self {
            cache: Arc::new(redis),
        })
    }

    pub(crate) async fn get(&self, key: &str) -> AppResult<Option<String>> {
        self.cache.get(key).await
    }

    pub(crate) async fn set(
        &self,
        key: String,
        value: String,
        expiry: Duration,
    ) -> AppResult<()> {
        self.cache.set(&key, &value, expiry.as_secs()).await
    }

    pub(crate) async fn add_member(
        &self,
        key: String,
        value: String,
    ) -> AppResult<()> {
        self.cache.add_member(&key, &value).await
    }

    pub(crate) async fn remove_member(
        &self,
        key: String,
        value: &str,
    ) -> AppResult<()> {
        self.cache.remove_member(&key, value).await
    }

    pub(crate) async fn members(&self, key: String) -> AppResult<Vec<String>> {
        self.cache.members(&key).await
    }
}
