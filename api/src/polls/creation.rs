//! Owns validation, preparation, persistence, and file rollback for atomic poll
//! creation. Request orchestration and post-creation responses remain in `service.rs`

use axum::http::StatusCode;
use chrono::{Duration, Utc};
use entity::{
    enums::{PollActionType, PollType, ServerDecisionMakingModel},
    poll_configs, poll_images, poll_options, polls,
    server_configs as server_config_entities,
};
use sea_orm::{
    prelude::Uuid, ActiveModelTrait, ConnectionTrait, DatabaseConnection, Set,
};
use std::path::{Path, PathBuf};
use uuid::Uuid as NativeUuid;

use super::types::CreatePollRequest;
use crate::{
    channels,
    common::{
        encryption, request::MAX_ATTACHMENT_FILES, text::sanitize_text,
        ApiError, AppResult,
    },
    poll_actions,
    servers::server_configs,
    users,
};

const MAX_POLL_BODY_LENGTH: usize = 8_000;
pub(crate) struct PreparedPollCreation {
    request: CreatePollRequest,
    server_id: Uuid,
    channel_id: Uuid,
    poll_type: PollType,
    server_config: server_config_entities::Model,
    encrypted: Option<(Uuid, encryption::EncryptedBytes)>,
    closing_at: Option<chrono::DateTime<chrono::FixedOffset>>,
}

pub(crate) async fn prepare_forum_proposal(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    user_id: Uuid,
    request: CreatePollRequest,
) -> AppResult<PreparedPollCreation> {
    if request.poll_type != PollType::Proposal {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "A forum post can only include a proposal.",
        ));
    }
    prepare_poll_creation(
        database, server_id, channel_id, user_id, request, true,
    )
    .await
}

pub(super) async fn prepare_poll_creation(
    database: &DatabaseConnection,
    server_id: Uuid,
    channel_id: Uuid,
    user_id: Uuid,
    request: CreatePollRequest,
    allow_forum_proposal: bool,
) -> AppResult<PreparedPollCreation> {
    validate_create_poll(&request)?;

    let body = request
        .body
        .as_deref()
        .map(sanitize_text)
        .filter(|value| !value.is_empty());
    let poll_type = request.poll_type;
    let is_proposal = poll_type == PollType::Proposal;
    let channel =
        channels::get_channel(database, server_id, channel_id).await?;
    if is_proposal
        && channel.channel_type == entity::enums::ChannelType::Forum
        && !allow_forum_proposal
    {
        return Err(ApiError::new(
            StatusCode::CONFLICT,
            "Forum proposals must be created as part of a forum post.",
        ));
    }
    can_create_proposal(database, user_id, &request).await?;
    let server_config =
        server_configs::service::ensure_server_config(database, server_id)
            .await?;
    if let Some(config_change) = request
        .action
        .as_ref()
        .filter(|action| action.action_type == PollActionType::ChangeSettings)
        .and_then(|action| action.server_config.as_ref())
    {
        poll_actions::service::validate_server_config_change(
            config_change,
            &server_config,
        )?;
    }
    let closing_at = resolve_poll_closing_at(
        is_proposal,
        server_config.voting_time_limit,
        request.closing_at,
        Utc::now().fixed_offset(),
    );
    if is_proposal
        && server_config.decision_making_model
            == ServerDecisionMakingModel::Consent
        && closing_at.is_none()
    {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Consent proposals require a voting time limit.",
        ));
    }

    let encrypted = match body.as_deref() {
        Some(body) => {
            let (key, unwrapped_key) =
                channels::get_unwrapped_channel_key(database, channel_id)
                    .await?;
            Some((key.id, encryption::encrypt_text(body, &unwrapped_key)?))
        }
        None => None,
    };

    Ok(PreparedPollCreation {
        request,
        server_id,
        channel_id,
        poll_type,
        server_config,
        encrypted,
        closing_at,
    })
}

pub(crate) async fn insert_prepared_poll<C: ConnectionTrait>(
    database: &C,
    call_id: Option<Uuid>,
    user_id: Uuid,
    prepared: PreparedPollCreation,
) -> AppResult<polls::Model> {
    let PreparedPollCreation {
        request,
        server_id,
        channel_id,
        poll_type,
        server_config,
        encrypted,
        closing_at,
    } = prepared;
    let is_proposal = poll_type == PollType::Proposal;
    let poll = polls::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        key_id: Set(encrypted.as_ref().map(|(key_id, _)| *key_id)),
        ciphertext: Set(encrypted
            .as_ref()
            .map(|(_, value)| value.ciphertext.clone())),
        iv: Set(encrypted.as_ref().map(|(_, value)| value.iv.clone())),
        tag: Set(encrypted.as_ref().map(|(_, value)| value.tag.clone())),
        poll_type: Set(poll_type),
        user_id: Set(user_id),
        channel_id: Set(channel_id),
        call_id: Set(call_id),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)?;

    poll_configs::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        poll_id: Set(poll.id),
        decision_making_model: Set(is_proposal
            .then_some(server_config.decision_making_model.into())),
        disagreements_limit: Set(is_proposal
            .then_some(server_config.disagreements_limit)),
        abstains_limit: Set(is_proposal.then_some(server_config.abstains_limit)),
        agreement_threshold: Set(is_proposal
            .then_some(server_config.agreement_threshold)),
        quorum_enabled: Set(is_proposal.then_some(server_config.quorum_enabled)),
        quorum_threshold: Set(is_proposal.then_some(server_config.quorum_threshold)),
        blocks_open_to_all: Set(is_proposal
            .then_some(server_config.blocks_open_to_all)),
        multiple_choice: Set((!is_proposal)
            .then_some(request.multiple_choice.unwrap_or(false))),
        closing_at: Set(closing_at),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)?;

    if is_proposal {
        if let Some(action) = request.action {
            poll_actions::service::create_poll_action(
                database,
                poll.id,
                server_id,
                action,
                &server_config,
            )
            .await?;
        }
    } else if let Some(options) = request.options {
        for option in options {
            poll_options::ActiveModel {
                id: Set(NativeUuid::new_v4()),
                poll_id: Set(poll.id),
                text: Set(sanitize_text(&option)),
                ..Default::default()
            }
            .insert(database)
            .await
            .map_err(internal_error)?;
        }
    }

    Ok(poll)
}

/// Files uploaded alongside a new poll or proposal
pub(crate) struct PollImageUploads {
    pub(crate) images: Vec<Vec<u8>>,
    pub(crate) cover_photo: Option<Vec<u8>>,
}

pub(crate) async fn attach_poll_creation_images<C: ConnectionTrait>(
    database: &C,
    upload_root: &Path,
    poll_id: Uuid,
    uploads: PollImageUploads,
) -> AppResult<Vec<PathBuf>> {
    let PollImageUploads {
        images,
        cover_photo,
    } = uploads;
    if images.len() > MAX_ATTACHMENT_FILES {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            format!("A poll can include up to {MAX_ATTACHMENT_FILES} images."),
        ));
    }
    let mut normalized = Vec::with_capacity(images.len());
    for bytes in images {
        normalized.push(
            crate::common::images::normalize_upload(bytes, "Poll image")
                .await?,
        );
    }

    let mut paths = vec![];
    for bytes in normalized {
        match attach_poll_image(database, upload_root, poll_id, bytes).await {
            Ok(path) => paths.push(path),
            Err(error) => {
                cleanup_image_paths(paths).await;
                return Err(error);
            }
        }
    }

    if let Some(bytes) = cover_photo {
        match poll_actions::service::attach_event_cover_photo(
            database,
            upload_root,
            poll_id,
            bytes,
        )
        .await
        {
            Ok(path) => paths.push(path),
            Err(error) => {
                cleanup_image_paths(paths).await;
                return Err(error);
            }
        }
    }

    Ok(paths)
}

async fn attach_poll_image<C: ConnectionTrait>(
    database: &C,
    upload_root: &Path,
    poll_id: Uuid,
    bytes: Vec<u8>,
) -> AppResult<PathBuf> {
    let image_id = NativeUuid::new_v4();
    let storage_key = format!("poll-images/{image_id}");
    let destination = upload_root.join(&storage_key);
    if let Some(parent) = destination.parent() {
        tokio::fs::create_dir_all(parent)
            .await
            .map_err(internal_error)?;
    }
    if let Err(error) = tokio::fs::write(&destination, bytes).await {
        let _ = tokio::fs::remove_file(&destination).await;
        return Err(internal_error(error));
    }

    let insert_result = poll_images::ActiveModel {
        id: Set(image_id),
        poll_id: Set(poll_id),
        storage_key: Set(Some(storage_key)),
        ..Default::default()
    }
    .insert(database)
    .await;
    if let Err(error) = insert_result {
        if let Err(cleanup_error) = tokio::fs::remove_file(&destination).await {
            tracing::warn!(
                "failed to clean up poll image after database error: {cleanup_error}"
            );
        }
        return Err(internal_error(error));
    }
    Ok(destination)
}

pub(crate) async fn commit_creation(
    transaction: sea_orm::DatabaseTransaction,
    image_paths: Vec<PathBuf>,
) -> AppResult<()> {
    if let Err(error) = transaction.commit().await {
        cleanup_image_paths(image_paths).await;
        return Err(internal_error(error));
    }
    Ok(())
}

async fn cleanup_image_paths(paths: Vec<PathBuf>) {
    for path in paths {
        if let Err(error) = tokio::fs::remove_file(path).await {
            tracing::warn!("failed to clean up image: {error}");
        }
    }
}

async fn can_create_proposal(
    database: &DatabaseConnection,
    user_id: Uuid,
    request: &CreatePollRequest,
) -> AppResult<()> {
    if request.poll_type != PollType::Proposal {
        return Ok(());
    }
    if request
        .action
        .as_ref()
        .map(|action| action.action_type.as_str())
        == Some("test")
    {
        return Ok(());
    }

    if users::is_anonymous_user(database, user_id).await? {
        return Err(ApiError::new(
            StatusCode::FORBIDDEN,
            "Only registered users can create non-test proposals.",
        ));
    }

    Ok(())
}

fn resolve_poll_closing_at(
    is_proposal: bool,
    voting_time_limit: i32,
    requested_closing_at: Option<chrono::DateTime<chrono::FixedOffset>>,
    now: chrono::DateTime<chrono::FixedOffset>,
) -> Option<chrono::DateTime<chrono::FixedOffset>> {
    if !is_proposal {
        return requested_closing_at;
    }

    (voting_time_limit > 0)
        .then(|| now + Duration::minutes(i64::from(voting_time_limit)))
}

fn validate_create_poll(request: &CreatePollRequest) -> AppResult<()> {
    if request
        .body
        .as_ref()
        .map(|body| body.chars().count() > MAX_POLL_BODY_LENGTH)
        .unwrap_or(false)
    {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Polls must be 8000 characters or less.",
        ));
    }

    if request.poll_type == PollType::Poll {
        let body_missing = request
            .body
            .as_deref()
            .map(str::trim)
            .map(str::is_empty)
            .unwrap_or(true);
        if body_missing {
            return Err(ApiError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "Polls must include a question.",
            ));
        }
        let options = request.options.as_deref().unwrap_or(&[]);
        if options.len() < 2 {
            return Err(ApiError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "Polls must have at least 2 options.",
            ));
        }
        if options.len() > 10 {
            return Err(ApiError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "Polls cannot have more than 10 options.",
            ));
        }
        if options.iter().any(|option| option.chars().count() > 200) {
            return Err(ApiError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "Poll options must be 200 characters or less.",
            ));
        }
    } else {
        poll_actions::service::validate_action(
            request.action.as_ref(),
            request.body.as_deref(),
        )?;
    }

    Ok(())
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("poll creation failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}

#[cfg(test)]
mod tests {
    use chrono::{FixedOffset, TimeZone};

    use super::resolve_poll_closing_at;

    fn timestamp(minute: u32) -> chrono::DateTime<FixedOffset> {
        FixedOffset::east_opt(0)
            .expect("UTC offset should be valid")
            .with_ymd_and_hms(2026, 6, 29, 12, minute, 0)
            .single()
            .expect("timestamp should be valid")
    }

    #[test]
    fn proposal_deadline_comes_from_server_voting_duration() {
        let now = timestamp(0);
        let requested_closing_at = timestamp(5);

        let closing_at =
            resolve_poll_closing_at(true, 30, Some(requested_closing_at), now);

        assert_eq!(closing_at, Some(timestamp(30)));
    }

    #[test]
    fn unlimited_proposal_ignores_requested_deadline() {
        let closing_at =
            resolve_poll_closing_at(true, 0, Some(timestamp(5)), timestamp(0));

        assert_eq!(closing_at, None);
    }

    #[test]
    fn regular_poll_keeps_requested_deadline() {
        let requested_closing_at = timestamp(5);

        let closing_at = resolve_poll_closing_at(
            false,
            30,
            Some(requested_closing_at),
            timestamp(0),
        );

        assert_eq!(closing_at, Some(requested_closing_at));
    }
}
