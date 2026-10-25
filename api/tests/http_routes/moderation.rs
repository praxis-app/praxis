use axum::http::StatusCode;
use entity::{channels, moderation_actions};
use futures_util::{SinkExt, StreamExt};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, QueryOrder, Set,
};
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

async fn create_server(
    app: &TestApp,
    owner: &TestUser,
    name: &str,
    slug: &str,
) -> String {
    let response = app
        .post_json_with_bearer(
            "/api/servers",
            &json!({
                "name": name,
                "slug": slug,
                "description": null,
                "isDefaultServer": false,
            }),
            &owner.token,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);
    json_body(response).await["server"]["id"]
        .as_str()
        .unwrap()
        .to_owned()
}

async fn grant_server_permission(
    app: &TestApp,
    granter: &TestUser,
    user: &TestUser,
    server_id: &str,
    subject: &str,
    action: &str,
) {
    let role = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/roles"),
            &json!({ "name": format!("{subject} {action}"), "color": "#336699" }),
            &granter.token,
        )
        .await;
    assert_eq!(role.status(), StatusCode::OK);
    let role_id = json_body(role).await["serverRole"]["id"]
        .as_str()
        .unwrap()
        .to_owned();
    let permissions = app
        .put_json_with_bearer(
            &format!("/api/servers/{server_id}/roles/{role_id}/permissions"),
            &json!({ "permissions": [{ "subject": subject, "action": [action] }] }),
            &granter.token,
        )
        .await;
    assert_eq!(permissions.status(), StatusCode::OK);
    let members = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/roles/{role_id}/members"),
            &json!({ "userIds": [user.user_id] }),
            &granter.token,
        )
        .await;
    assert_eq!(members.status(), StatusCode::OK);
}

async fn grant_instance_permission(
    app: &TestApp,
    granter: &TestUser,
    user: &TestUser,
    subject: &str,
    action: &str,
) {
    let role = app
        .post_json_with_bearer(
            "/api/instance/roles",
            &json!({ "name": format!("{subject} {action}"), "color": "#336699" }),
            &granter.token,
        )
        .await;
    assert_eq!(role.status(), StatusCode::OK);
    let role_id = json_body(role).await["instanceRole"]["id"]
        .as_str()
        .unwrap()
        .to_owned();
    let permissions = app
        .put_json_with_bearer(
            &format!("/api/instance/roles/{role_id}/permissions"),
            &json!({ "permissions": [{ "subject": subject, "action": [action] }] }),
            &granter.token,
        )
        .await;
    assert_eq!(permissions.status(), StatusCode::OK);
    let members = app
        .post_json_with_bearer(
            &format!("/api/instance/roles/{role_id}/members"),
            &json!({ "userIds": [user.user_id] }),
            &granter.token,
        )
        .await;
    assert_eq!(members.status(), StatusCode::OK);
}

fn encode_query_value(value: &str) -> String {
    value
        .replace('%', "%25")
        .replace('+', "%2B")
        .replace(':', "%3A")
        .replace('|', "%7C")
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
async fn audit_log_permissions_accept_scoped_read_and_all_manage() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let reader = signup(&app, "reader@example.com", "Reader").await;
    let manager = signup(&app, "manager@example.com", "Manager").await;
    let instance_reader =
        signup(&app, "instance@example.com", "Instance Reader").await;
    let server_id = default_server_id(&app).await;

    grant_server_permission(
        &app, &admin, &reader, &server_id, "AuditLog", "read",
    )
    .await;
    grant_server_permission(
        &app, &admin, &manager, &server_id, "all", "manage",
    )
    .await;
    grant_instance_permission(
        &app,
        &admin,
        &instance_reader,
        "AuditLog",
        "read",
    )
    .await;

    for user in [&reader, &manager, &instance_reader] {
        let response = app
            .get_with_bearer(
                &format!("/api/servers/{server_id}/audit-log"),
                &user.token,
            )
            .await;
        assert_eq!(response.status(), StatusCode::OK);
    }
    for user in [&reader, &manager] {
        let response = app.get_with_bearer("/api/audit-log", &user.token).await;
        assert_eq!(response.status(), StatusCode::FORBIDDEN);
    }
    let response = app
        .get_with_bearer("/api/audit-log", &instance_reader.token)
        .await;
    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn audit_log_filters_paginate_stably_and_isolate_servers() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member").await;
    let server_id = default_server_id(&app).await;
    let other_server_id = create_server(&app, &admin, "Other", "other").await;

    let ban = app
        .post_json_with_bearer(
            &member_uri(&server_id, &member, "ban"),
            &json!({ "reason": "Repeated harassment" }),
            &admin.token,
        )
        .await;
    assert_eq!(ban.status(), StatusCode::OK);
    let config = app
        .put_json_with_bearer(
            &format!("/api/servers/{server_id}/configs"),
            &json!({ "anonymousUsersEnabled": true }),
            &admin.token,
        )
        .await;
    assert_eq!(config.status(), StatusCode::OK);

    let records = moderation_actions::Entity::find()
        .filter(
            moderation_actions::Column::ServerId
                .eq(Uuid::parse_str(&server_id).unwrap()),
        )
        .order_by_desc(moderation_actions::Column::CreatedAt)
        .all(app.database())
        .await
        .unwrap();
    assert!(records.len() >= 2);
    let tied_time = records[0].created_at;
    for record in records.iter().take(2) {
        let mut active: moderation_actions::ActiveModel = record.clone().into();
        active.created_at = Set(tied_time);
        active.update(app.database()).await.unwrap();
    }

    let first = app
        .get_with_bearer(
            &format!("/api/servers/{server_id}/audit-log?limit=1"),
            &admin.token,
        )
        .await;
    assert_eq!(first.status(), StatusCode::OK);
    let first_body = json_body(first).await;
    assert!(first_body["hasMore"].as_bool().unwrap());
    let first_id = first_body["entries"][0]["id"].as_str().unwrap();
    let cursor = encode_query_value(first_body["nextCursor"].as_str().unwrap());
    let second = app
        .get_with_bearer(
            &format!(
                "/api/servers/{server_id}/audit-log?limit=1&cursor={cursor}"
            ),
            &admin.token,
        )
        .await;
    assert_eq!(second.status(), StatusCode::OK);
    assert_ne!(
        json_body(second).await["entries"][0]["id"]
            .as_str()
            .unwrap(),
        first_id
    );

    let full = app
        .get_with_bearer(
            &format!("/api/servers/{server_id}/audit-log"),
            &admin.token,
        )
        .await;
    let full_body = json_body(full).await;
    let ban_entry = full_body["entries"]
        .as_array()
        .unwrap()
        .iter()
        .find(|entry| entry["action"] == "ban_member")
        .unwrap();
    let created_at =
        encode_query_value(ban_entry["createdAt"].as_str().unwrap());
    let actor_id = ban_entry["actor"]["id"].as_str().unwrap();
    let target_id = ban_entry["target"]["id"].as_str().unwrap();
    for filter in [
        "action=ban_member".to_owned(),
        format!("actorId={actor_id}"),
        "targetKind=user".to_owned(),
        format!("targetId={target_id}"),
        format!("serverId={server_id}"),
        format!("from={created_at}&to={created_at}"),
    ] {
        let response = app
            .get_with_bearer(&format!("/api/audit-log?{filter}"), &admin.token)
            .await;
        assert_eq!(response.status(), StatusCode::OK);
        let body = json_body(response).await;
        assert!(!body["entries"].as_array().unwrap().is_empty());
    }

    let scoped = app
        .get_with_bearer(
            &format!("/api/servers/{server_id}/audit-log"),
            &admin.token,
        )
        .await;
    assert!(json_body(scoped).await["entries"]
        .as_array()
        .unwrap()
        .iter()
        .all(|entry| entry["scope"]["serverId"] != other_server_id));
}

#[tokio::test]
async fn audit_log_is_read_only_and_keeps_deleted_target_labels() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let server_id = create_server(&app, &admin, "Temporary", "temporary").await;

    let delete = app
        .delete_with_bearer(&format!("/api/servers/{server_id}"), &admin.token)
        .await;
    assert_eq!(delete.status(), StatusCode::OK);

    let log = app
        .get_with_bearer("/api/audit-log?action=delete_server", &admin.token)
        .await;
    assert_eq!(log.status(), StatusCode::OK);
    let body = json_body(log).await;
    let entry = &body["entries"][0];
    assert_eq!(entry["target"]["label"], "Temporary");
    assert!(entry["applicationPath"].is_null());

    let entry_id = entry["id"].as_str().unwrap();
    let detail_path = format!("/api/audit-log/{entry_id}");
    assert_eq!(
        app.get_with_bearer(&detail_path, &admin.token)
            .await
            .status(),
        StatusCode::NOT_FOUND
    );
    assert_eq!(
        app.put_json_with_bearer(&detail_path, &json!({}), &admin.token)
            .await
            .status(),
        StatusCode::NOT_FOUND
    );
    assert_eq!(
        app.delete_with_bearer(&detail_path, &admin.token)
            .await
            .status(),
        StatusCode::NOT_FOUND
    );
}

#[tokio::test]
async fn audit_writes_cover_admin_and_proposal_changes_but_not_routine_activity(
) {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let server_id = default_server_id(&app).await;
    let channel_id = general_channel_id(&app, &server_id).await;
    let server_uuid = Uuid::parse_str(&server_id).unwrap();

    let initial_count = audit_records_for_server(&app, server_uuid).await.len();
    let message = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/channels/{channel_id}/messages"),
            &json!({ "body": "Routine message" }),
            &admin.token,
        )
        .await;
    assert_eq!(message.status(), StatusCode::OK);
    assert_eq!(
        audit_records_for_server(&app, server_uuid).await.len(),
        initial_count
    );

    let role = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/roles"),
            &json!({ "name": "Auditors", "color": "#336699" }),
            &admin.token,
        )
        .await;
    assert_eq!(role.status(), StatusCode::OK);
    let role_id = json_body(role).await["serverRole"]["id"]
        .as_str()
        .unwrap()
        .to_owned();
    let role_entries = audit_records_for_server(&app, server_uuid)
        .await
        .into_iter()
        .filter(|record| record.target_id.to_string() == role_id)
        .collect::<Vec<_>>();
    assert_eq!(role_entries.len(), 1);
    assert_eq!(role_entries[0].origin.to_string(), "direct");
    assert_eq!(role_entries[0].action.to_string(), "create_role");
    assert_eq!(
        role_entries[0].actor_user_id.unwrap().to_string(),
        admin.user_id
    );
    assert!(role_entries[0].after_value.is_some());

    let direct_config = app
        .put_json_with_bearer(
            &format!("/api/servers/{server_id}/configs"),
            &json!({
                "decisionMakingModel": "majority-vote",
                "agreementThreshold": 51,
                "quorumEnabled": false,
                "votingTimeLimit": 0,
                "anonymousUsersEnabled": false
            }),
            &admin.token,
        )
        .await;
    assert_eq!(direct_config.status(), StatusCode::OK);
    let direct_config_entries = audit_records_for_server(&app, server_uuid)
        .await
        .into_iter()
        .filter(|record| {
            record.action.to_string() == "update_server_config"
                && record.origin.to_string() == "direct"
        })
        .collect::<Vec<_>>();
    assert_eq!(direct_config_entries.len(), 1);
    assert!(direct_config_entries[0].before_value.is_some());
    assert!(direct_config_entries[0].after_value.is_some());

    let proposal = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/channels/{channel_id}/polls"),
            &json!({
                "body": "Enable anonymous access",
                "pollType": "proposal",
                "action": {
                    "actionType": "change-settings",
                    "serverConfig": { "anonymousUsersEnabled": true }
                }
            }),
            &admin.token,
        )
        .await;
    assert_eq!(proposal.status(), StatusCode::OK);
    let proposal_id = json_body(proposal).await["poll"]["id"]
        .as_str()
        .unwrap()
        .to_owned();
    let before_vote_count =
        audit_records_for_server(&app, server_uuid).await.len();
    let vote = app
        .post_json_with_bearer(
            &format!(
                "/api/servers/{server_id}/channels/{channel_id}/polls/{proposal_id}/votes"
            ),
            &json!({ "voteType": "agree" }),
            &admin.token,
        )
        .await;
    assert_eq!(vote.status(), StatusCode::OK);
    let proposal_entries = audit_records_for_server(&app, server_uuid)
        .await
        .into_iter()
        .filter(|record| {
            record.proposal_id.map(|id| id.to_string())
                == Some(proposal_id.clone())
        })
        .collect::<Vec<_>>();
    assert_eq!(proposal_entries.len(), 1);
    assert_eq!(proposal_entries[0].origin.to_string(), "proposal");
    assert!(proposal_entries[0].actor_user_id.is_none());
    assert!(proposal_entries[0].before_value.is_some());
    assert!(proposal_entries[0].after_value.is_some());
    assert_eq!(
        audit_records_for_server(&app, server_uuid).await.len(),
        before_vote_count + 1
    );

    let general_proposal = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/channels/{channel_id}/polls"),
            &json!({
                "body": "Routine proposal",
                "pollType": "proposal",
                "action": { "actionType": "general" }
            }),
            &admin.token,
        )
        .await;
    assert_eq!(general_proposal.status(), StatusCode::OK);
    let general_proposal_id = json_body(general_proposal).await["poll"]["id"]
        .as_str()
        .unwrap()
        .to_owned();
    let before_routine_vote =
        audit_records_for_server(&app, server_uuid).await.len();
    let routine_vote = app
        .post_json_with_bearer(
            &format!(
                "/api/servers/{server_id}/channels/{channel_id}/polls/{general_proposal_id}/votes"
            ),
            &json!({ "voteType": "agree" }),
            &admin.token,
        )
        .await;
    assert_eq!(routine_vote.status(), StatusCode::OK);
    assert_eq!(
        audit_records_for_server(&app, server_uuid).await.len(),
        before_routine_vote
    );
}

async fn audit_records_for_server(
    app: &TestApp,
    server_id: Uuid,
) -> Vec<moderation_actions::Model> {
    moderation_actions::Entity::find()
        .filter(moderation_actions::Column::ServerId.eq(server_id))
        .all(app.database())
        .await
        .unwrap()
}

#[tokio::test]
async fn instance_admins_without_a_server_role_can_moderate_its_members() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let owner = signup(&app, "owner@example.com", "Owner").await;
    let member = signup(&app, "member@example.com", "Member").await;
    grant_instance_permission(&app, &admin, &owner, "Server", "manage").await;
    let server_id = create_server(&app, &owner, "Owned", "owned").await;
    let added = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/members"),
            &json!({ "userIds": [admin.user_id, member.user_id] }),
            &owner.token,
        )
        .await;
    assert_eq!(added.status(), StatusCode::OK);

    for target in [&member, &owner] {
        let removal = app
            .post_json_with_bearer(
                &member_uri(&server_id, target, "remove"),
                &json!({ "reason": "Instance policy" }),
                &admin.token,
            )
            .await;
        assert_eq!(removal.status(), StatusCode::OK);
    }
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
