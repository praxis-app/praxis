use std::path::{Path, PathBuf};

pub(crate) fn upload_root() -> PathBuf {
    // Default to the project's content directory when CONTENT_ROOT is unset
    std::env::var("CONTENT_ROOT")
        .map(PathBuf::from)
        .unwrap_or_else(|_| {
            PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .parent()
                .map(Path::to_path_buf)
                .unwrap_or_else(|| PathBuf::from("."))
                .join("content")
        })
}
