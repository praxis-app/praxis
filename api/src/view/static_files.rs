use axum::{
    body::Body,
    http::{header, StatusCode, Uri},
    response::{IntoResponse, Response},
    Router,
};
use std::{
    env,
    path::{Component, Path, PathBuf},
};

const REVALIDATE_CACHE_CONTROL: &str = "no-cache";
const IMMUTABLE_CACHE_CONTROL: &str = "public, max-age=31536000, immutable";

pub(crate) fn attach(app: Router) -> Router {
    // Vite dev server will handle the frontend in dev
    if cfg!(debug_assertions) {
        return app;
    }

    let frontend_dist = frontend_dist_dir();
    let index_path = frontend_dist.join("index.html");

    if frontend_dist.is_dir() && index_path.is_file() {
        tracing::info!(
            "Serving frontend assets from {}",
            frontend_dist.display()
        );

        app.fallback({
            let frontend_dist = frontend_dist.clone();
            move |uri| frontend_fallback(uri, frontend_dist.clone())
        })
    } else {
        tracing::warn!(
            "Frontend assets were not found at {}; serving API routes only.",
            frontend_dist.display()
        );

        app
    }
}

fn frontend_dist_dir() -> PathBuf {
    env::var_os("FRONTEND_DIST_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("view/dist"))
}

async fn frontend_fallback(uri: Uri, frontend_dist: PathBuf) -> Response {
    let request_path = uri.path();

    if request_path == "/api" || request_path.starts_with("/api/") {
        return StatusCode::NOT_FOUND.into_response();
    }

    let Some(candidate_path) =
        frontend_request_path(&frontend_dist, request_path)
    else {
        return StatusCode::BAD_REQUEST.into_response();
    };

    if candidate_path.is_file() {
        return serve_file(candidate_path, StatusCode::OK).await;
    }

    if Path::new(request_path.trim_start_matches('/'))
        .extension()
        .is_some()
    {
        return StatusCode::NOT_FOUND.into_response();
    }

    serve_file(frontend_dist.join("index.html"), StatusCode::OK).await
}

fn frontend_request_path(
    frontend_dist: &Path,
    request_path: &str,
) -> Option<PathBuf> {
    let mut resolved = frontend_dist.to_path_buf();
    let trimmed_path = request_path.trim_start_matches('/');

    if trimmed_path.is_empty() {
        resolved.push("index.html");
        return Some(resolved);
    }

    for component in Path::new(trimmed_path).components() {
        match component {
            Component::Normal(segment) => resolved.push(segment),
            Component::CurDir => {}
            Component::RootDir
            | Component::ParentDir
            | Component::Prefix(_) => return None,
        }
    }

    Some(resolved)
}

async fn serve_file(path: PathBuf, status: StatusCode) -> Response {
    match tokio::fs::read(&path).await {
        Ok(contents) => Response::builder()
            .status(status)
            .header(header::CACHE_CONTROL, cache_control_for_path(&path))
            .header(
                header::CONTENT_TYPE,
                mime_guess::from_path(&path)
                    .first_or_octet_stream()
                    .as_ref(),
            )
            .body(Body::from(contents))
            .unwrap_or_else(|error| {
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    format!("failed to build frontend response: {error}"),
                )
                    .into_response()
            }),
        Err(error) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!(
                "failed to read frontend asset {}: {error}",
                path.display()
            ),
        )
            .into_response(),
    }
}

fn cache_control_for_path(path: &Path) -> &'static str {
    if path.components().any(|component| {
        matches!(component, Component::Normal(segment) if segment == "assets")
    }) {
        IMMUTABLE_CACHE_CONTROL
    } else {
        REVALIDATE_CACHE_CONTROL
    }
}
