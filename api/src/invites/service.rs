use axum::http::StatusCode;
use chrono::Utc;
use entity::{invites, users};
use sea_orm::{
    prelude::Uuid, sea_query::Expr, ActiveModelTrait, ColumnTrait, Condition,
    ConnectionTrait, DatabaseConnection, EntityTrait, QueryFilter, QueryOrder,
    Set,
};
use uuid::Uuid as NativeUuid;

use super::types::{InviteRequest, InviteResponse, InviteUserResponse};
use crate::{
    common::{ApiError, AppResult},
    servers, users as users_service,
};

const INVITES_PAGE_SIZE: usize = 20;

pub(super) async fn is_valid_invite(
    database: &DatabaseConnection,
    token: &str,
) -> AppResult<bool> {
    let invite = invites::Entity::find()
        .filter(invites::Column::Token.eq(token))
        .one(database)
        .await
        .map_err(internal_error)?;

    Ok(invite.as_ref().is_some_and(validate_invite))
}

pub(crate) async fn is_valid_invite_for_server(
    database: &DatabaseConnection,
    token: &str,
    server_id: Uuid,
) -> AppResult<bool> {
    let invite = invites::Entity::find()
        .filter(invites::Column::Token.eq(token))
        .filter(invites::Column::ServerId.eq(server_id))
        .one(database)
        .await
        .map_err(internal_error)?;

    Ok(invite.as_ref().is_some_and(validate_invite))
}

pub(crate) async fn valid_invite_server_id(
    database: &DatabaseConnection,
    token: &str,
) -> AppResult<Option<Uuid>> {
    let invite = invites::Entity::find()
        .filter(invites::Column::Token.eq(token))
        .one(database)
        .await
        .map_err(internal_error)?;

    Ok(invite
        .filter(validate_invite)
        .map(|invite| invite.server_id))
}

pub(crate) async fn get_invite_by_token(
    database: &DatabaseConnection,
    token: &str,
) -> AppResult<invites::Model> {
    let invite = invites::Entity::find()
        .filter(invites::Column::Token.eq(token))
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::BAD_REQUEST, "Invalid invite token.")
        })?;

    if validate_invite(&invite) {
        Ok(invite)
    } else {
        Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Invalid invite token.",
        ))
    }
}

pub(super) async fn get_valid_invites(
    database: &DatabaseConnection,
    server_id: Uuid,
) -> AppResult<Vec<InviteResponse>> {
    servers::ensure_server(database, server_id).await?;

    let invites = invites::Entity::find()
        .filter(invites::Column::ServerId.eq(server_id))
        .order_by_desc(invites::Column::CreatedAt)
        .all(database)
        .await
        .map_err(internal_error)?;

    let mut responses = Vec::new();
    for invite in invites {
        if !validate_invite(&invite) {
            continue;
        }
        responses.push(shape_invite(database, invite).await?);
        if responses.len() == INVITES_PAGE_SIZE {
            break;
        }
    }

    Ok(responses)
}

pub(super) async fn create_invite(
    database: &DatabaseConnection,
    server_id: Uuid,
    user_id: Uuid,
    request: InviteRequest,
) -> AppResult<InviteResponse> {
    servers::ensure_server(database, server_id).await?;
    ensure_user(database, user_id).await?;

    let token = generate_token();
    let invite = invites::ActiveModel {
        id: Set(NativeUuid::new_v4()),
        token: Set(token),
        uses: Set(0),
        max_uses: Set(request.max_uses.filter(|max_uses| *max_uses > 0)),
        user_id: Set(user_id),
        server_id: Set(server_id),
        expires_at: Set(request.expires_at),
        ..Default::default()
    }
    .insert(database)
    .await
    .map_err(internal_error)?;

    shape_invite(database, invite).await
}

pub(crate) async fn redeem_invite<C>(database: &C, token: &str) -> AppResult<()>
where
    C: ConnectionTrait,
{
    let is_unexpired = Condition::any()
        .add(invites::Column::ExpiresAt.is_null())
        .add(invites::Column::ExpiresAt.gt(Utc::now().fixed_offset()));
    let has_uses_left = Condition::any()
        .add(invites::Column::MaxUses.is_null())
        .add(
            Expr::col(invites::Column::Uses)
                .lt(Expr::col(invites::Column::MaxUses)),
        );

    let result = invites::Entity::update_many()
        .col_expr(
            invites::Column::Uses,
            Expr::col(invites::Column::Uses).add(1),
        )
        .filter(invites::Column::Token.eq(token))
        .filter(is_unexpired)
        .filter(has_uses_left)
        .exec(database)
        .await
        .map_err(internal_error)?;

    if result.rows_affected == 0 {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Invalid invite token.",
        ));
    }

    Ok(())
}

pub(super) async fn delete_invite(
    database: &DatabaseConnection,
    server_id: Uuid,
    invite_id: Uuid,
) -> AppResult<()> {
    invites::Entity::delete_many()
        .filter(invites::Column::Id.eq(invite_id))
        .filter(invites::Column::ServerId.eq(server_id))
        .exec(database)
        .await
        .map_err(internal_error)?;
    Ok(())
}

fn validate_invite(invite: &invites::Model) -> bool {
    let is_expired = invite
        .expires_at
        .is_some_and(|expires_at| Utc::now().fixed_offset() >= expires_at);
    let max_uses_reached = invite
        .max_uses
        .is_some_and(|max_uses| invite.uses >= max_uses);

    !is_expired && !max_uses_reached
}

async fn shape_invite(
    database: &DatabaseConnection,
    invite: invites::Model,
) -> AppResult<InviteResponse> {
    let user = users::Entity::find_by_id(invite.user_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .ok_or_else(|| {
            ApiError::new(StatusCode::NOT_FOUND, "User not found.")
        })?;

    let profile_picture =
        users_service::get_user_profile_picture(database, user.id).await?;

    Ok(InviteResponse {
        id: invite.id.to_string(),
        token: invite.token,
        uses: invite.uses,
        max_uses: invite.max_uses,
        user: InviteUserResponse {
            id: user.id.to_string(),
            name: user.name,
            display_name: user.display_name,
            profile_picture,
        },
        expires_at: invite.expires_at.map(|value| value.to_rfc3339()),
        created_at: invite.created_at.to_rfc3339(),
    })
}

async fn ensure_user(
    database: &DatabaseConnection,
    user_id: Uuid,
) -> AppResult<()> {
    users::Entity::find_by_id(user_id)
        .one(database)
        .await
        .map_err(internal_error)?
        .map(|_| ())
        .ok_or_else(|| ApiError::new(StatusCode::NOT_FOUND, "User not found."))
}

fn generate_token() -> String {
    NativeUuid::new_v4().simple().to_string()[..8].to_owned()
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("invites request failed: {error}");
    ApiError::new(StatusCode::INTERNAL_SERVER_ERROR, "Internal server error.")
}
