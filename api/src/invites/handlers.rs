use axum::{
    extract::{Path, State},
    response::Json,
};
use sea_orm::DatabaseConnection;
use std::sync::Arc;

use super::{
    extractors::{CanCreateInviteContext, CanManageInviteContext},
    service,
    types::{
        InvitePayload, InviteRequest, InviteValidityResponse, InvitesPayload,
    },
};
use crate::{
    auth::HasJwtSecret,
    common::{response::EmptyResponse, AppResult},
};

#[derive(Clone, Debug)]
pub(super) struct InvitesState {
    pub(super) database: DatabaseConnection,
    jwt_secret: Arc<str>,
}

impl InvitesState {
    pub(super) fn new(
        database: DatabaseConnection,
        jwt_secret: String,
    ) -> Self {
        Self {
            database,
            jwt_secret: Arc::<str>::from(jwt_secret),
        }
    }
}

impl HasJwtSecret for InvitesState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

pub(super) async fn is_valid_invite(
    State(state): State<InvitesState>,
    Path(token): Path<String>,
) -> AppResult<Json<InviteValidityResponse>> {
    let is_valid_invite =
        service::is_valid_invite(&state.database, &token).await?;
    Ok(Json(InviteValidityResponse { is_valid_invite }))
}

pub(super) async fn get_invites(
    State(state): State<InvitesState>,
    context: CanCreateInviteContext,
) -> AppResult<Json<InvitesPayload>> {
    let invites =
        service::get_valid_invites(&state.database, context.server_id).await?;
    Ok(Json(InvitesPayload { invites }))
}

pub(super) async fn create_invite(
    State(state): State<InvitesState>,
    context: CanCreateInviteContext,
    Json(payload): Json<InviteRequest>,
) -> AppResult<Json<InvitePayload>> {
    let invite = service::create_invite(
        &state.database,
        context.server_id,
        context.user_id,
        payload,
    )
    .await?;
    Ok(Json(InvitePayload { invite }))
}

pub(super) async fn delete_invite(
    State(state): State<InvitesState>,
    context: CanManageInviteContext,
) -> AppResult<Json<EmptyResponse>> {
    service::delete_invite(
        &state.database,
        context.server_id,
        context.invite_id,
    )
    .await?;
    Ok(Json(EmptyResponse {}))
}
