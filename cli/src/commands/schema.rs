use std::io::IsTerminal;

use anyhow::Result;
use owo_colors::OwoColorize;
use sea_orm::{ConnectionTrait, DbBackend, FromQueryResult, Statement, Value};

pub(crate) async fn run(database: &impl ConnectionTrait) -> Result<()> {
    let color = std::io::stdout().is_terminal();

    if color {
        println!("\n{}", "Database Schema".bold().underline());
    } else {
        println!("\nDatabase Schema");
    }

    print_enums(database, color).await?;
    print_tables(database, color).await?;

    Ok(())
}

async fn print_enums(
    database: &impl ConnectionTrait,
    color: bool,
) -> Result<()> {
    let enums = fetch_all::<EnumInfo>(
        database,
        r#"
        SELECT t.typname AS name,
               ARRAY_AGG(e.enumlabel ORDER BY e.enumsortorder) AS values
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public'
        GROUP BY t.typname
        ORDER BY t.typname
        "#,
        vec![],
    )
    .await?;

    if !enums.is_empty() {
        print_header("Enums", color);
        for EnumInfo { name, values } in enums {
            if color {
                println!(
                    "  {} {} = {{ {} }}",
                    "•".cyan(),
                    name.yellow(),
                    values.join(", ")
                );
            } else {
                println!("  - {} = {{ {} }}", name, values.join(", "));
            }
        }
    }

    Ok(())
}

async fn print_tables(
    database: &impl ConnectionTrait,
    color: bool,
) -> Result<()> {
    let tables = fetch_all::<TableInfo>(
        database,
        r#"
        SELECT table_name AS name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
        ORDER BY table_name
        "#,
        vec![],
    )
    .await?;

    for TableInfo { name } in tables {
        if color {
            println!("\n{} {}", "Table:".bold(), name.green().bold());
        } else {
            println!("\nTable: {}", name);
        }

        print_columns(database, &name, color).await?;
        print_indexes(database, &name, color).await?;
        print_constraints(database, &name, color).await?;
    }

    Ok(())
}

async fn print_columns(
    database: &impl ConnectionTrait,
    table_name: &str,
    color: bool,
) -> Result<()> {
    let columns = fetch_all::<ColumnInfo>(
        database,
        r#"
        SELECT column_name AS name,
               CASE
                   WHEN data_type = 'ARRAY' THEN
                       COALESCE(udt_name, data_type)
                   WHEN data_type = 'USER-DEFINED' THEN
                       udt_name
                   WHEN character_maximum_length IS NOT NULL THEN
                       data_type || '(' || character_maximum_length || ')'
                   WHEN numeric_precision IS NOT NULL AND data_type NOT IN ('integer', 'bigint', 'smallint') THEN
                       data_type || '(' || numeric_precision || ',' || COALESCE(numeric_scale, 0) || ')'
                   ELSE data_type
               END AS data_type,
               is_nullable AS nullable,
               column_default AS default_value
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position
        "#,
        vec![table_name.to_owned().into()],
    )
    .await?;

    print_section_label("Columns:", color);

    for ColumnInfo {
        name,
        data_type,
        nullable,
        default_value,
    } in columns
    {
        let null_marker = if nullable == "YES" { "?" } else { "" };
        let default_str = default_value
            .map(|default| format!(" = {}", default))
            .unwrap_or_default();

        if color {
            println!(
                "    {} {:<30} {}{}{}",
                "→".dimmed(),
                name,
                data_type.cyan(),
                null_marker.yellow(),
                default_str.dimmed()
            );
        } else {
            println!(
                "    - {:<30} {}{}{}",
                name, data_type, null_marker, default_str
            );
        }
    }

    Ok(())
}

async fn print_indexes(
    database: &impl ConnectionTrait,
    table_name: &str,
    color: bool,
) -> Result<()> {
    let indexes = fetch_all::<IndexInfo>(
        database,
        r#"
        SELECT indexname AS name,
               indexdef AS definition
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = $1
        ORDER BY indexname
        "#,
        vec![table_name.to_owned().into()],
    )
    .await?;

    if !indexes.is_empty() {
        print_section_label("Indexes:", color);

        for IndexInfo { name, definition } in indexes {
            let is_unique = definition.to_lowercase().contains("unique");
            let is_primary = name.ends_with("_pkey") || name.contains("PK_");
            let marker = if is_primary {
                "PK"
            } else if is_unique {
                "UQ"
            } else {
                "IX"
            };
            let columns = extract_index_columns(&definition);

            if color {
                let colored_marker = match marker {
                    "PK" => marker.magenta().bold().to_string(),
                    "UQ" => marker.blue().bold().to_string(),
                    _ => marker.dimmed().to_string(),
                };
                println!(
                    "    {} [{}] {} ({})",
                    "→".dimmed(),
                    colored_marker,
                    name,
                    columns
                );
            } else {
                println!("    - [{}] {} ({})", marker, name, columns);
            }
        }
    }

    Ok(())
}

async fn print_constraints(
    database: &impl ConnectionTrait,
    table_name: &str,
    color: bool,
) -> Result<()> {
    let constraints = fetch_all::<ConstraintInfo>(
        database,
        r#"
        SELECT
            c.conname AS name,
            CASE c.contype
                WHEN 'p' THEN 'PRIMARY KEY'
                WHEN 'f' THEN 'FOREIGN KEY'
                WHEN 'u' THEN 'UNIQUE'
                WHEN 'c' THEN 'CHECK'
                WHEN 'x' THEN 'EXCLUDE'
            END AS constraint_type,
            pg_get_constraintdef(c.oid) AS definition
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE n.nspname = 'public'
          AND t.relname = $1
          AND c.contype IN ('f', 'c', 'x')
        ORDER BY c.contype, c.conname
        "#,
        vec![table_name.to_owned().into()],
    )
    .await?;

    if !constraints.is_empty() {
        print_section_label("Constraints:", color);

        for ConstraintInfo {
            name,
            constraint_type,
            definition,
        } in constraints
        {
            let marker = match constraint_type.as_str() {
                "FOREIGN KEY" => "FK",
                "CHECK" => "CK",
                "EXCLUDE" => "EX",
                _ => &constraint_type,
            };

            if color {
                let colored_marker = match marker {
                    "FK" => marker.yellow().bold().to_string(),
                    "CK" => marker.cyan().bold().to_string(),
                    "EX" => marker.red().bold().to_string(),
                    _ => marker.dimmed().to_string(),
                };
                println!(
                    "    {} [{}] {} {}",
                    "→".dimmed(),
                    colored_marker,
                    name,
                    definition.dimmed()
                );
            } else {
                println!("    - [{}] {} {}", marker, name, definition);
            }
        }
    }

    Ok(())
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

fn print_header(text: &str, color: bool) {
    if color {
        println!("\n{}", text.bold());
    } else {
        println!("\n{}", text);
    }
}

fn print_section_label(text: &str, color: bool) {
    if color {
        println!("  {}", text.dimmed());
    } else {
        println!("  {}", text);
    }
}

fn extract_index_columns(definition: &str) -> String {
    if let Some(start) = definition.rfind('(') {
        if let Some(end) = definition.rfind(')') {
            return definition[start + 1..end].to_owned();
        }
    }

    "?".to_owned()
}

#[derive(Debug, FromQueryResult)]
struct EnumInfo {
    name: String,
    values: Vec<String>,
}

#[derive(Debug, FromQueryResult)]
struct TableInfo {
    name: String,
}

#[derive(Debug, FromQueryResult)]
struct ColumnInfo {
    name: String,
    data_type: String,
    nullable: String,
    default_value: Option<String>,
}

#[derive(Debug, FromQueryResult)]
struct IndexInfo {
    name: String,
    definition: String,
}

#[derive(Debug, FromQueryResult)]
struct ConstraintInfo {
    name: String,
    constraint_type: String,
    definition: String,
}
