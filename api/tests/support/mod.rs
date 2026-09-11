use axum::{
    body::Body,
    http::{Method, Request, Response},
    Router,
};
use http_body_util::BodyExt;
use sea_orm::DatabaseConnection;
use serde::Serialize;
use serde_json::Value;
use std::{
    collections::HashMap,
    env,
    error::Error,
    process,
    process::Command,
    sync::{
        atomic::{AtomicU64, Ordering},
        OnceLock,
    },
    time::{SystemTime, UNIX_EPOCH},
};
use tower::util::ServiceExt;

static DOTENV: OnceLock<()> = OnceLock::new();
static NEXT_DATABASE_ID: AtomicU64 = AtomicU64::new(0);

pub(crate) struct TestApp {
    pub(crate) app: Router,
    database: Option<DatabaseConnection>,
    admin_database_url: String,
    database_name: String,
}

impl TestApp {
    pub(crate) async fn new() -> Self {
        load_dotenv();
        env::set_var(
            "CHANNEL_KEY_MASTER",
            "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
        );
        env::set_var("PROPOSAL_SYNC_INTERVAL_SECONDS", "1");
        env::set_var("LIVEKIT_URL", "ws://livekit.test:7880");
        env::set_var("LIVEKIT_HOST", "livekit.test");
        env::set_var("LIVEKIT_PORT", "7880");
        env::set_var("LIVEKIT_API_KEY", "livekit-test-key");
        env::set_var("LIVEKIT_API_SECRET", "livekit-test-secret");

        let admin_database_url = admin_database_url()
            .expect("expected a local Postgres admin connection string");
        let database_name = unique_database_name();

        create_database(&admin_database_url, &database_name)
            .await
            .expect("expected test database creation to succeed");

        let database_url =
            database_url_for(&admin_database_url, &database_name)
                .expect("expected a test database URL");
        let database = api::connect_database(&database_url, true)
            .await
            .expect("expected test database migrations to succeed");

        let app = api::build_router(
            database.clone(),
            "integration-test-secret",
            None,
        );

        Self {
            app,
            database: Some(database),
            admin_database_url,
            database_name,
        }
    }

    pub(crate) async fn get(&self, uri: &str) -> Response<Body> {
        self.request(Method::GET, uri, Body::empty(), None).await
    }

    pub(crate) async fn get_with_bearer(
        &self,
        uri: &str,
        token: &str,
    ) -> Response<Body> {
        self.request(Method::GET, uri, Body::empty(), Some(token))
            .await
    }

    pub(crate) async fn delete_with_bearer(
        &self,
        uri: &str,
        token: &str,
    ) -> Response<Body> {
        self.request(Method::DELETE, uri, Body::empty(), Some(token))
            .await
    }

    pub(crate) async fn post_json<T: Serialize>(
        &self,
        uri: &str,
        payload: &T,
    ) -> Response<Body> {
        let body = serde_json::to_vec(payload)
            .expect("expected request body serialization");

        self.request(Method::POST, uri, Body::from(body), None)
            .await
    }

    pub(crate) async fn post_json_with_bearer<T: Serialize>(
        &self,
        uri: &str,
        payload: &T,
        token: &str,
    ) -> Response<Body> {
        let body = serde_json::to_vec(payload)
            .expect("expected request body serialization");

        self.request(Method::POST, uri, Body::from(body), Some(token))
            .await
    }

    pub(crate) async fn put_json_with_bearer<T: Serialize>(
        &self,
        uri: &str,
        payload: &T,
        token: &str,
    ) -> Response<Body> {
        let body = serde_json::to_vec(payload)
            .expect("expected request body serialization");

        self.request(Method::PUT, uri, Body::from(body), Some(token))
            .await
    }

    pub(crate) fn database(&self) -> &DatabaseConnection {
        self.database
            .as_ref()
            .expect("expected test database to remain available")
    }

    pub(crate) async fn post_multipart_with_bearer(
        &self,
        uri: &str,
        token: &str,
        fields: HashMap<String, MultipartField>,
    ) -> Response<Body> {
        let boundary =
            format!("praxis-live-boundary-{}", unique_database_name());
        let body = multipart_body(&boundary, fields);

        let request = Request::builder()
            .method(Method::POST)
            .uri(uri)
            .header(
                "content-type",
                format!("multipart/form-data; boundary={boundary}"),
            )
            .header("authorization", format!("Bearer {token}"))
            .body(Body::from(body))
            .expect("expected multipart request to build");

        self.app
            .clone()
            .oneshot(request)
            .await
            .expect("expected router request to succeed")
    }

    async fn request(
        &self,
        method: Method,
        uri: &str,
        body: Body,
        bearer_token: Option<&str>,
    ) -> Response<Body> {
        let mut request = Request::builder()
            .method(method)
            .uri(uri)
            .header("content-type", "application/json");

        if let Some(token) = bearer_token {
            request =
                request.header("authorization", format!("Bearer {token}"));
        }

        self.app
            .clone()
            .oneshot(request.body(body).expect("expected request to build"))
            .await
            .expect("expected router request to succeed")
    }
}

impl Drop for TestApp {
    fn drop(&mut self) {
        let app = std::mem::replace(&mut self.app, Router::new());
        drop(app);

        let Some(database) = self.database.take() else {
            return;
        };

        drop(database);

        let admin_database_url = self.admin_database_url.clone();
        let database_name = self.database_name.clone();

        drop_database(&admin_database_url, &database_name)
            .expect("expected test database cleanup to finish");
    }
}

pub(crate) async fn json_body(response: Response<Body>) -> Value {
    let bytes = response
        .into_body()
        .collect()
        .await
        .expect("expected response body bytes")
        .to_bytes();

    serde_json::from_slice(&bytes).expect("expected a JSON response body")
}

#[derive(Clone, Debug)]
pub(crate) struct MultipartField {
    pub(crate) name: String,
    pub(crate) filename: Option<String>,
    pub(crate) content_type: Option<String>,
    pub(crate) bytes: Vec<u8>,
}

fn multipart_body(
    boundary: &str,
    fields: HashMap<String, MultipartField>,
) -> Vec<u8> {
    let mut body = Vec::new();

    for (_key, field) in fields {
        body.extend_from_slice(format!("--{boundary}\r\n").as_bytes());
        body.extend_from_slice(
            format!(
                "Content-Disposition: form-data; name=\"{}\"{}{}\r\n",
                field.name,
                field
                    .filename
                    .as_ref()
                    .map(|_filename| "; filename=\"")
                    .unwrap_or(""),
                field
                    .filename
                    .as_ref()
                    .map(|filename| format!("{filename}\""))
                    .unwrap_or_default()
            )
            .as_bytes(),
        );

        if let Some(content_type) = field.content_type {
            body.extend_from_slice(
                format!("Content-Type: {content_type}\r\n").as_bytes(),
            );
        }

        body.extend_from_slice(b"\r\n");
        body.extend_from_slice(&field.bytes);
        body.extend_from_slice(b"\r\n");
    }

    body.extend_from_slice(format!("--{boundary}--\r\n").as_bytes());
    body
}

async fn create_database(
    admin_database_url: &str,
    database_name: &str,
) -> Result<(), Box<dyn Error + Send + Sync>> {
    run_psql(
        admin_database_url,
        &format!(r#"CREATE DATABASE "{database_name}""#),
    )?;

    Ok(())
}

fn drop_database(
    admin_database_url: &str,
    database_name: &str,
) -> Result<(), Box<dyn Error + Send + Sync>> {
    run_psql(
        admin_database_url,
        &format!(
            "SELECT pg_terminate_backend(pid) \
             FROM pg_stat_activity \
             WHERE datname = '{database_name}' AND pid <> pg_backend_pid()"
        ),
    )?;
    run_psql(
        admin_database_url,
        &format!(r#"DROP DATABASE IF EXISTS "{database_name}""#),
    )?;

    Ok(())
}

fn run_psql(
    admin_database_url: &str,
    sql: &str,
) -> Result<(), Box<dyn Error + Send + Sync>> {
    let status = Command::new("psql")
        .arg(admin_database_url)
        .arg("-v")
        .arg("ON_ERROR_STOP=1")
        .arg("-c")
        .arg(sql)
        .status()?;

    if status.success() {
        Ok(())
    } else {
        Err(format!("psql command failed while executing: {sql}").into())
    }
}

fn admin_database_url() -> Result<String, Box<dyn Error + Send + Sync>> {
    if let Ok(url) = env::var("PRAXIS_TEST_DATABASE_ADMIN_URL") {
        return Ok(url);
    }

    if let Ok(url) = env::var("DATABASE_URL") {
        return database_url_for(&url, "postgres");
    }

    let host = env_var("DB_HOST")?;
    let port = env_var("DB_PORT")?;
    let username = env_var("DB_USERNAME")?;
    let password = env_var("DB_PASSWORD")?;

    Ok(format!(
        "postgres://{username}:{password}@{host}:{port}/postgres"
    ))
}

fn database_url_for(
    database_url: &str,
    database_name: &str,
) -> Result<String, Box<dyn Error + Send + Sync>> {
    let scheme_index = database_url
        .find("://")
        .ok_or_else(|| format!("invalid Postgres URL: {database_url}"))?;
    let authority_start = scheme_index + 3;
    let path_index = database_url[authority_start..]
        .find('/')
        .map(|index| authority_start + index)
        .ok_or_else(|| {
            format!("missing database path in Postgres URL: {database_url}")
        })?;
    let query_index = database_url[path_index + 1..]
        .find(['?', '#'])
        .map(|index| path_index + 1 + index)
        .unwrap_or(database_url.len());

    Ok(format!(
        "{}/{database_name}{}",
        &database_url[..path_index],
        &database_url[query_index..]
    ))
}

fn env_var(name: &str) -> Result<String, Box<dyn Error + Send + Sync>> {
    env::var(name)
        .map_err(|_| format!("{name} must be set for integration tests").into())
}

fn load_dotenv() {
    DOTENV.get_or_init(|| {
        dotenv::dotenv().ok();
    });
}

fn unique_database_name() -> String {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("expected system time after Unix epoch")
        .as_nanos() as u64;
    let sequence = NEXT_DATABASE_ID.fetch_add(1, Ordering::Relaxed);

    format!("praxis_live_test_{}_{}_{}", process::id(), now, sequence)
}
