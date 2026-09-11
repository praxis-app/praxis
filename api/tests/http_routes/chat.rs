use axum::http::StatusCode;
use serde_json::json;
use std::{collections::HashMap, io::Cursor};

use crate::support::{json_body, MultipartField, TestApp};

#[tokio::test]
async fn create_message_atomically_supports_text_and_images() {
    let app = TestApp::new().await;
    let token = signup_and_get_token(&app).await;
    let default_server_id = default_server_id(&app).await;

    let channels_response = app
        .get(&format!("/api/servers/{default_server_id}/channels"))
        .await;
    let channel_id = json_body(channels_response).await["channels"][0]["id"]
        .as_str()
        .unwrap()
        .to_owned();

    let mut fields = HashMap::new();
    let mut png = Cursor::new(Vec::new());
    image::DynamicImage::new_rgba8(1, 1)
        .write_to(&mut png, image::ImageFormat::Png)
        .unwrap();
    fields.insert(
        "files".to_owned(),
        MultipartField {
            name: "files".to_owned(),
            filename: Some("pixel.png".to_owned()),
            content_type: Some("image/png".to_owned()),
            bytes: png.into_inner(),
        },
    );
    fields.insert(
        "payload".to_owned(),
        MultipartField {
            name: "payload".to_owned(),
            filename: None,
            content_type: Some("application/json".to_owned()),
            bytes: serde_json::to_vec(&json!({ "body": "hello world" }))
                .unwrap(),
        },
    );

    let create_response = app
        .post_multipart_with_bearer(
            &format!("/api/servers/{default_server_id}/channels/{channel_id}/messages"),
            &token,
            fields,
        )
        .await;
    assert_eq!(create_response.status(), StatusCode::OK);

    let create_body = json_body(create_response).await;
    let message = &create_body["message"];
    let message_id = message["id"].as_str().unwrap().to_owned();
    let image_id = message["images"][0]["id"].as_str().unwrap().to_owned();

    assert_eq!(message["body"], "hello world");
    assert!(message["images"][0]["isPlaceholder"].is_null());
    assert_eq!(message["user"]["name"], "Person Example");

    let feed_response = app
        .get(&format!(
            "/api/servers/{default_server_id}/channels/{channel_id}/feed?limit=20"
        ))
        .await;
    assert_eq!(feed_response.status(), StatusCode::OK);

    let feed_body = json_body(feed_response).await;
    assert_eq!(feed_body["feed"][0]["type"], "message");
    assert_eq!(feed_body["feed"][0]["id"], message_id);
    assert!(feed_body["startCursor"].is_string());
    assert!(feed_body["nextCursor"].is_string());
    assert_eq!(feed_body["hasMore"], false);

    let image_response = app
        .get(&format!(
            "/api/servers/{default_server_id}/channels/{channel_id}/messages/{message_id}/images/{image_id}"
        ))
        .await;
    assert_eq!(image_response.status(), StatusCode::OK);
    assert_eq!(image_response.headers()["content-type"], "image/png");
}

#[tokio::test]
async fn logged_out_users_cannot_read_non_default_server_channel_feeds() {
    let app = TestApp::new().await;
    let token = signup_and_get_token(&app).await;

    let server_response = app
        .post_json_with_bearer(
            "/api/servers",
            &json!({
                "name": "Private server",
                "slug": "private-server",
                "description": null,
                "isDefaultServer": false
            }),
            &token,
        )
        .await;
    assert_eq!(server_response.status(), StatusCode::OK);
    let server_id = json_body(server_response).await["server"]["id"]
        .as_str()
        .unwrap()
        .to_owned();

    let channels_response = app
        .get_with_bearer(&format!("/api/servers/{server_id}/channels"), &token)
        .await;
    let channel_id = json_body(channels_response).await["channels"][0]["id"]
        .as_str()
        .unwrap()
        .to_owned();

    let feed_response = app
        .get(&format!(
            "/api/servers/{server_id}/channels/{channel_id}/feed"
        ))
        .await;
    assert_eq!(feed_response.status(), StatusCode::FORBIDDEN);
}

async fn default_server_id(app: &TestApp) -> String {
    let response = app.get("/api/servers/default").await;
    let body = json_body(response).await;
    body["server"]["id"].as_str().unwrap().to_owned()
}

async fn signup_and_get_token(app: &TestApp) -> String {
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

    let body = json_body(response).await;
    body["access_token"].as_str().unwrap().to_owned()
}
