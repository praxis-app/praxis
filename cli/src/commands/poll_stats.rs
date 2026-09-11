use anyhow::{ensure, Result};
use chrono::{DateTime, FixedOffset, NaiveDate, Utc};
use owo_colors::OwoColorize;
use sea_orm::{ConnectionTrait, DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

use crate::args::PollStatsArgs;

pub(crate) async fn run(
    database: &impl ConnectionTrait,
    args: PollStatsArgs,
) -> Result<()> {
    ensure!(args.days > 0, "--days must be greater than zero");
    ensure!(args.top_polls >= 0, "--top-polls cannot be negative");
    ensure!(args.top_channels >= 0, "--top-channels cannot be negative");

    let filter = PollFilter::from_args(&args);
    let overview = fetch_one::<Overview>(
        database,
        &overview_sql(&filter),
        filter.values(),
    )
    .await?;
    let type_counts = fetch_all::<LabelCount>(
        database,
        &type_counts_sql(&filter),
        filter.values(),
    )
    .await?;
    let stage_counts = fetch_all::<LabelCount>(
        database,
        &stage_counts_sql(&filter),
        filter.values(),
    )
    .await?;
    let vote_mix = fetch_all::<LabelCount>(
        database,
        &vote_mix_sql(&filter),
        filter.values(),
    )
    .await?;
    let trend =
        fetch_all::<TrendRow>(database, &trend_sql(&filter), filter.values())
            .await?;
    let active_polls = fetch_all::<ActivePoll>(
        database,
        &active_polls_sql(&filter),
        filter.values_with_limit(args.top_polls),
    )
    .await?;
    let top_channels = fetch_all::<TopChannel>(
        database,
        &top_channels_sql(&filter),
        filter.values_with_limit(args.top_channels),
    )
    .await?;

    print_report(
        &args,
        overview,
        type_counts,
        stage_counts,
        vote_mix,
        trend,
        active_polls,
        top_channels,
    );

    Ok(())
}

#[derive(Clone, Debug)]
struct PollFilter {
    days: i64,
    server_id: Option<Uuid>,
    channel_id: Option<Uuid>,
    poll_id: Option<Uuid>,
}

impl PollFilter {
    fn from_args(args: &PollStatsArgs) -> Self {
        Self {
            days: args.days,
            server_id: args.server_id,
            channel_id: args.channel_id,
            poll_id: args.poll_id,
        }
    }

    fn where_clause(&self) -> String {
        let mut clauses =
            vec!["p.created_at >= now() - ($1 * interval '1 day')".to_owned()];
        let mut next_param = 2;

        if self.server_id.is_some() {
            clauses.push(format!("c.server_id = ${next_param}"));
            next_param += 1;
        }

        if self.channel_id.is_some() {
            clauses.push(format!("p.channel_id = ${next_param}"));
            next_param += 1;
        }

        if self.poll_id.is_some() {
            clauses.push(format!("p.id = ${next_param}"));
        }

        clauses.join(" AND ")
    }

    fn values(&self) -> Vec<Value> {
        let mut values = vec![self.days.into()];

        if let Some(server_id) = self.server_id {
            values.push(server_id.into());
        }

        if let Some(channel_id) = self.channel_id {
            values.push(channel_id.into());
        }

        if let Some(poll_id) = self.poll_id {
            values.push(poll_id.into());
        }

        values
    }

    fn values_with_limit(&self, limit: i64) -> Vec<Value> {
        let mut values = self.values();
        values.push(limit.into());
        values
    }

    fn next_param(&self) -> usize {
        self.values().len() + 1
    }
}

#[derive(Debug, FromQueryResult)]
struct Overview {
    poll_count: i64,
    configured_poll_count: i64,
    total_votes: i64,
    unique_voters: i64,
    voted_polls: i64,
    average_votes_per_poll: f64,
}

#[derive(Debug, FromQueryResult)]
struct LabelCount {
    label: String,
    count: i64,
}

#[derive(Debug, FromQueryResult)]
struct TrendRow {
    day: NaiveDate,
    count: i64,
}

#[derive(Debug, FromQueryResult)]
struct ActivePoll {
    poll_id: Uuid,
    channel_id: Uuid,
    channel_name: String,
    vote_count: i64,
    last_vote_at: Option<DateTime<FixedOffset>>,
}

#[derive(Debug, FromQueryResult)]
struct TopChannel {
    channel_id: Uuid,
    channel_name: String,
    poll_count: i64,
    vote_count: i64,
}

fn scoped_polls_cte(filter: &PollFilter) -> String {
    format!(
        "WITH scoped_polls AS (
            SELECT p.id, p.poll_type, p.stage, p.channel_id, p.created_at, c.name AS channel_name
            FROM polls p
            JOIN channels c ON c.id = p.channel_id
            WHERE {}
        )",
        filter.where_clause()
    )
}

fn overview_sql(filter: &PollFilter) -> String {
    format!(
        "{} ,
        per_poll AS (
            SELECT sp.id, COUNT(v.id)::bigint AS vote_count
            FROM scoped_polls sp
            LEFT JOIN votes v ON v.poll_id = sp.id
            GROUP BY sp.id
        )
        SELECT
            (SELECT COUNT(*)::bigint FROM scoped_polls) AS poll_count,
            (
                SELECT COUNT(*)::bigint
                FROM scoped_polls sp
                JOIN poll_configs pc ON pc.poll_id = sp.id
            ) AS configured_poll_count,
            COALESCE((SELECT SUM(vote_count)::bigint FROM per_poll), 0) AS total_votes,
            (
                SELECT COUNT(DISTINCT v.user_id)::bigint
                FROM scoped_polls sp
                JOIN votes v ON v.poll_id = sp.id
            ) AS unique_voters,
            (
                SELECT COUNT(*)::bigint
                FROM per_poll
                WHERE vote_count > 0
            ) AS voted_polls,
            COALESCE((SELECT AVG(vote_count)::float8 FROM per_poll), 0) AS average_votes_per_poll",
        scoped_polls_cte(filter)
    )
}

fn type_counts_sql(filter: &PollFilter) -> String {
    format!(
        "{}
        SELECT poll_type::text AS label, COUNT(*)::bigint AS count
        FROM scoped_polls
        GROUP BY poll_type::text
        ORDER BY count DESC, label",
        scoped_polls_cte(filter)
    )
}

fn stage_counts_sql(filter: &PollFilter) -> String {
    format!(
        "{}
        SELECT stage::text AS label, COUNT(*)::bigint AS count
        FROM scoped_polls
        WHERE poll_type::text = 'proposal'
        GROUP BY stage::text
        ORDER BY count DESC, label",
        scoped_polls_cte(filter)
    )
}

fn vote_mix_sql(filter: &PollFilter) -> String {
    format!(
        "{}
        SELECT COALESCE(v.vote_type::text, 'unselected') AS label, COUNT(v.id)::bigint AS count
        FROM scoped_polls sp
        JOIN votes v ON v.poll_id = sp.id
        GROUP BY COALESCE(v.vote_type::text, 'unselected')
        ORDER BY count DESC, label",
        scoped_polls_cte(filter)
    )
}

fn trend_sql(filter: &PollFilter) -> String {
    format!(
        "{}
        SELECT date_trunc('day', created_at)::date AS day, COUNT(*)::bigint AS count
        FROM scoped_polls
        GROUP BY day
        ORDER BY day DESC
        LIMIT 14",
        scoped_polls_cte(filter)
    )
}

fn active_polls_sql(filter: &PollFilter) -> String {
    format!(
        "{}
        SELECT
            sp.id AS poll_id,
            sp.channel_id,
            sp.channel_name,
            COUNT(v.id)::bigint AS vote_count,
            MAX(v.created_at) AS last_vote_at
        FROM scoped_polls sp
        LEFT JOIN votes v ON v.poll_id = sp.id
        GROUP BY sp.id, sp.poll_type, sp.stage, sp.channel_id, sp.channel_name
        HAVING COUNT(v.id) > 0
        ORDER BY vote_count DESC, last_vote_at DESC NULLS LAST, sp.id
        LIMIT ${}",
        scoped_polls_cte(filter),
        filter.next_param()
    )
}

fn top_channels_sql(filter: &PollFilter) -> String {
    format!(
        "{}
        SELECT
            sp.channel_id,
            sp.channel_name,
            COUNT(DISTINCT sp.id)::bigint AS poll_count,
            COUNT(v.id)::bigint AS vote_count
        FROM scoped_polls sp
        LEFT JOIN votes v ON v.poll_id = sp.id
        GROUP BY sp.channel_id, sp.channel_name
        ORDER BY vote_count DESC, poll_count DESC, sp.channel_name
        LIMIT ${}",
        scoped_polls_cte(filter),
        filter.next_param()
    )
}

async fn fetch_one<T>(
    database: &impl ConnectionTrait,
    sql: &str,
    values: Vec<Value>,
) -> Result<T>
where
    T: FromQueryResult + Send + Sync,
{
    let row = T::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        sql,
        values,
    ))
    .one(database)
    .await?;

    row.ok_or_else(|| anyhow::anyhow!("query returned no rows"))
}

async fn fetch_all<T>(
    database: &impl ConnectionTrait,
    sql: &str,
    values: Vec<Value>,
) -> Result<Vec<T>>
where
    T: FromQueryResult + Send + Sync,
{
    Ok(T::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        sql,
        values,
    ))
    .all(database)
    .await?)
}

fn print_report(
    args: &PollStatsArgs,
    overview: Overview,
    type_counts: Vec<LabelCount>,
    stage_counts: Vec<LabelCount>,
    vote_mix: Vec<LabelCount>,
    trend: Vec<TrendRow>,
    active_polls: Vec<ActivePoll>,
    top_channels: Vec<TopChannel>,
) {
    let since = Utc::now() - chrono::Duration::days(args.days);
    println!(
        "\n{} {}",
        "Poll Stats".bold().underline(),
        format!(
            "(last {} days, since {})",
            args.days,
            since.format("%Y-%m-%d")
        )
        .dimmed()
    );
    print_scope(args);

    println!(
        "{} {} polls created",
        "•".cyan(),
        format_number(overview.poll_count).bold()
    );
    println!(
        "{} {} configured polls",
        "•".cyan(),
        format_number(overview.configured_poll_count).bold()
    );

    print_label_counts("Poll Types", &type_counts, overview.poll_count, None);
    print_label_counts(
        "Proposal Stages",
        &stage_counts,
        stage_counts.iter().map(|row| row.count).sum(),
        Some(color_stage),
    );

    println!(
        "\n{}\n{} {} votes captured\n{} {} unique voters\n{} {} polls with votes",
        "Votes".bold(),
        "•".cyan(),
        format_number(overview.total_votes).bold(),
        "•".cyan(),
        format_number(overview.unique_voters).bold(),
        "•".cyan(),
        format_number(overview.voted_polls).bold()
    );
    print_inline_counts(&vote_mix, overview.total_votes, color_vote);
    println!(
        "{} avg votes per poll",
        format!("{:.1}", overview.average_votes_per_poll)
            .green()
            .bold()
    );
    print_trend(&trend);
    if args.poll_id.is_none() && args.top_polls > 0 {
        print_active_polls(&active_polls);
    }
    if args.top_channels > 0 {
        print_top_channels(&top_channels);
    }
}

fn print_scope(args: &PollStatsArgs) {
    let mut parts = Vec::new();

    if let Some(server_id) = args.server_id {
        parts.push(format!("server_id={server_id}"));
    }

    if let Some(channel_id) = args.channel_id {
        parts.push(format!("channel_id={channel_id}"));
    }

    if let Some(poll_id) = args.poll_id {
        parts.push(format!("poll_id={poll_id}"));
    }

    if !parts.is_empty() {
        println!("{}", format!("Scope: {}", parts.join(", ")).dimmed());
    }
}

fn print_label_counts(
    title: &str,
    rows: &[LabelCount],
    total: i64,
    colorize: Option<fn(&str) -> String>,
) {
    if rows.is_empty() {
        return;
    }

    println!("\n{}", title.bold());
    for row in rows {
        let label = colorize
            .map(|colorize| colorize(&row.label))
            .unwrap_or_else(|| row.label.clone().bold().to_string());
        println!(
            "  {} {:<10} {:>6} ({:>5.1}%)",
            "→".dimmed(),
            label,
            format_number(row.count).bold(),
            pct(row.count, total)
        );
    }
}

fn print_inline_counts(
    rows: &[LabelCount],
    total: i64,
    colorize: fn(&str) -> String,
) {
    for row in rows {
        println!(
            "  {} {:<9} {:>6} ({:>5.1}%)",
            "→".dimmed(),
            colorize(&row.label),
            format_number(row.count).bold(),
            pct(row.count, total)
        );
    }
}

fn print_trend(rows: &[TrendRow]) {
    println!();
    println!("{}", "Recent Creation Trend".bold());
    if rows.is_empty() {
        return;
    }

    for row in rows.iter().rev() {
        let bar = "▇".repeat(row.count.clamp(0, 25) as usize);
        println!(
            "{} {:>4} {}",
            row.day.format("%b %d").to_string().dimmed(),
            row.count,
            bar.blue()
        );
    }
}

fn print_active_polls(rows: &[ActivePoll]) {
    println!();
    println!("{}", "Most Active Polls".bold());
    if rows.is_empty() {
        return;
    }

    for row in rows {
        let freshness = row
            .last_vote_at
            .map(|ts| {
                let ts_utc = ts.with_timezone(&Utc);
                format!("last vote {}", humanize(ts_utc))
            })
            .unwrap_or_else(|| "no votes yet".to_owned());
        println!(
            "{} poll {} (channel {} {}) - {} votes, {}",
            "•".cyan(),
            row.poll_id,
            row.channel_id,
            row.channel_name.dimmed(),
            format_number(row.vote_count).bold(),
            freshness.dimmed()
        );
    }
}

fn print_top_channels(rows: &[TopChannel]) {
    println!();
    println!("{}", "Top Channels".bold());
    if rows.is_empty() {
        return;
    }

    for row in rows {
        println!(
            "{} {} {} ({} polls, {} votes)",
            "•".cyan(),
            row.channel_id,
            row.channel_name.dimmed(),
            format_number(row.poll_count).bold(),
            format_number(row.vote_count).bold()
        );
    }
}

fn format_number(value: i64) -> String {
    let sign = if value < 0 { "-" } else { "" };
    let mut digits: Vec<char> = value.abs().to_string().chars().collect();
    let mut i = digits.len() as isize - 3;

    while i > 0 {
        digits.insert(i as usize, ',');
        i -= 3;
    }

    format!("{sign}{}", digits.into_iter().collect::<String>())
}

fn pct(count: i64, total: i64) -> f64 {
    if total > 0 {
        (count as f64 / total as f64) * 100.0
    } else {
        0.0
    }
}

fn color_stage(stage: &str) -> String {
    match stage {
        "voting" => stage.yellow().bold().to_string(),
        "ratified" => stage.green().bold().to_string(),
        "revision" => stage.blue().bold().to_string(),
        "closed" => stage.magenta().bold().to_string(),
        other => other.to_string(),
    }
}

fn color_vote(vote: &str) -> String {
    match vote {
        "agree" => vote.green().bold().to_string(),
        "disagree" => vote.red().bold().to_string(),
        "abstain" => vote.cyan().bold().to_string(),
        "block" => vote.magenta().bold().to_string(),
        other => other.to_string(),
    }
}

fn humanize(ts: DateTime<Utc>) -> String {
    let now = Utc::now();
    let delta = now - ts;

    if delta.num_minutes() < 60 {
        format!("{}m ago", delta.num_minutes())
    } else if delta.num_hours() < 24 {
        format!("{}h ago", delta.num_hours())
    } else {
        format!("{}d ago", delta.num_days())
    }
}
