use axum::{
    extract::MatchedPath,
    http::{Request, Response},
};
use std::{error::Error, fs, path::Path, time::Duration};
use tower_http::trace::DefaultOnRequest;
use tracing::{Level, Span};
use tracing_appender::{non_blocking, non_blocking::WorkerGuard, rolling};
use tracing_subscriber::{
    fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter,
};

pub(crate) fn init() -> Result<WorkerGuard, Box<dyn Error + Send + Sync>> {
    let logs_dir = Path::new("logs");
    fs::create_dir_all(logs_dir)?;

    let env_filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| {
        EnvFilter::new("api=info,praxis_live=info,tower_http=info")
    });

    let file_appender = rolling::daily(logs_dir, "praxis-live.log");
    let (file_writer, guard) = non_blocking(file_appender);

    let file_layer = fmt::layer()
        .with_ansi(false)
        .with_target(false)
        .with_writer(file_writer);

    let stdout_layer = fmt::layer()
        .pretty()
        .with_target(false)
        .with_file(false)
        .with_line_number(false);

    tracing_subscriber::registry()
        .with(env_filter)
        .with(stdout_layer)
        .with(file_layer)
        .init();

    Ok(guard)
}

pub(crate) fn log_request_start() -> DefaultOnRequest {
    DefaultOnRequest::new().level(Level::DEBUG)
}

pub(crate) fn make_request_span<B>(request: &Request<B>) -> Span {
    let route = request
        .extensions()
        .get::<MatchedPath>()
        .map(MatchedPath::as_str)
        .unwrap_or_else(|| request.uri().path());

    tracing::info_span!(
        "request",
        method = %request.method(),
        route,
    )
}

pub(crate) fn log_response<B>(
    response: &Response<B>,
    latency: Duration,
    _: &Span,
) {
    let status = response.status();
    let latency_ms = latency.as_millis();

    if status.is_server_error() {
        tracing::error!(
            %status,
            latency_ms,

        );
    } else if status.is_client_error() {
        tracing::warn!(
            %status,
            latency_ms,

        );
    } else {
        tracing::info!(
            %status,
            latency_ms,
        );
    }
}
