use axum::{
    extract::{FromRequestParts, Path},
    http::{request::Parts, StatusCode},
};
use entity::polls;
use sea_orm::prelude::Uuid;

use crate::{
    auth::{AuthenticatedUser, AuthenticatedUserOptional},
    channels,
    common::ApiError,
    invites::InviteAccessToken,
    polls::{service as polls_service, types::PollPath, PollsState},
    votes::{
        service,
        types::{PollOptionPath, VotePath},
    },
};

pub(crate) struct VoteRouteContext {
    pub(crate) server_id: Uuid,
    pub(crate) channel_id: Uuid,
    pub(crate) poll_id: Uuid,
    pub(crate) user_id: Uuid,
    pub(crate) poll: polls::Model,
}

pub(crate) struct VoteMutationContext {
    pub(crate) route: VoteRouteContext,
    pub(crate) vote_id: Uuid,
}

pub(crate) struct ReadablePollOptionContext {
    pub(crate) poll_id: Uuid,
    pub(crate) poll_option_id: Uuid,
}

impl FromRequestParts<PollsState> for VoteRouteContext {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &PollsState,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = Path::<PollPath>::from_request_parts(parts, state)
            .await
            .map_err(|_| invalid_route_path())?;

        load_authenticated_vote_route_context(
            parts,
            state,
            path.server_id,
            path.channel_id,
            path.poll_id,
        )
        .await
    }
}

impl FromRequestParts<PollsState> for VoteMutationContext {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &PollsState,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) = Path::<VotePath>::from_request_parts(parts, state)
            .await
            .map_err(|_| invalid_route_path())?;

        let route = load_authenticated_vote_route_context(
            parts,
            state,
            path.server_id,
            path.channel_id,
            path.poll_id,
        )
        .await?;

        Ok(Self {
            route,
            vote_id: path.vote_id,
        })
    }
}

impl FromRequestParts<PollsState> for ReadablePollOptionContext {
    type Rejection = ApiError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &PollsState,
    ) -> Result<Self, Self::Rejection> {
        let Path(path) =
            Path::<PollOptionPath>::from_request_parts(parts, state)
                .await
                .map_err(|_| {
                    ApiError::new(
                        StatusCode::BAD_REQUEST,
                        "Invalid route path.",
                    )
                })?;

        let InviteAccessToken(invite_token) =
            InviteAccessToken::from_request_parts(parts, state).await?;

        let AuthenticatedUserOptional(current_user_id) =
            AuthenticatedUserOptional::from_request_parts(parts, state).await?;

        // Authorize before resolving the option, so a refused caller cannot
        // tell an option that exists from one that does not
        service::can_read_poll_option(
            &state.database,
            path.server_id,
            path.channel_id,
            path.poll_id,
            current_user_id,
            invite_token.as_deref(),
        )
        .await?;
        polls_service::load_poll(
            &state.database,
            path.server_id,
            path.channel_id,
            path.poll_id,
        )
        .await?;
        service::ensure_poll_option_exists(
            &state.database,
            path.poll_id,
            path.poll_option_id,
        )
        .await?;

        Ok(Self {
            poll_id: path.poll_id,
            poll_option_id: path.poll_option_id,
        })
    }
}

async fn load_authenticated_vote_route_context(
    parts: &mut Parts,
    state: &PollsState,
    server_id: Uuid,
    channel_id: Uuid,
    poll_id: Uuid,
) -> Result<VoteRouteContext, ApiError> {
    let AuthenticatedUser(user_id) =
        AuthenticatedUser::from_request_parts(parts, state).await?;

    load_vote_route_context(state, server_id, channel_id, poll_id, user_id)
        .await
}

async fn load_vote_route_context(
    state: &PollsState,
    server_id: Uuid,
    channel_id: Uuid,
    poll_id: Uuid,
    user_id: Uuid,
) -> Result<VoteRouteContext, ApiError> {
    let poll = polls_service::load_poll(
        &state.database,
        server_id,
        channel_id,
        poll_id,
    )
    .await?;

    if poll.stage != "voting" {
        return Err(ApiError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "Poll is no longer accepting votes.",
        ));
    }
    channels::ensure_channel_member(&state.database, channel_id, user_id)
        .await?;
    service::can_vote_anonymously_on_poll(&state.database, user_id, &poll)
        .await?;

    Ok(VoteRouteContext {
        server_id,
        channel_id,
        poll_id,
        user_id,
        poll,
    })
}

fn invalid_route_path() -> ApiError {
    ApiError::new(StatusCode::BAD_REQUEST, "Invalid route path.")
}
