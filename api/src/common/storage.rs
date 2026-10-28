use std::path::{Path, PathBuf};

pub(crate) fn upload_root() -> PathBuf {
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

pub(crate) async fn remove_stored_files(
    upload_root: &Path,
    storage_keys: &[String],
) {
    for storage_key in storage_keys {
        match tokio::fs::remove_file(upload_root.join(storage_key)).await {
            Ok(()) => {}
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
            Err(error) => {
                tracing::warn!("failed to remove stored file: {error}");
            }
        }
    }
}
