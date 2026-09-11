mod args;
mod commands;
mod db;

use anyhow::Result;
use args::{Cli, Commands};
use clap::Parser;

#[tokio::main]
async fn main() -> Result<()> {
    dotenv::dotenv().ok();

    let cli = Cli::parse();

    match cli.command {
        Commands::PollStats(args) => {
            let database = db::connect_read_only().await?;
            commands::poll_stats::run(&database, args).await?;
        }
        Commands::Schema => {
            let database = db::connect_read_only().await?;
            commands::schema::run(&database).await?;
        }
        Commands::Routes(args) => {
            commands::routes::run(args)?;
        }
    }

    Ok(())
}
