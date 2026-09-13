use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    response::Response,
};
use dashmap::DashMap;
use sea_orm::{prelude::Uuid, DatabaseConnection};
use serde::{Deserialize, Serialize};
use std::{collections::HashSet, fmt, sync::Arc};
use tokio::sync::mpsc;

use crate::{
    auth::{authenticate_token, HasJwtSecret},
    cache::CacheService,
    channels,
    common::{ApiError, AppResult},
    servers, users,
};

#[derive(Clone, Debug)]
pub(crate) struct PubSubState {
    database: DatabaseConnection,
    jwt_secret: Arc<str>,
    service: PubSubService,
}

impl PubSubState {
    pub(crate) fn new(
        database: DatabaseConnection,
        jwt_secret: String,
        service: PubSubService,
    ) -> Self {
        Self {
            service,
            database,
            jwt_secret: Arc::<str>::from(jwt_secret),
        }
    }
}

impl HasJwtSecret for PubSubState {
    fn jwt_secret(&self) -> &str {
        &self.jwt_secret
    }
}

#[derive(Clone, Debug)]
pub(crate) struct PubSubService {
    registry: Arc<PubSubRegistry>,
}

#[derive(Debug)]
struct PubSubRegistry {
    cache: CacheService,
    subscribers: DashMap<Uuid, mpsc::UnboundedSender<Message>>,
    socket_channels: DashMap<Uuid, HashSet<String>>,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
enum PubSubTopicKind {
    Message,
    Poll,
    Call,
    ForumPost,
    Notification,
}

impl PubSubTopicKind {
    fn as_str(self) -> &'static str {
        match self {
            Self::Message => "new-message",
            Self::Poll => "new-poll",
            Self::Call => "new-call",
            Self::ForumPost => "new-forum-post",
            Self::Notification => "notification",
        }
    }

    fn parse(value: &str) -> Option<Self> {
        match value {
            "new-message" => Some(Self::Message),
            "new-poll" => Some(Self::Poll),
            "new-call" => Some(Self::Call),
            "new-forum-post" => Some(Self::ForumPost),
            "notification" => Some(Self::Notification),
            _ => None,
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub(crate) struct PubSubTopic {
    kind: PubSubTopicKind,
    server_id: Uuid,
    channel_id: Option<Uuid>,
    call_id: Option<Uuid>,
    user_id: Uuid,
}

impl PubSubTopic {
    const DELIMITER: char = ':';

    pub(crate) fn new_message(
        server_id: Uuid,
        channel_id: Uuid,
        user_id: Uuid,
    ) -> Self {
        Self {
            kind: PubSubTopicKind::Message,
            server_id,
            channel_id: Some(channel_id),
            call_id: None,
            user_id,
        }
    }

    pub(crate) fn call_message(
        server_id: Uuid,
        channel_id: Uuid,
        call_id: Uuid,
        user_id: Uuid,
    ) -> Self {
        Self {
            kind: PubSubTopicKind::Message,
            server_id,
            channel_id: Some(channel_id),
            call_id: Some(call_id),
            user_id,
        }
    }

    pub(crate) fn new_poll(
        server_id: Uuid,
        channel_id: Uuid,
        user_id: Uuid,
    ) -> Self {
        Self {
            kind: PubSubTopicKind::Poll,
            server_id,
            channel_id: Some(channel_id),
            call_id: None,
            user_id,
        }
    }

    pub(crate) fn new_call(
        server_id: Uuid,
        channel_id: Uuid,
        user_id: Uuid,
    ) -> Self {
        Self {
            kind: PubSubTopicKind::Call,
            server_id,
            channel_id: Some(channel_id),
            call_id: None,
            user_id,
        }
    }

    pub(crate) fn new_forum_post(
        server_id: Uuid,
        channel_id: Uuid,
        user_id: Uuid,
    ) -> Self {
        Self {
            kind: PubSubTopicKind::ForumPost,
            server_id,
            channel_id: Some(channel_id),
            call_id: None,
            user_id,
        }
    }

    pub(crate) fn notification(server_id: Uuid, user_id: Uuid) -> Self {
        Self {
            kind: PubSubTopicKind::Notification,
            server_id,
            channel_id: None,
            call_id: None,
            user_id,
        }
    }

    fn parse(value: &str) -> Option<Self> {
        let parts = value.split(Self::DELIMITER).collect::<Vec<_>>();
        match parts.as_slice() {
            [kind, server_id, user_id] => Some(Self {
                kind: PubSubTopicKind::parse(kind)?,
                server_id: server_id.parse().ok()?,
                channel_id: None,
                call_id: None,
                user_id: user_id.parse().ok()?,
            }),
            [kind, server_id, channel_id, user_id] => Some(Self {
                kind: PubSubTopicKind::parse(kind)?,
                server_id: server_id.parse().ok()?,
                channel_id: Some(channel_id.parse().ok()?),
                call_id: None,
                user_id: user_id.parse().ok()?,
            }),
            [kind, server_id, channel_id, call_id, user_id] => Some(Self {
                kind: PubSubTopicKind::parse(kind)?,
                server_id: server_id.parse().ok()?,
                channel_id: Some(channel_id.parse().ok()?),
                call_id: Some(call_id.parse().ok()?),
                user_id: user_id.parse().ok()?,
            }),
            _ => None,
        }
    }
}

impl fmt::Display for PubSubTopic {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        let delimiter = Self::DELIMITER;
        match (self.channel_id, self.call_id) {
            (Some(channel_id), Some(call_id)) => write!(
                formatter,
                "{}{delimiter}{}{delimiter}{}{delimiter}{}{delimiter}{}",
                self.kind.as_str(),
                self.server_id,
                channel_id,
                call_id,
                self.user_id
            ),
            (Some(channel_id), None) => write!(
                formatter,
                "{}{delimiter}{}{delimiter}{}{delimiter}{}",
                self.kind.as_str(),
                self.server_id,
                channel_id,
                self.user_id
            ),
            _ => write!(
                formatter,
                "{}{delimiter}{}{delimiter}{}",
                self.kind.as_str(),
                self.server_id,
                self.user_id
            ),
        }
    }
}

impl PubSubService {
    pub(crate) fn new(cache: CacheService) -> Self {
        Self {
            registry: Arc::new(PubSubRegistry {
                cache,
                subscribers: DashMap::new(),
                socket_channels: DashMap::new(),
            }),
        }
    }

    fn register(
        &self,
        socket_id: Uuid,
        sender: mpsc::UnboundedSender<Message>,
    ) {
        self.registry.subscribers.insert(socket_id, sender);

        self.registry
            .socket_channels
            .insert(socket_id, HashSet::new());
    }

    async fn subscribe(&self, socket_id: Uuid, channel: &str) -> AppResult<()> {
        self.registry
            .cache
            .add_member(channel_cache_key(channel), socket_id.to_string())
            .await?;

        self.registry
            .socket_channels
            .entry(socket_id)
            .or_default()
            .insert(channel.to_owned());

        Ok(())
    }

    async fn unsubscribe(
        &self,
        socket_id: Uuid,
        channel: &str,
    ) -> AppResult<()> {
        self.registry
            .cache
            .remove_member(channel_cache_key(channel), &socket_id.to_string())
            .await?;

        if let Some(mut channels) =
            self.registry.socket_channels.get_mut(&socket_id)
        {
            channels.remove(channel);
        }

        Ok(())
    }

    async fn disconnect(&self, socket_id: Uuid) {
        self.registry.subscribers.remove(&socket_id);

        let Some((_socket_id, channels)) =
            self.registry.socket_channels.remove(&socket_id)
        else {
            return;
        };

        for channel in channels {
            if let Err(error) = self
                .registry
                .cache
                .remove_member(
                    channel_cache_key(&channel),
                    &socket_id.to_string(),
                )
                .await
            {
                tracing::warn!(
                    "failed to clean up websocket subscription: {error}"
                );
            }
        }
    }

    pub(crate) async fn publish(
        &self,
        channel: &str,
        body: serde_json::Value,
    ) -> AppResult<()> {
        self.publish_message(channel, Some(body), None).await
    }

    async fn publish_from_socket(
        &self,
        channel: &str,
        body: Option<serde_json::Value>,
        socket_id: Uuid,
    ) -> AppResult<()> {
        self.publish_message(channel, body, Some(socket_id)).await
    }

    async fn publish_message(
        &self,
        channel: &str,
        body: Option<serde_json::Value>,
        publisher_id: Option<Uuid>,
    ) -> AppResult<()> {
        let message = response_message(channel, body, None)?;
        let subscriber_ids = self
            .registry
            .cache
            .members(channel_cache_key(channel))
            .await?;

        for subscriber_id in subscriber_ids {
            let Ok(subscriber_id) = subscriber_id.parse::<Uuid>() else {
                continue;
            };
            if Some(subscriber_id) == publisher_id {
                continue;
            }
            let Some(sender) = self.registry.subscribers.get(&subscriber_id)
            else {
                continue;
            };
            let _ = sender.send(message.clone());
        }

        Ok(())
    }
}

pub(crate) async fn websocket_handler(
    State(state): State<PubSubState>,
    ws: WebSocketUpgrade,
) -> Response {
    ws.on_upgrade(move |socket| handle_socket(state, socket))
}

async fn handle_socket(state: PubSubState, mut socket: WebSocket) {
    let socket_id = Uuid::new_v4();
    let (sender, mut outbound) = mpsc::unbounded_channel();
    state.service.register(socket_id, sender);

    // Runs for the life of the connection. Exits when the client closes or
    // errors (`socket.recv()` stops yielding `Ok`), a send fails, or a message
    // asks to disconnect. Both branches await, so an idle socket just waits
    loop {
        tokio::select! {
            Some(message) = outbound.recv() => {
                if socket.send(message).await.is_err() {
                    break;
                }
            }
            inbound = socket.recv() => {
                let Some(Ok(message)) = inbound else {
                    break;
                };

                if handle_inbound_message(&state, socket_id, message).await {
                    break;
                }
            }
        }
    }

    state.service.disconnect(socket_id).await;
}

// Validate and authorize each socket request before dispatching it
async fn handle_inbound_message(
    state: &PubSubState,
    socket_id: Uuid,
    message: Message,
) -> bool {
    // Decode text frames into pub-sub requests
    let Message::Text(text) = message else {
        return false;
    };
    let Ok(request) = serde_json::from_str::<PubSubRequest>(&text) else {
        send_socket_error(
            &state.service,
            socket_id,
            "",
            "BAD_REQUEST",
            "Invalid pub-sub request.",
        );
        return false;
    };

    // Authenticate the token on every request
    let user_id = match authenticate_token(&request.token, state.jwt_secret()) {
        Ok(user_id) => user_id,
        Err(_) => {
            send_socket_error(
                &state.service,
                socket_id,
                &request.channel,
                "UNAUTHORIZED",
                "Invalid token.",
            );
            return false;
        }
    };

    // Require a valid topic scoped to this user
    let access = channel_access(&request.channel, user_id);
    let Some(access) = access else {
        send_socket_error(
            &state.service,
            socket_id,
            &request.channel,
            "FORBIDDEN",
            "Forbidden.",
        );
        return false;
    };

    if !is_authorized(state, &access, user_id).await {
        send_socket_error(
            &state.service,
            socket_id,
            &request.channel,
            "FORBIDDEN",
            "Forbidden.",
        );
        return false;
    }

    // Apply the authorized subscription or publish operation
    match request.request {
        PubSubRequestKind::Subscribe => {
            if let Err(error) =
                state.service.subscribe(socket_id, &request.channel).await
            {
                tracing::warn!("failed to subscribe websocket: {error}");
                send_socket_error(
                    &state.service,
                    socket_id,
                    &request.channel,
                    "INTERNAL_SERVER_ERROR",
                    "Internal server error.",
                );
            } else if let Some(sender) =
                state.service.registry.subscribers.get(&socket_id)
            {
                // Confirm readiness so clients can fetch replies missed before subscribing
                let response = PubSubResponse {
                    kind: "RESPONSE",
                    channel: &request.channel,
                    request: Some("SUBSCRIBE"),
                    error: None,
                    body: None,
                };
                if let Ok(message) = serde_json::to_string(&response) {
                    let _ = sender.send(Message::Text(message.into()));
                }
            }
        }
        PubSubRequestKind::Unsubscribe => {
            if let Err(error) =
                state.service.unsubscribe(socket_id, &request.channel).await
            {
                tracing::warn!("failed to unsubscribe websocket: {error}");
            }
        }
        PubSubRequestKind::Publish => {
            if let Err(error) = state
                .service
                .publish_from_socket(&request.channel, request.body, socket_id)
                .await
            {
                tracing::warn!("failed to publish websocket message: {error}");
            }
        }
    }

    false
}

fn send_socket_error(
    service: &PubSubService,
    socket_id: Uuid,
    channel: &str,
    code: &'static str,
    message: &'static str,
) {
    let Some(sender) = service.registry.subscribers.get(&socket_id) else {
        return;
    };
    let Ok(message) =
        response_message(channel, None, Some(PubSubError { code, message }))
    else {
        return;
    };
    let _ = sender.send(message);
}

fn response_message(
    channel: &str,
    body: Option<serde_json::Value>,
    error: Option<PubSubError>,
) -> AppResult<Message> {
    serde_json::to_string(&PubSubResponse {
        kind: "RESPONSE",
        channel,
        request: None,
        error,
        body,
    })
    .map(|value| Message::Text(value.into()))
    .map_err(internal_error)
}

#[derive(Clone, Debug, PartialEq, Eq)]
struct ChannelAccess {
    server_id: Uuid,
    // Notification topics name a user, not a channel; only the latter is checked
    channel_id: Option<Uuid>,
    registered_only: bool,
}

fn channel_access(channel: &str, user_id: Uuid) -> Option<ChannelAccess> {
    let topic = PubSubTopic::parse(channel)?;

    (topic.user_id == user_id).then_some(ChannelAccess {
        server_id: topic.server_id,
        channel_id: topic.channel_id,
        registered_only: topic.kind == PubSubTopicKind::Notification,
    })
}

async fn is_authorized(
    state: &PubSubState,
    access: &ChannelAccess,
    user_id: Uuid,
) -> bool {
    if access.registered_only
        && users::is_anonymous_user(&state.database, user_id)
            .await
            .unwrap_or(true)
    {
        return false;
    }

    let Some(channel_id) = access.channel_id else {
        return servers::is_server_member(
            &state.database,
            access.server_id,
            user_id,
        )
        .await
        .unwrap_or(false);
    };

    channels::get_channel(&state.database, access.server_id, channel_id)
        .await
        .is_ok()
        && channels::ensure_channel_member(&state.database, channel_id, user_id)
            .await
            .is_ok()
}

fn channel_cache_key(channel: &str) -> String {
    format!("channel:{channel}")
}

#[derive(Debug, Deserialize)]
struct PubSubRequest {
    request: PubSubRequestKind,
    channel: String,
    token: String,
    body: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
enum PubSubRequestKind {
    Publish,
    Subscribe,
    Unsubscribe,
}

#[derive(Debug, Serialize)]
struct PubSubResponse<'a> {
    #[serde(rename = "type")]
    kind: &'static str,
    channel: &'a str,
    #[serde(skip_serializing_if = "Option::is_none")]
    request: Option<&'static str>,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<PubSubError>,
    #[serde(skip_serializing_if = "Option::is_none")]
    body: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
struct PubSubError {
    code: &'static str,
    message: &'static str,
}

fn internal_error(error: impl std::fmt::Display) -> ApiError {
    tracing::error!("pub-sub request failed: {error}");
    ApiError::new(
        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        "Internal server error.",
    )
}
