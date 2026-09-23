use axum::http::StatusCode;
use entity::{
    channel_members, channels,
    enums::{ModerationAction, ModerationTargetKind},
    moderation_actions, server_bans, server_members,
};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, QueryOrder};
use serde_json::json;
use uuid::Uuid;

use crate::support::{json_body, TestApp};

struct TestUser {
    token: String,
    user_id: String,
}

#[tokio::test]
async fn server_capabilities_only_accept_their_moderation_actions() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let server_id = default_server_id(&app).await;
    let role_id = create_server_role(&app, &admin, &server_id, "Mods").await;
    let uri = format!("/api/servers/{server_id}/roles/{role_id}/permissions");

    for (subject, action, expected) in [
        ("ServerMember", "manage", StatusCode::OK),
        ("Call", "manage", StatusCode::OK),
        ("ServerMember", "delete", StatusCode::BAD_REQUEST),
        ("Call", "update", StatusCode::BAD_REQUEST),
        ("User", "update", StatusCode::BAD_REQUEST),
    ] {
        let response = app
            .put_json_with_bearer(
                &uri,
                &json!({
                    "permissions": [{ "subject": subject, "action": [action] }],
                }),
                &admin.token,
            )
            .await;
        assert_eq!(response.status(), expected, "{subject}: {action}");
    }
}

#[tokio::test]
async fn instance_capabilities_only_accept_their_moderation_actions() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let role_id = create_instance_role(&app, &admin, "Moderators").await;
    let uri = format!("/api/instance/roles/{role_id}/permissions");

    for (subject, actions, expected) in [
        ("Message", vec!["delete"], StatusCode::OK),
        ("Call", vec!["manage"], StatusCode::OK),
        ("User", vec!["update", "delete"], StatusCode::OK),
        ("Message", vec!["manage"], StatusCode::BAD_REQUEST),
        ("User", vec!["manage"], StatusCode::BAD_REQUEST),
        ("ServerMember", vec!["manage"], StatusCode::BAD_REQUEST),
    ] {
        let response = app
            .put_json_with_bearer(
                &uri,
                &json!({
                    "permissions": [{ "subject": subject, "action": actions }],
                }),
                &admin.token,
            )
            .await;
        assert_eq!(response.status(), expected, "{subject}: {actions:?}");
    }
}

#[tokio::test]
async fn proposals_can_grant_only_valid_server_capability_actions() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let server_id = default_server_id(&app).await;
    let channel_id = general_channel_id(&app, &server_id).await;
    let role_id = create_server_role(&app, &admin, &server_id, "Mods").await;
    let uri = format!("/api/servers/{server_id}/channels/{channel_id}/polls");

    for (action, expected) in [
        ("manage", StatusCode::OK),
        ("delete", StatusCode::UNPROCESSABLE_ENTITY),
    ] {
        let response = app
            .post_json_with_bearer(
                &uri,
                &json!({
                    "body": "Let the mods manage members",
                    "pollType": "proposal",
                    "action": {
                        "actionType": "change-role",
                        "serverRole": {
                            "serverRoleToUpdateId": role_id,
                            "permissions": [{
                                "subject": "ServerMember",
                                "actions": [
                                    { "action": action, "changeType": "add" }
                                ],
                            }],
                        }
                    }
                }),
                &admin.token,
            )
            .await;
        assert_eq!(response.status(), expected, "{action}");
    }
}

#[tokio::test]
async fn member_managers_can_remove_members_once() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let moderator = signup(&app, "mod@example.com", "Moderator").await;
    let member = signup(&app, "member@example.com", "Member").await;
    let server_id = default_server_id(&app).await;
    grant_member_manager(&app, &admin, &server_id, &[&moderator]).await;
    let uri = member_uri(&server_id, &member, "remove");

    for _ in 0..2 {
        let response = app
            .post_json_with_bearer(
                &uri,
                &json!({ "reason": "  spam  " }),
                &moderator.token,
            )
            .await;
        assert_eq!(response.status(), StatusCode::OK);
    }

    assert!(!is_member(&app, &server_id, &member).await);
    assert_eq!(channel_membership_count(&app, &member).await, 0);
    let actions = moderation_rows(&app, &member).await;
    assert_eq!(actions.len(), 1);
    assert_eq!(actions[0].action, ModerationAction::RemoveMember);
    assert_eq!(actions[0].target_kind, ModerationTargetKind::User);
    assert_eq!(actions[0].actor_user_id.to_string(), moderator.user_id);
    assert_eq!(
        actions[0].server_id.map(|id| id.to_string()),
        Some(server_id)
    );
    assert_eq!(actions[0].reason.as_deref(), Some("spam"));
}

#[tokio::test]
async fn members_without_member_management_cannot_moderate_members() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member").await;
    let other = signup(&app, "other@example.com", "Other").await;
    let server_id = default_server_id(&app).await;
    let server_manager =
        signup(&app, "servers@example.com", "Server Manager").await;
    grant_instance_permission(
        &app,
        &admin,
        &server_manager,
        "Server",
        "manage",
    )
    .await;

    for actor in [&member, &server_manager] {
        for (action, expected) in [
            ("remove", StatusCode::FORBIDDEN),
            ("ban", StatusCode::FORBIDDEN),
        ] {
            let response = app
                .post_json_with_bearer(
                    &member_uri(&server_id, &other, action),
                    &json!({}),
                    &actor.token,
                )
                .await;
            assert_eq!(response.status(), expected);
        }
    }

    let bans = app
        .get_with_bearer(
            &format!("/api/servers/{server_id}/bans"),
            &member.token,
        )
        .await;
    assert_eq!(bans.status(), StatusCode::FORBIDDEN);
    assert!(is_member(&app, &server_id, &other).await);
}

#[tokio::test]
async fn moderators_cannot_target_themselves_or_other_member_managers() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let moderator = signup(&app, "mod@example.com", "Moderator").await;
    let other_moderator =
        signup(&app, "mod2@example.com", "Moderator Two").await;
    let server_id = default_server_id(&app).await;
    grant_member_manager(
        &app,
        &admin,
        &server_id,
        &[&moderator, &other_moderator],
    )
    .await;

    let self_response = app
        .post_json_with_bearer(
            &member_uri(&server_id, &moderator, "ban"),
            &json!({}),
            &moderator.token,
        )
        .await;
    assert_eq!(self_response.status(), StatusCode::BAD_REQUEST);

    let peer_response = app
        .post_json_with_bearer(
            &member_uri(&server_id, &other_moderator, "remove"),
            &json!({}),
            &moderator.token,
        )
        .await;
    assert_eq!(peer_response.status(), StatusCode::FORBIDDEN);

    let admin_response = app
        .post_json_with_bearer(
            &member_uri(&server_id, &other_moderator, "remove"),
            &json!({}),
            &admin.token,
        )
        .await;
    assert_eq!(admin_response.status(), StatusCode::OK);
    assert!(!is_member(&app, &server_id, &other_moderator).await);
}

#[tokio::test]
async fn banned_users_cannot_rejoin_until_unbanned() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member").await;
    let server_id = create_server(&app, &admin, "Other", "other").await;
    add_server_member(&app, &admin, &server_id, &member).await;
    let invite_token = create_invite(&app, &admin, &server_id).await;
    let ban_uri = member_uri(&server_id, &member, "ban");

    for _ in 0..2 {
        let response = app
            .post_json_with_bearer(
                &ban_uri,
                &json!({ "reason": null }),
                &admin.token,
            )
            .await;
        assert_eq!(response.status(), StatusCode::OK);
    }
    assert!(!is_member(&app, &server_id, &member).await);
    assert_eq!(ban_count(&app, &server_id).await, 1);

    let bans = app
        .get_with_bearer(
            &format!("/api/servers/{server_id}/bans"),
            &admin.token,
        )
        .await;
    assert_eq!(bans.status(), StatusCode::OK);
    assert_eq!(
        json_body(bans).await["bans"][0]["user"]["id"],
        json!(member.user_id)
    );

    let join = join_server(&app, &member, &server_id, &invite_token).await;
    assert_eq!(join, StatusCode::FORBIDDEN);
    let add = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/members"),
            &json!({ "userIds": [member.user_id] }),
            &admin.token,
        )
        .await;
    assert_eq!(add.status(), StatusCode::FORBIDDEN);
    let read = app
        .get_with_bearer(
            &format!("/api/servers/{server_id}?inviteToken={invite_token}"),
            &member.token,
        )
        .await;
    assert_eq!(read.status(), StatusCode::FORBIDDEN);
    assert!(!is_member(&app, &server_id, &member).await);

    for _ in 0..2 {
        let unban = app.delete_with_bearer(&ban_uri, &admin.token).await;
        assert_eq!(unban.status(), StatusCode::OK);
    }
    let rejoin = join_server(&app, &member, &server_id, &invite_token).await;
    assert_eq!(rejoin, StatusCode::OK);
    assert!(is_member(&app, &server_id, &member).await);

    let actions = moderation_rows(&app, &member)
        .await
        .into_iter()
        .map(|row| row.action)
        .collect::<Vec<_>>();
    assert_eq!(
        actions,
        vec![ModerationAction::BanMember, ModerationAction::UnbanMember]
    );
}

#[tokio::test]
async fn moderating_an_unknown_user_returns_not_found() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let server_id = default_server_id(&app).await;
    let ghost = TestUser {
        token: String::new(),
        user_id: Uuid::new_v4().to_string(),
    };

    let response = app
        .post_json_with_bearer(
            &member_uri(&server_id, &ghost, "ban"),
            &json!({}),
            &admin.token,
        )
        .await;
    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

fn member_uri(server_id: &str, user: &TestUser, action: &str) -> String {
    format!("/api/servers/{server_id}/members/{}/{action}", user.user_id)
}

async fn join_server(
    app: &TestApp,
    user: &TestUser,
    server_id: &str,
    invite_token: &str,
) -> StatusCode {
    app.post_json_with_bearer(
        &format!("/api/servers/{server_id}/join"),
        &json!({ "inviteToken": invite_token }),
        &user.token,
    )
    .await
    .status()
}

async fn is_member(app: &TestApp, server_id: &str, user: &TestUser) -> bool {
    server_members::Entity::find()
        .filter(
            server_members::Column::ServerId
                .eq(Uuid::parse_str(server_id).unwrap()),
        )
        .filter(server_members::Column::UserId.eq(user_uuid(user)))
        .one(app.database())
        .await
        .unwrap()
        .is_some()
}

async fn channel_membership_count(app: &TestApp, user: &TestUser) -> usize {
    channel_members::Entity::find()
        .filter(channel_members::Column::UserId.eq(user_uuid(user)))
        .all(app.database())
        .await
        .unwrap()
        .len()
}

async fn ban_count(app: &TestApp, server_id: &str) -> usize {
    server_bans::Entity::find()
        .filter(
            server_bans::Column::ServerId
                .eq(Uuid::parse_str(server_id).unwrap()),
        )
        .all(app.database())
        .await
        .unwrap()
        .len()
}

async fn moderation_rows(
    app: &TestApp,
    target: &TestUser,
) -> Vec<moderation_actions::Model> {
    let mut rows = moderation_actions::Entity::find()
        .filter(moderation_actions::Column::TargetId.eq(user_uuid(target)))
        .all(app.database())
        .await
        .unwrap();
    rows.sort_by_key(|row| row.created_at);
    rows
}

fn user_uuid(user: &TestUser) -> Uuid {
    Uuid::parse_str(&user.user_id).unwrap()
}

async fn grant_member_manager(
    app: &TestApp,
    granter: &TestUser,
    server_id: &str,
    users: &[&TestUser],
) {
    let role_id =
        create_server_role(app, granter, server_id, "Member Managers").await;
    let permissions = app
        .put_json_with_bearer(
            &format!("/api/servers/{server_id}/roles/{role_id}/permissions"),
            &json!({
                "permissions": [
                    { "subject": "ServerMember", "action": ["manage"] },
                ],
            }),
            &granter.token,
        )
        .await;
    assert_eq!(permissions.status(), StatusCode::OK);

    let members = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/roles/{role_id}/members"),
            &json!({
                "userIds": users.iter().map(|user| &user.user_id).collect::<Vec<_>>(),
            }),
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
    let role_id = create_instance_role(app, granter, subject).await;
    let permissions = app
        .put_json_with_bearer(
            &format!("/api/instance/roles/{role_id}/permissions"),
            &json!({
                "permissions": [{ "subject": subject, "action": [action] }],
            }),
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

async fn add_server_member(
    app: &TestApp,
    granter: &TestUser,
    server_id: &str,
    user: &TestUser,
) {
    let response = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/members"),
            &json!({ "userIds": [user.user_id] }),
            &granter.token,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);
}

async fn create_invite(
    app: &TestApp,
    granter: &TestUser,
    server_id: &str,
) -> String {
    let response = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/invites"),
            &json!({ "maxUses": null, "expiresAt": null }),
            &granter.token,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);

    json_body(response).await["invite"]["token"]
        .as_str()
        .unwrap()
        .to_owned()
}

async fn create_server_role(
    app: &TestApp,
    granter: &TestUser,
    server_id: &str,
    name: &str,
) -> String {
    let response = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/roles"),
            &json!({ "name": name, "color": "#336699" }),
            &granter.token,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);

    json_body(response).await["serverRole"]["id"]
        .as_str()
        .unwrap()
        .to_owned()
}

async fn create_instance_role(
    app: &TestApp,
    granter: &TestUser,
    name: &str,
) -> String {
    let response = app
        .post_json_with_bearer(
            "/api/instance/roles",
            &json!({ "name": name, "color": "#336699" }),
            &granter.token,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);

    json_body(response).await["instanceRole"]["id"]
        .as_str()
        .unwrap()
        .to_owned()
}
