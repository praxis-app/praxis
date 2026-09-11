use axum::http::StatusCode;
use entity::{channels, server_members, server_roles};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, QueryOrder};
use serde_json::json;
use uuid::Uuid;

use crate::support::{json_body, TestApp};

struct TestUser {
    token: String,
    user_id: String,
}

#[tokio::test]
async fn members_without_instance_permissions_cannot_create_servers() {
    let app = TestApp::new().await;
    let _admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member Example").await;

    let response = app
        .post_json_with_bearer(
            "/api/servers",
            &server_payload("Member server", "member-server", false),
            &member.token,
        )
        .await;

    assert_eq!(response.status(), StatusCode::FORBIDDEN);
}

#[tokio::test]
async fn server_admins_cannot_reassign_the_instance_default_server() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member Example").await;
    let original_default_id = default_server_id(&app).await;
    let other_server_id = create_server(&app, &admin, "Other", "other").await;
    grant_server_admin(&app, &admin, &other_server_id, &member).await;

    let response = app
        .put_json_with_bearer(
            &format!("/api/servers/{other_server_id}"),
            &server_payload("Other", "other", true),
            &member.token,
        )
        .await;

    assert_eq!(response.status(), StatusCode::FORBIDDEN);
    assert_eq!(default_server_id(&app).await, original_default_id);
}

#[tokio::test]
async fn server_admins_cannot_delete_a_server() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member Example").await;
    let other_server_id = create_server(&app, &admin, "Other", "other").await;
    grant_server_admin(&app, &admin, &other_server_id, &member).await;

    let member_response = app
        .delete_with_bearer(
            &format!("/api/servers/{other_server_id}"),
            &member.token,
        )
        .await;
    assert_eq!(member_response.status(), StatusCode::FORBIDDEN);

    let admin_response = app
        .delete_with_bearer(
            &format!("/api/servers/{other_server_id}"),
            &admin.token,
        )
        .await;
    assert_eq!(admin_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn logged_out_users_cannot_read_non_default_server_channels() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let server_id = create_server(&app, &admin, "Private", "private").await;
    let channel_id = general_channel_id(&app, &server_id).await;

    let list_response =
        app.get(&format!("/api/servers/{server_id}/channels")).await;
    assert_eq!(list_response.status(), StatusCode::FORBIDDEN);

    let detail_response = app
        .get(&format!("/api/servers/{server_id}/channels/{channel_id}"))
        .await;
    assert_eq!(detail_response.status(), StatusCode::FORBIDDEN);
}

#[tokio::test]
async fn only_instance_role_managers_can_read_instance_roles() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member Example").await;

    let member_response = app
        .get_with_bearer("/api/instance/roles", &member.token)
        .await;
    assert_eq!(member_response.status(), StatusCode::FORBIDDEN);

    let admin_response = app
        .get_with_bearer("/api/instance/roles", &admin.token)
        .await;
    assert_eq!(admin_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn only_instance_role_managers_can_read_a_single_instance_role() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member Example").await;
    let role_id = create_instance_role(&app, &admin, "Moderators").await;
    let uri = format!("/api/instance/roles/{role_id}");

    let member_response = app.get_with_bearer(&uri, &member.token).await;
    assert_eq!(member_response.status(), StatusCode::FORBIDDEN);

    let admin_response = app.get_with_bearer(&uri, &admin.token).await;
    assert_eq!(admin_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn only_instance_role_managers_can_list_users_eligible_for_a_role() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member Example").await;
    let role_id = create_instance_role(&app, &admin, "Moderators").await;
    let uri = format!("/api/instance/roles/{role_id}/members/eligible");

    let member_response = app.get_with_bearer(&uri, &member.token).await;
    assert_eq!(member_response.status(), StatusCode::FORBIDDEN);

    let admin_response = app.get_with_bearer(&uri, &admin.token).await;
    assert_eq!(admin_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn server_roles_cannot_be_granted_to_non_members() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let outsider = signup(&app, "outsider@example.com", "Outsider").await;
    let insider = signup(&app, "insider@example.com", "Insider").await;
    let server_id = create_server(&app, &admin, "Other", "other").await;
    let role_id =
        create_server_role(&app, &admin, &server_id, "Moderators").await;
    let uri = format!("/api/servers/{server_id}/roles/{role_id}/members");

    let outsider_response = app
        .post_json_with_bearer(
            &uri,
            &json!({ "userIds": [outsider.user_id] }),
            &admin.token,
        )
        .await;
    assert_eq!(outsider_response.status(), StatusCode::UNPROCESSABLE_ENTITY);

    add_server_member(&app, &admin, &server_id, &insider).await;
    let insider_response = app
        .post_json_with_bearer(
            &uri,
            &json!({ "userIds": [insider.user_id] }),
            &admin.token,
        )
        .await;
    assert_eq!(insider_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn eligible_role_members_are_scoped_to_the_server() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let outsider = signup(&app, "outsider@example.com", "Outsider").await;
    let insider = signup(&app, "insider@example.com", "Insider").await;
    let server_id = create_server(&app, &admin, "Other", "other").await;
    let role_id =
        create_server_role(&app, &admin, &server_id, "Moderators").await;
    add_server_member(&app, &admin, &server_id, &insider).await;
    let uri =
        format!("/api/servers/{server_id}/roles/{role_id}/members/eligible");

    let response = app.get_with_bearer(&uri, &admin.token).await;
    assert_eq!(response.status(), StatusCode::OK);

    let body = json_body(response).await;
    let user_ids: Vec<String> = body["users"]
        .as_array()
        .expect("users should be an array")
        .iter()
        .map(|user| user["id"].as_str().unwrap_or_default().to_owned())
        .collect();

    assert!(user_ids.contains(&insider.user_id));
    assert!(!user_ids.contains(&outsider.user_id));
}

#[tokio::test]
async fn eligible_role_members_require_read_access_to_the_server() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let outsider = signup(&app, "outsider@example.com", "Outsider").await;
    let member = signup(&app, "member@example.com", "Member Example").await;
    let server_id = create_server(&app, &admin, "Private", "private").await;
    let role_id =
        create_server_role(&app, &admin, &server_id, "Moderators").await;
    add_server_member(&app, &admin, &server_id, &member).await;
    let uri =
        format!("/api/servers/{server_id}/roles/{role_id}/members/eligible");

    let outsider_response = app.get_with_bearer(&uri, &outsider.token).await;
    assert_eq!(outsider_response.status(), StatusCode::FORBIDDEN);

    let member_response = app.get_with_bearer(&uri, &member.token).await;
    assert_eq!(member_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn invited_users_can_read_channels_whether_or_not_they_are_signed_in() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member Example").await;
    let server_id = create_server(&app, &admin, "Private", "private").await;
    let channel_id = general_channel_id(&app, &server_id).await;
    let invite_token = create_invite(&app, &admin, &server_id).await;

    let list_uri =
        format!("/api/servers/{server_id}/channels?inviteToken={invite_token}");
    let detail_uri = format!(
        "/api/servers/{server_id}/channels/{channel_id}\
         ?inviteToken={invite_token}"
    );

    let logged_out_list = app.get(&list_uri).await;
    assert_eq!(logged_out_list.status(), StatusCode::OK);
    let logged_out_detail = app.get(&detail_uri).await;
    assert_eq!(logged_out_detail.status(), StatusCode::OK);

    let member_list = app.get_with_bearer(&list_uri, &member.token).await;
    assert_eq!(member_list.status(), StatusCode::OK);
    let member_detail = app.get_with_bearer(&detail_uri, &member.token).await;
    assert_eq!(member_detail.status(), StatusCode::OK);
}

#[tokio::test]
async fn reading_server_roles_requires_read_access_to_the_server() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let outsider = signup(&app, "outsider@example.com", "Outsider").await;
    let member = signup(&app, "member@example.com", "Member Example").await;
    let server_id = create_server(&app, &admin, "Private", "private").await;
    add_server_member(&app, &admin, &server_id, &member).await;
    let uri = format!("/api/servers/{server_id}/roles");

    let outsider_response = app.get_with_bearer(&uri, &outsider.token).await;
    assert_eq!(outsider_response.status(), StatusCode::FORBIDDEN);

    let member_response = app.get_with_bearer(&uri, &member.token).await;
    assert_eq!(member_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn invited_users_can_read_poll_voters_whether_or_not_they_are_signed_in()
{
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let outsider = signup(&app, "outsider@example.com", "Outsider").await;
    let server_id = create_server(&app, &admin, "Private", "private").await;
    let channel_id = general_channel_id(&app, &server_id).await;
    let invite_token = create_invite(&app, &admin, &server_id).await;

    let poll_response = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/channels/{channel_id}/polls"),
            &json!({
                "body": "Lunch?",
                "pollType": "poll",
                "options": ["Tacos", "Pizza"],
            }),
            &admin.token,
        )
        .await;
    assert_eq!(poll_response.status(), StatusCode::OK);

    let body = json_body(poll_response).await;
    let poll_id = body["poll"]["id"].as_str().expect("poll id").to_owned();
    let option_id = body["poll"]["options"][0]["id"]
        .as_str()
        .expect("poll option id")
        .to_owned();

    let uri = format!(
        "/api/servers/{server_id}/channels/{channel_id}/polls/{poll_id}\
         /options/{option_id}/voters?inviteToken={invite_token}"
    );

    let logged_out = app.get(&uri).await;
    assert_eq!(logged_out.status(), StatusCode::OK);

    let signed_in = app.get_with_bearer(&uri, &outsider.token).await;
    assert_eq!(signed_in.status(), StatusCode::OK);
}

#[tokio::test]
async fn profiles_outside_the_default_server_are_not_publicly_readable() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let server_id = create_server(&app, &admin, "Private", "private").await;
    let invite_token = create_invite(&app, &admin, &server_id).await;
    let outsider = signup_with_invite(
        &app,
        "outsider@example.com",
        "Outsider",
        &invite_token,
    )
    .await;

    let outsider_uri = format!("/api/users/{}/profile", outsider.user_id);
    let logged_out_response = app.get(&outsider_uri).await;
    assert_eq!(logged_out_response.status(), StatusCode::FORBIDDEN);

    let self_response =
        app.get_with_bearer(&outsider_uri, &outsider.token).await;
    assert_eq!(self_response.status(), StatusCode::OK);

    let admin_response = app.get_with_bearer(&outsider_uri, &admin.token).await;
    assert_eq!(admin_response.status(), StatusCode::OK);

    let stranger = signup(&app, "stranger@example.com", "Stranger").await;
    let stranger_response =
        app.get_with_bearer(&outsider_uri, &stranger.token).await;
    assert_eq!(stranger_response.status(), StatusCode::FORBIDDEN);

    let admin_uri = format!("/api/users/{}/profile", admin.user_id);
    let default_member_response = app.get(&admin_uri).await;
    assert_eq!(default_member_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn only_instance_server_managers_can_list_users_eligible_for_a_server() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let server_admin =
        signup(&app, "server-admin@example.com", "Server Admin").await;
    let server_id = default_server_id(&app).await;
    grant_server_admin(&app, &admin, &server_id, &server_admin).await;
    let uri = format!("/api/servers/{server_id}/members/eligible");

    let server_admin_response =
        app.get_with_bearer(&uri, &server_admin.token).await;
    assert_eq!(server_admin_response.status(), StatusCode::FORBIDDEN);

    let admin_response = app.get_with_bearer(&uri, &admin.token).await;
    assert_eq!(admin_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn only_instance_server_managers_can_list_all_servers() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let server_admin =
        signup(&app, "server-admin@example.com", "Server Admin").await;
    let default_server_id = default_server_id(&app).await;
    grant_server_admin(&app, &admin, &default_server_id, &server_admin).await;

    let server_admin_response = app
        .get_with_bearer("/api/servers", &server_admin.token)
        .await;
    assert_eq!(server_admin_response.status(), StatusCode::FORBIDDEN);

    let admin_response =
        app.get_with_bearer("/api/servers", &admin.token).await;
    assert_eq!(admin_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn reading_a_server_requires_read_access_to_it() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let outsider = signup(&app, "outsider@example.com", "Outsider").await;
    let member = signup(&app, "member@example.com", "Member Example").await;
    let server_id = create_server(&app, &admin, "Private", "private").await;
    add_server_member(&app, &admin, &server_id, &member).await;

    for uri in server_read_uris(&server_id, "private") {
        let outsider_response =
            app.get_with_bearer(&uri, &outsider.token).await;
        assert_eq!(
            outsider_response.status(),
            StatusCode::FORBIDDEN,
            "expected a non-member to be refused by {uri}"
        );

        let member_response = app.get_with_bearer(&uri, &member.token).await;
        assert_eq!(
            member_response.status(),
            StatusCode::OK,
            "expected a member to be admitted by {uri}"
        );
    }
}

#[tokio::test]
async fn instance_server_managers_can_read_servers_they_have_not_joined() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let manager = signup(&app, "manager@example.com", "Instance Manager").await;
    grant_instance_server_manager(&app, &admin, &manager).await;

    let server_id = create_server(&app, &admin, "Private", "private").await;

    for uri in server_read_uris(&server_id, "private") {
        let response = app.get_with_bearer(&uri, &manager.token).await;
        assert_eq!(
            response.status(),
            StatusCode::OK,
            "expected an instance server manager to be admitted by {uri}"
        );
    }
}

#[tokio::test]
async fn invited_users_can_read_a_server_before_joining() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let outsider = signup(&app, "outsider@example.com", "Outsider").await;
    let server_id = create_server(&app, &admin, "Private", "private").await;
    let invite_token = create_invite(&app, &admin, &server_id).await;

    for uri in server_read_uris(&server_id, "private") {
        let refused = app.get_with_bearer(&uri, &outsider.token).await;
        assert_eq!(refused.status(), StatusCode::FORBIDDEN);

        let separator = if uri.contains('?') { '&' } else { '?' };
        let invited_uri = format!("{uri}{separator}inviteToken={invite_token}");
        let admitted = app.get_with_bearer(&invited_uri, &outsider.token).await;
        assert_eq!(
            admitted.status(),
            StatusCode::OK,
            "expected an invite holder to be admitted by {invited_uri}"
        );
    }
}

#[tokio::test]
async fn server_reads_require_a_token_even_on_the_default_server() {
    let app = TestApp::new().await;
    let _admin = signup(&app, "admin@example.com", "Admin Example").await;
    let server_id = default_server_id(&app).await;
    let slug = default_server_slug(&app).await;

    for uri in server_read_uris(&server_id, &slug) {
        let anonymous_response = app.get(&uri).await;
        assert_eq!(
            anonymous_response.status(),
            StatusCode::UNAUTHORIZED,
            "expected {uri} to reject a request carrying no token"
        );

        let malformed_response =
            app.get_with_bearer(&uri, "not-a-real-token").await;
        assert_eq!(
            malformed_response.status(),
            StatusCode::UNAUTHORIZED,
            "expected {uri} to reject a malformed token"
        );
    }
}

#[tokio::test]
async fn a_single_use_invite_admits_only_one_member_under_concurrency() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let first = signup(&app, "first@example.com", "First Joiner").await;
    let second = signup(&app, "second@example.com", "Second Joiner").await;
    let server_id = create_server(&app, &admin, "Private", "private").await;
    let invite_token =
        create_invite_with_max_uses(&app, &admin, &server_id, 1).await;

    let uri = format!("/api/servers/{server_id}/join");
    let payload = json!({ "inviteToken": invite_token });
    let (first_response, second_response) = tokio::join!(
        app.post_json_with_bearer(&uri, &payload, &first.token),
        app.post_json_with_bearer(&uri, &payload, &second.token),
    );

    let mut statuses =
        [first_response.status(), second_response.status()].to_vec();
    statuses.sort_by_key(|status| status.as_u16());
    assert_eq!(
        statuses,
        vec![StatusCode::OK, StatusCode::BAD_REQUEST],
        "expected exactly one join to succeed and one to be refused"
    );

    assert_eq!(
        server_member_count(&app, &server_id).await,
        2,
        "expected the invite to admit exactly one new member"
    );
}

#[tokio::test]
async fn proposals_cannot_target_a_role_in_another_server() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member Example").await;
    let default_server_id = default_server_id(&app).await;
    let channel_id = general_channel_id(&app, &default_server_id).await;
    let other_server_id = create_server(&app, &admin, "Other", "other").await;
    let foreign_role_id = admin_role_id(&app, &other_server_id).await;

    let response = app
        .post_json_with_bearer(
            &format!(
                "/api/servers/{default_server_id}/channels/{channel_id}/polls"
            ),
            &json!({
                "body": "Grant myself the other server's admin role",
                "pollType": "proposal",
                "action": {
                    "actionType": "change-role",
                    "serverRole": {
                        "serverRoleToUpdateId": foreign_role_id,
                        "members": [
                            { "userId": member.user_id, "changeType": "add" }
                        ],
                    }
                }
            }),
            &member.token,
        )
        .await;

    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn only_channel_managers_can_create_channels() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member Example").await;
    let server_id = default_server_id(&app).await;
    let uri = format!("/api/servers/{server_id}/channels");

    let member_response = app
        .post_json_with_bearer(
            &uri,
            &json!({ "name": "member-channel" }),
            &member.token,
        )
        .await;
    assert_eq!(member_response.status(), StatusCode::FORBIDDEN);

    let admin_response = app
        .post_json_with_bearer(
            &uri,
            &json!({ "name": "admin-channel" }),
            &admin.token,
        )
        .await;
    assert_eq!(admin_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn only_invite_managers_can_read_server_invites() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member Example").await;
    let server_id = default_server_id(&app).await;
    let uri = format!("/api/servers/{server_id}/invites");

    let member_response = app.get_with_bearer(&uri, &member.token).await;
    assert_eq!(member_response.status(), StatusCode::FORBIDDEN);

    let admin_response = app.get_with_bearer(&uri, &admin.token).await;
    assert_eq!(admin_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn only_role_managers_can_update_server_role_permissions() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member Example").await;
    let server_id = default_server_id(&app).await;

    let create_response = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/roles"),
            &json!({ "name": "Moderators", "color": "#336699" }),
            &admin.token,
        )
        .await;
    assert_eq!(create_response.status(), StatusCode::OK);
    let role_id = json_body(create_response).await["serverRole"]["id"]
        .as_str()
        .unwrap()
        .to_owned();

    let uri = format!("/api/servers/{server_id}/roles/{role_id}/permissions");
    let payload = json!({
        "permissions": [{ "subject": "Channel", "action": ["manage"] }],
    });

    let member_response = app
        .put_json_with_bearer(&uri, &payload, &member.token)
        .await;
    assert_eq!(member_response.status(), StatusCode::FORBIDDEN);

    let admin_response =
        app.put_json_with_bearer(&uri, &payload, &admin.token).await;
    assert_eq!(admin_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn only_instance_role_managers_can_create_instance_roles() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member Example").await;

    let member_response = app
        .post_json_with_bearer(
            "/api/instance/roles",
            &json!({ "name": "Member role", "color": "#336699" }),
            &member.token,
        )
        .await;
    assert_eq!(member_response.status(), StatusCode::FORBIDDEN);

    let admin_response = app
        .post_json_with_bearer(
            "/api/instance/roles",
            &json!({ "name": "Admin role", "color": "#336699" }),
            &admin.token,
        )
        .await;
    assert_eq!(admin_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn restricted_blocks_are_refused_without_the_proposal_block_permission() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member Example").await;
    let server_id = default_server_id(&app).await;
    let channel_id = general_channel_id(&app, &server_id).await;
    restrict_blocks(&app, &admin, &server_id).await;

    let poll_id =
        create_proposal(&app, &admin, &server_id, &channel_id, "Restricted")
            .await;

    let response =
        cast_vote(&app, &member, &server_id, &channel_id, &poll_id, "block")
            .await;

    assert_eq!(response.status(), StatusCode::FORBIDDEN);
}

#[tokio::test]
async fn a_role_granting_proposal_block_restores_blocking() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member Example").await;
    let server_id = default_server_id(&app).await;
    let channel_id = general_channel_id(&app, &server_id).await;
    restrict_blocks(&app, &admin, &server_id).await;
    grant_proposal_block(&app, &admin, &server_id, &member).await;

    let poll_id =
        create_proposal(&app, &admin, &server_id, &channel_id, "Restricted")
            .await;

    let response =
        cast_vote(&app, &member, &server_id, &channel_id, &poll_id, "block")
            .await;

    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn a_role_holding_the_all_subject_keeps_blocking() {
    let app = TestApp::new().await;
    let admin = signup(&app, "admin@example.com", "Admin Example").await;
    let member = signup(&app, "member@example.com", "Member Example").await;
    let server_id = default_server_id(&app).await;
    let channel_id = general_channel_id(&app, &server_id).await;
    restrict_blocks(&app, &admin, &server_id).await;
    grant_all_subject(&app, &admin, &server_id, &member).await;

    let poll_id =
        create_proposal(&app, &admin, &server_id, &channel_id, "Restricted")
            .await;

    let response =
        cast_vote(&app, &member, &server_id, &channel_id, &poll_id, "block")
            .await;

    assert_eq!(response.status(), StatusCode::OK);
}

async fn restrict_blocks(app: &TestApp, admin: &TestUser, server_id: &str) {
    let response = app
        .put_json_with_bearer(
            &format!("/api/servers/{server_id}/configs"),
            &json!({
                "decisionMakingModel": "consensus",
                "agreementThreshold": 51,
                "disagreementsLimit": 2,
                "abstainsLimit": 2,
                "quorumEnabled": false,
                "votingTimeLimit": 0,
                "blocksOpenToAll": false,
            }),
            &admin.token,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);
}

async fn grant_all_subject(
    app: &TestApp,
    granter: &TestUser,
    server_id: &str,
    user: &TestUser,
) {
    let role_id = create_server_role(app, granter, server_id, "Owners").await;

    let permissions_response = app
        .put_json_with_bearer(
            &format!("/api/servers/{server_id}/roles/{role_id}/permissions"),
            &json!({
                "permissions": [{ "subject": "all", "action": ["manage"] }],
            }),
            &granter.token,
        )
        .await;
    assert_eq!(permissions_response.status(), StatusCode::OK);

    let members_response = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/roles/{role_id}/members"),
            &json!({ "userIds": [user.user_id] }),
            &granter.token,
        )
        .await;
    assert_eq!(members_response.status(), StatusCode::OK);
}

async fn grant_proposal_block(
    app: &TestApp,
    granter: &TestUser,
    server_id: &str,
    user: &TestUser,
) -> String {
    let role_id = create_server_role(app, granter, server_id, "Blockers").await;

    let permissions_response = app
        .put_json_with_bearer(
            &format!("/api/servers/{server_id}/roles/{role_id}/permissions"),
            &json!({
                "permissions": [
                    { "subject": "ProposalBlock", "action": ["create"] },
                ],
            }),
            &granter.token,
        )
        .await;
    assert_eq!(permissions_response.status(), StatusCode::OK);

    let members_response = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/roles/{role_id}/members"),
            &json!({ "userIds": [user.user_id] }),
            &granter.token,
        )
        .await;
    assert_eq!(members_response.status(), StatusCode::OK);

    role_id
}

async fn create_proposal(
    app: &TestApp,
    proposer: &TestUser,
    server_id: &str,
    channel_id: &str,
    body: &str,
) -> String {
    let response = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/channels/{channel_id}/polls"),
            &json!({
                "body": body,
                "pollType": "proposal",
                "action": { "actionType": "general" },
            }),
            &proposer.token,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);

    json_body(response).await["poll"]["id"]
        .as_str()
        .unwrap()
        .to_owned()
}

async fn cast_vote(
    app: &TestApp,
    voter: &TestUser,
    server_id: &str,
    channel_id: &str,
    poll_id: &str,
    vote_type: &str,
) -> axum::response::Response {
    app.post_json_with_bearer(
        &format!(
            "/api/servers/{server_id}/channels/{channel_id}/polls/{poll_id}/votes"
        ),
        &json!({ "voteType": vote_type }),
        &voter.token,
    )
    .await
}

fn server_payload(
    name: &str,
    slug: &str,
    is_default_server: bool,
) -> serde_json::Value {
    json!({
        "name": name,
        "slug": slug,
        "description": null,
        "isDefaultServer": is_default_server,
    })
}

async fn signup(app: &TestApp, email: &str, name: &str) -> TestUser {
    signup_request(app, email, name, None).await
}

async fn signup_with_invite(
    app: &TestApp,
    email: &str,
    name: &str,
    invite_token: &str,
) -> TestUser {
    signup_request(app, email, name, Some(invite_token)).await
}

async fn signup_request(
    app: &TestApp,
    email: &str,
    name: &str,
    invite_token: Option<&str>,
) -> TestUser {
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

    let body = json_body(response).await;
    TestUser {
        token: body["access_token"].as_str().unwrap().to_owned(),
        user_id: body["user"]["id"].as_str().unwrap().to_owned(),
    }
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

async fn create_invite_with_max_uses(
    app: &TestApp,
    granter: &TestUser,
    server_id: &str,
    max_uses: u32,
) -> String {
    let response = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/invites"),
            &json!({ "maxUses": max_uses, "expiresAt": null }),
            &granter.token,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);

    json_body(response).await["invite"]["token"]
        .as_str()
        .unwrap()
        .to_owned()
}

async fn server_member_count(app: &TestApp, server_id: &str) -> usize {
    let server_id = Uuid::parse_str(server_id).unwrap();
    server_members::Entity::find()
        .filter(server_members::Column::ServerId.eq(server_id))
        .all(app.database())
        .await
        .unwrap()
        .len()
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

async fn default_server_id(app: &TestApp) -> String {
    let response = app.get("/api/servers/default").await;
    assert_eq!(response.status(), StatusCode::OK);

    json_body(response).await["server"]["id"]
        .as_str()
        .unwrap()
        .to_owned()
}

async fn default_server_slug(app: &TestApp) -> String {
    let response = app.get("/api/servers/default").await;
    assert_eq!(response.status(), StatusCode::OK);

    json_body(response).await["server"]["slug"]
        .as_str()
        .unwrap()
        .to_owned()
}

fn server_read_uris(server_id: &str, slug: &str) -> Vec<String> {
    vec![
        format!("/api/servers/{server_id}"),
        format!("/api/servers/slug/{slug}"),
        format!("/api/servers/{server_id}/members"),
        format!("/api/servers/{server_id}/configs"),
    ]
}

async fn grant_instance_server_manager(
    app: &TestApp,
    granter: &TestUser,
    user: &TestUser,
) {
    let role_id = create_instance_role(app, granter, "Server Managers").await;

    let permissions_response = app
        .put_json_with_bearer(
            &format!("/api/instance/roles/{role_id}/permissions"),
            &json!({
                "permissions": [
                    { "subject": "Server", "action": ["manage"] },
                ],
            }),
            &granter.token,
        )
        .await;
    assert_eq!(permissions_response.status(), StatusCode::OK);

    let members_response = app
        .post_json_with_bearer(
            &format!("/api/instance/roles/{role_id}/members"),
            &json!({ "userIds": [user.user_id] }),
            &granter.token,
        )
        .await;
    assert_eq!(members_response.status(), StatusCode::OK);
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
            &server_payload(name, slug, false),
            &owner.token,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);

    json_body(response).await["server"]["id"]
        .as_str()
        .unwrap()
        .to_owned()
}

async fn grant_server_admin(
    app: &TestApp,
    granter: &TestUser,
    server_id: &str,
    user: &TestUser,
) {
    add_server_member(app, granter, server_id, user).await;

    let role_id = admin_role_id(app, server_id).await;
    let role_members_response = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/roles/{role_id}/members"),
            &json!({ "userIds": [user.user_id] }),
            &granter.token,
        )
        .await;
    assert_eq!(role_members_response.status(), StatusCode::OK);
}

async fn admin_role_id(app: &TestApp, server_id: &str) -> String {
    let server_id = Uuid::parse_str(server_id).unwrap();
    let role = server_roles::Entity::find()
        .filter(server_roles::Column::ServerId.eq(server_id))
        .filter(server_roles::Column::Name.eq("admin"))
        .one(app.database())
        .await
        .unwrap()
        .expect("expected an admin role for the server");

    role.id.to_string()
}

async fn general_channel_id(app: &TestApp, server_id: &str) -> String {
    let server_id = Uuid::parse_str(server_id).unwrap();
    let channel = channels::Entity::find()
        .filter(channels::Column::ServerId.eq(server_id))
        .order_by_asc(channels::Column::SortOrder)
        .one(app.database())
        .await
        .unwrap()
        .expect("expected a channel in the server");

    channel.id.to_string()
}
