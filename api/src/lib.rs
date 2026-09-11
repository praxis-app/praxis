mod auth;
mod authz;
mod cache;
mod calls;
mod channels;
mod common;
mod events;
mod feeds;
mod forum;
mod health;
mod instance;
mod invites;
mod logging;
mod messages;
mod notifications;
mod poll_actions;
mod polls;
mod pub_sub;
mod search;
mod servers;
mod users;
mod view;
mod votes;

use axum::{routing::get, Router};
use sea_orm::{ConnectOptions, Database, DatabaseConnection};
use sea_orm_migration::MigratorTrait;
use std::{env, error::Error, io, net::SocketAddr};
use tower_http::trace::TraceLayer;

#[tokio::main]
pub async fn main() -> Result<(), Box<dyn Error + Send + Sync>> {
    dotenv::dotenv().ok();
    let _logging_guard = logging::init()?;

    let database = connect_database_from_env().await?;
    let jwt_secret = required_env("AUTH_TOKEN_SECRET")?;
    let livekit_config = calls::LiveKitConfig::from_env();
    let cache_service = cache::CacheService::from_env()?;
    let pub_sub_service = pub_sub::PubSubService::new(cache_service.clone());

    calls::spawn_stale_call_cleaner(
        database.clone(),
        pub_sub_service.clone(),
        livekit_config.clone(),
    );

    let app = build_router_with_pub_sub(
        database,
        jwt_secret,
        livekit_config,
        pub_sub_service,
        cache_service,
    )
    .layer(
        TraceLayer::new_for_http()
            .make_span_with(logging::make_request_span)
            .on_request(logging::log_request_start())
            .on_response(logging::log_response)
            .on_failure(()),
    );

    let server_port = env::var("VITE_SERVER_PORT")
        .or_else(|_| env::var("SERVER_PORT"))
        .ok()
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(3100);

    let addr = SocketAddr::from(([0, 0, 0, 0], server_port));
    tracing::info!("Server running at {} 🚀", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

pub fn build_router(
    database: DatabaseConnection,
    jwt_secret: impl Into<String>,
    livekit_config: Option<calls::LiveKitConfig>,
) -> Router {
    let cache_service = cache::CacheService::from_env()
        .expect("Redis must be configured for the cache service");
    let pub_sub_service = pub_sub::PubSubService::new(cache_service.clone());
    build_router_with_pub_sub(
        database,
        jwt_secret,
        livekit_config,
        pub_sub_service,
        cache_service,
    )
}

fn build_router_with_pub_sub(
    database: DatabaseConnection,
    jwt_secret: impl Into<String>,
    livekit_config: Option<calls::LiveKitConfig>,
    pub_sub_service: pub_sub::PubSubService,
    cache_service: cache::CacheService,
) -> Router {
    let jwt_secret = jwt_secret.into();
    polls::service::spawn_proposal_synchronizer(
        database.clone(),
        pub_sub_service.clone(),
    );
    polls::service::spawn_expired_poll_closer(
        database.clone(),
        pub_sub_service.clone(),
    );

    let ws = Router::new().route(
        "/ws",
        get(pub_sub::websocket_handler).with_state(pub_sub::PubSubState::new(
            database.clone(),
            jwt_secret.clone(),
            pub_sub_service.clone(),
        )),
    );

    let api = Router::new()
        .route("/health", get(health::health))
        .merge(auth::router(database.clone(), jwt_secret.clone()))
        .merge(invites::router(database.clone(), jwt_secret.clone()))
        .merge(users::router(
            database.clone(),
            jwt_secret.clone(),
            cache_service.clone(),
        ))
        .merge(instance::router(
            database.clone(),
            jwt_secret.clone(),
            livekit_config.is_some(),
        ))
        .merge(servers::router(
            database.clone(),
            jwt_secret.clone(),
            pub_sub_service.clone(),
            cache_service,
            livekit_config.clone(),
        ))
        .merge(calls::livekit_webhook_router(
            database,
            jwt_secret,
            livekit_config,
        ));

    view::attach(ws.nest("/api", api))
}

async fn connect_database_from_env(
) -> Result<DatabaseConnection, Box<dyn Error + Send + Sync>> {
    connect_database(&database_url_from_env()?, migrations_enabled()).await
}

pub async fn connect_database(
    database_url: &str,
    run_migrations: bool,
) -> Result<DatabaseConnection, Box<dyn Error + Send + Sync>> {
    let mut options = ConnectOptions::new(database_url.to_owned());
    options.max_connections(5);

    let database = Database::connect(options).await?;

    if run_migrations {
        let pending_migrations =
            migrations::Migrator::get_pending_migrations(&database).await?;

        if !pending_migrations.is_empty() {
            tracing::info!("Running database migrations.");
            migrations::Migrator::up(&database, None).await?;
        }
    }

    instance::initialize(&database)
        .await
        .map_err(|error| io::Error::other(error.to_string()))?;

    Ok(database)
}

fn database_url_from_env() -> Result<String, Box<dyn Error + Send + Sync>> {
    if let Ok(database_url) = env::var("DATABASE_URL") {
        return Ok(database_url);
    }

    let host = required_env("DB_HOST")?;
    let port = required_env("DB_PORT")?.parse::<u16>().map_err(|error| {
        io::Error::new(
            io::ErrorKind::InvalidInput,
            format!("DB_PORT must be a valid u16: {error}"),
        )
    })?;
    let username = required_env("DB_USERNAME")?;
    let password = required_env("DB_PASSWORD")?;
    let database = required_env("DB_SCHEMA")?;

    Ok(format!(
        "postgres://{username}:{password}@{host}:{port}/{database}"
    ))
}

fn migrations_enabled() -> bool {
    env::var("DB_MIGRATIONS")
        .map(|value| value.eq_ignore_ascii_case("true"))
        .unwrap_or(false)
}

fn required_env(name: &str) -> Result<String, Box<dyn Error + Send + Sync>> {
    env::var(name).map_err(|_| {
        io::Error::new(
            io::ErrorKind::InvalidInput,
            format!("{name} must be set before starting the server."),
        )
        .into()
    })
}
