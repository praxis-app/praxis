use axum::http::StatusCode;
use serde_json::json;

use crate::support::{json_body, TestApp};

#[tokio::test]
async fn signup_returns_created_user_and_access_token() {
    let app = TestApp::new().await;

    let response = app
        .post_json(
            "/api/auth/signup",
            &json!({
                "email": "person@example.com",
                "name": "Person Example",
                "password": "correct horse battery staple",
            }),
        )
        .await;

    assert_eq!(response.status(), StatusCode::CREATED);

    let body = json_body(response).await;
    assert_eq!(body["user"]["email"], "person@example.com");
    assert_eq!(body["user"]["name"], "Person Example");
    let user_id = body["user"]["id"].as_str().unwrap();
    assert!(uuid::Uuid::parse_str(user_id).is_ok());
    assert!(body["access_token"].as_str().is_some());
}

#[tokio::test]
async fn signup_rejects_duplicate_email_after_normalization() {
    let app = TestApp::new().await;

    let first_response = app
        .post_json(
            "/api/auth/signup",
            &json!({
                "email": "person@example.com",
                "name": "Original Person",
                "password": "correct horse battery staple",
            }),
        )
        .await;
    assert_eq!(first_response.status(), StatusCode::CREATED);

    let second_response = app
        .post_json(
            "/api/auth/signup",
            &json!({
                "email": "  PERSON@example.com ",
                "name": "Another Person",
                "password": "correct horse battery staple",
            }),
        )
        .await;

    assert_eq!(second_response.status(), StatusCode::CONFLICT);

    let body = json_body(second_response).await;
    assert_eq!(body["error"], "An account with that email already exists.");
}

#[tokio::test]
async fn login_returns_the_authenticated_user_and_access_token() {
    let app = TestApp::new().await;

    let signup_response = app
        .post_json(
            "/api/auth/signup",
            &json!({
                "email": "person@example.com",
                "name": "Person Example",
                "password": "correct horse battery staple",
            }),
        )
        .await;
    let signup_body = json_body(signup_response).await;
    let signup_user = signup_body["user"].clone();

    let login_response = app
        .post_json(
            "/api/auth/login",
            &json!({
                "email": "PERSON@example.com",
                "password": "correct horse battery staple",
            }),
        )
        .await;

    assert_eq!(login_response.status(), StatusCode::OK);

    let login_body = json_body(login_response).await;

    assert_eq!(login_body["user"], signup_user);
    assert!(login_body["access_token"].as_str().is_some());
}

#[tokio::test]
async fn login_rejects_invalid_credentials() {
    let app = TestApp::new().await;

    let signup_response = app
        .post_json(
            "/api/auth/signup",
            &json!({
                "email": "person@example.com",
                "name": "Person Example",
                "password": "correct horse battery staple",
            }),
        )
        .await;
    assert_eq!(signup_response.status(), StatusCode::CREATED);

    let response = app
        .post_json(
            "/api/auth/login",
            &json!({
                "email": "person@example.com",
                "password": "wrong password",
            }),
        )
        .await;

    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);

    let body = json_body(response).await;
    assert_eq!(body["error"], "Invalid email or password.");
}

#[tokio::test]
async fn invited_signup_can_log_back_in_to_its_non_default_server() {
    let app = TestApp::new().await;
    let admin_token =
        signup(&app, "admin@example.com", "Admin Example", None).await;
    let server_id = create_server(&app, &admin_token).await;
    let invite_token = create_invite(&app, &admin_token, &server_id).await;

    signup(
        &app,
        "invited@example.com",
        "Invited Person",
        Some(&invite_token),
    )
    .await;
    log_out(&app).await;

    let login_token = log_in(&app, "invited@example.com").await;
    let me_response = app.get_with_bearer("/api/users/me", &login_token).await;
    assert_eq!(me_response.status(), StatusCode::OK);

    let me = json_body(me_response).await;
    assert_eq!(me["user"]["currentServer"]["id"], server_id);
    assert_eq!(me["user"]["serversCount"], 1);
}

#[tokio::test]
async fn invited_existing_user_keeps_the_non_default_server_after_login() {
    let app = TestApp::new().await;
    let admin_token =
        signup(&app, "admin@example.com", "Admin Example", None).await;
    let member_token =
        signup(&app, "member@example.com", "Member Example", None).await;
    let server_id = create_server(&app, &admin_token).await;
    let invite_token = create_invite(&app, &admin_token, &server_id).await;

    let join_response = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/join"),
            &json!({ "inviteToken": invite_token }),
            &member_token,
        )
        .await;
    assert_eq!(join_response.status(), StatusCode::OK);

    let current_response = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/current"),
            &json!({}),
            &member_token,
        )
        .await;
    assert_eq!(current_response.status(), StatusCode::OK);

    log_out(&app).await;

    let login_token = log_in(&app, "member@example.com").await;
    let me_response = app.get_with_bearer("/api/users/me", &login_token).await;
    assert_eq!(me_response.status(), StatusCode::OK);

    let me = json_body(me_response).await;
    assert_eq!(me["user"]["currentServer"]["id"], server_id);
    assert_eq!(me["user"]["serversCount"], 2);

    let servers_response = app
        .get_with_bearer("/api/users/me/servers", &login_token)
        .await;
    assert_eq!(servers_response.status(), StatusCode::OK);

    let servers = json_body(servers_response).await;
    assert!(servers["servers"]
        .as_array()
        .unwrap()
        .iter()
        .any(|server| server["id"] == server_id));
}

async fn signup(
    app: &TestApp,
    email: &str,
    name: &str,
    invite_token: Option<&str>,
) -> String {
    let response = app
        .post_json(
            "/api/auth/signup",
            &json!({
                "email": email,
                "name": name,
                "password": "correct horse battery staple",
                "inviteToken": invite_token,
            }),
        )
        .await;
    assert_eq!(response.status(), StatusCode::CREATED);

    json_body(response).await["access_token"]
        .as_str()
        .unwrap()
        .to_owned()
}

async fn log_in(app: &TestApp, email: &str) -> String {
    let response = app
        .post_json(
            "/api/auth/login",
            &json!({
                "email": email,
                "password": "correct horse battery staple",
            }),
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);

    json_body(response).await["access_token"]
        .as_str()
        .unwrap()
        .to_owned()
}

async fn log_out(app: &TestApp) {
    let response = app.post_json("/api/auth/logout", &json!({})).await;
    assert_eq!(response.status(), StatusCode::OK);
}

async fn create_server(app: &TestApp, admin_token: &str) -> String {
    let response = app
        .post_json_with_bearer(
            "/api/servers",
            &json!({
                "name": "Invited server",
                "slug": "invited-server",
                "description": null,
                "isDefaultServer": false,
            }),
            admin_token,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);

    json_body(response).await["server"]["id"]
        .as_str()
        .unwrap()
        .to_owned()
}

async fn create_invite(
    app: &TestApp,
    admin_token: &str,
    server_id: &str,
) -> String {
    let response = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/invites"),
            &json!({ "maxUses": null, "expiresAt": null }),
            admin_token,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);

    json_body(response).await["invite"]["token"]
        .as_str()
        .unwrap()
        .to_owned()
}
