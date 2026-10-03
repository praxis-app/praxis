use axum::http::StatusCode;
use entity::channels;
use futures_util::{SinkExt, StreamExt};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, QueryOrder};
use serde_json::json;
use std::time::Duration;
use tokio_tungstenite::{
    connect_async, tungstenite::Message as SocketMessage, MaybeTlsStream,
    WebSocketStream,
};
use uuid::Uuid;

use crate::support::{json_body, TestApp};

type TestSocket = WebSocketStream<MaybeTlsStream<tokio::net::TcpStream>>;

struct TestUser {
    token: String,
    user_id: String,
}

fn member_uri(server_id: &str, user: &TestUser, action: &str) -> String {
    format!("/api/servers/{server_id}/members/{}/{action}", user.user_id)
}

async fn signup(app: &TestApp, email: &str, name: &str) -> TestUser {
    let response = app
        .post_json(
            "/api/auth/signup",
            &json!({
                "email": email,
                "name": name,
                "password": "correct horse battery staple",
                "inviteToken": null,
            }),
        )
        .await;
    assert_eq!(response.status(), StatusCode::CREATED);

    let body = json_body(response).await;
    TestUser {
        token: body["access_token"].as_str().unwrap().to_owned(),
        user_id: body["user"]["id"].as_str().unwrap().to_owned(),
    }
}

async fn default_server_id(app: &TestApp) -> String {
    let response = app.get("/api/servers/default").await;
    assert_eq!(response.status(), StatusCode::OK);

    json_body(response).await["server"]["id"]
        .as_str()
        .unwrap()
        .to_owned()
}

async fn general_channel_id(app: &TestApp, server_id: &str) -> String {
    channels::Entity::find()
        .filter(
            channels::Column::ServerId.eq(Uuid::parse_str(server_id).unwrap()),
        )
        .order_by_asc(channels::Column::SortOrder)
        .one(app.database())
        .await
        .unwrap()
        .expect("expected a channel in the server")
        .id
        .to_string()
}

#[tokio::test]
async fn audit_log_routes_require_permission_and_return_moderation_entries() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member").await;
    let server_id = default_server_id(&app).await;

    let denied_server = app
        .get_with_bearer(
            &format!("/api/servers/{server_id}/audit-log"),
            &member.token,
        )
        .await;
    assert_eq!(denied_server.status(), StatusCode::FORBIDDEN);
    let denied_instance =
        app.get_with_bearer("/api/audit-log", &member.token).await;
    assert_eq!(denied_instance.status(), StatusCode::FORBIDDEN);

    let ban = app
        .post_json_with_bearer(
            &member_uri(&server_id, &member, "ban"),
            &json!({ "reason": "Repeated harassment" }),
            &admin.token,
        )
        .await;
    assert_eq!(ban.status(), StatusCode::OK);

    let server_log = app
        .get_with_bearer(
            &format!("/api/servers/{server_id}/audit-log"),
            &admin.token,
        )
        .await;
    assert_eq!(server_log.status(), StatusCode::OK);
    let body = json_body(server_log).await;
    assert_eq!(body["entries"][0]["action"], "ban_member");
    assert_eq!(body["entries"][0]["origin"], "direct");
    assert_eq!(body["entries"][0]["target"]["label"], "Member");
    assert_eq!(body["entries"][0]["scope"]["serverId"], server_id);

    let instance_log =
        app.get_with_bearer("/api/audit-log", &admin.token).await;
    assert_eq!(instance_log.status(), StatusCode::OK);
    assert_eq!(
        json_body(instance_log).await["entries"][0]["action"],
        "ban_member"
    );
}

#[tokio::test]
async fn bans_notify_and_revoke_the_members_open_sockets() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member").await;
    let server_id = default_server_id(&app).await;
    let topic = format!("notification:{server_id}:{}", member.user_id);
    let mut socket = open_socket(&app).await;
    subscribe(&mut socket, &topic, &member.token).await;
    assert_eq!(next_json(&mut socket).await["request"], json!("SUBSCRIBE"));

    let ban = app
        .post_json_with_bearer(
            &member_uri(&server_id, &member, "ban"),
            &json!({ "reason": "Repeated harassment" }),
            &admin.token,
        )
        .await;
    assert_eq!(ban.status(), StatusCode::OK);
    let revoked = next_json(&mut socket).await;
    assert_eq!(revoked["channel"], json!(topic));
    assert_eq!(revoked["body"]["type"], "server-access-revoked");

    subscribe(&mut socket, &topic, &member.token).await;
    assert_eq!(next_json(&mut socket).await["error"]["code"], "FORBIDDEN");
}

#[tokio::test]
async fn suspending_an_account_closes_its_open_sockets() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member").await;
    let server_id = default_server_id(&app).await;
    let channel_id = general_channel_id(&app, &server_id).await;
    let topic =
        format!("new-message:{server_id}:{channel_id}:{}", member.user_id);
    let mut socket = open_socket(&app).await;
    subscribe(&mut socket, &topic, &member.token).await;
    assert_eq!(next_json(&mut socket).await["request"], json!("SUBSCRIBE"));

    let suspend = app
        .post_json_with_bearer(
            &format!("/api/users/{}/suspend", member.user_id),
            &json!({ "reason": "Repeated harassment" }),
            &admin.token,
        )
        .await;
    assert_eq!(suspend.status(), StatusCode::OK);
    let closed = tokio::time::timeout(Duration::from_secs(5), socket.next())
        .await
        .expect("expected the socket to close");
    assert!(matches!(
        closed,
        None | Some(Ok(SocketMessage::Close(_))) | Some(Err(_))
    ));

    let mut socket = open_socket(&app).await;
    subscribe(&mut socket, &topic, &member.token).await;
    assert_eq!(next_json(&mut socket).await["error"]["code"], "FORBIDDEN");
}

async fn open_socket(app: &TestApp) -> TestSocket {
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let address = listener.local_addr().unwrap();
    let router = app.app.clone();
    tokio::spawn(async move {
        axum::serve(listener, router).await.unwrap();
    });
    let (socket, _) = connect_async(format!("ws://{address}/ws"))
        .await
        .expect("expected the websocket to connect");
    socket
}

async fn subscribe(socket: &mut TestSocket, channel: &str, token: &str) {
    let request = json!({
        "type": "REQUEST",
        "request": "SUBSCRIBE",
        "channel": channel,
        "token": token,
    });
    socket
        .send(SocketMessage::Text(request.to_string().into()))
        .await
        .unwrap();
}

async fn next_json(socket: &mut TestSocket) -> serde_json::Value {
    loop {
        let message =
            tokio::time::timeout(Duration::from_secs(5), socket.next())
                .await
                .expect("expected a websocket message")
                .expect("expected the websocket to stay open")
                .unwrap();
        if let SocketMessage::Text(text) = message {
            return serde_json::from_str(&text).unwrap();
        }
    }
}
