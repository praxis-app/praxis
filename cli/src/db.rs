use std::{env, io, time::Duration};

use anyhow::{Context, Result};
use sea_orm::{
    ConnectOptions, ConnectionTrait, Database, DatabaseConnection, DbBackend,
    Statement,
};

pub(crate) async fn connect_read_only() -> Result<DatabaseConnection> {
    let database_url = database_url_from_env()?;
    let mut options = ConnectOptions::new(database_url);
    options
        .max_connections(1)
        .sqlx_logging(false)
        .connect_timeout(Duration::from_secs(8));

    let database = Database::connect(options)
        .await
        .context("failed to connect to database")?;

    database
        .execute(Statement::from_string(
            DbBackend::Postgres,
            "SET default_transaction_read_only = on".to_owned(),
        ))
        .await
        .context("failed to mark database session read-only")?;

    Ok(database)
}

fn database_url_from_env() -> Result<String> {
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

fn required_env(name: &str) -> Result<String> {
    env::var(name).map_err(|_| {
        io::Error::new(
            io::ErrorKind::InvalidInput,
            format!("{name} must be set before running the CLI."),
        )
        .into()
    })
}
