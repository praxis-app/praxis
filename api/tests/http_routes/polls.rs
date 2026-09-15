use axum::http::StatusCode;
use entity::{
    enums::{NotificationKind, VoteType},
    notifications, poll_actions, polls, server_roles, votes,
};
use sea_orm::{
    ColumnTrait, ConnectionTrait, DbBackend, EntityTrait, PaginatorTrait,
    QueryFilter, Statement, TransactionTrait,
};
use serde_json::{json, Value};
use uuid::Uuid;

use crate::support::{json_body, TestApp};

struct TestUser {
    token: String,
    user_id: String,
}

#[tokio::test]
async fn concurrent_votes_ratify_and_execute_a_proposal_action_once() {
    let app = TestApp::new().await;
    let proposer = signup(&app, "proposer@example.com", "Proposer").await;
    let voter_a = signup(&app, "voter-a@example.com", "Voter A").await;
    let voter_b = signup(&app, "voter-b@example.com", "Voter B").await;
    let default_server = json_body(app.get("/api/servers/default").await).await;
    let server_id = default_server["server"]["id"].as_str().unwrap();

    let channels =
        json_body(app.get(&format!("/api/servers/{server_id}/channels")).await)
            .await;
    let channel_id = channels["channels"][0]["id"].as_str().unwrap();

    let config_response = app
        .put_json_with_bearer(
            &format!("/api/servers/{server_id}/configs"),
            &json!({
                "decisionMakingModel": "consensus",
                "agreementThreshold": 51,
                "disagreementsLimit": 2,
                "abstainsLimit": 2,
                "quorumEnabled": false,
                "votingTimeLimit": 0,
            }),
            &proposer,
        )
        .await;
    assert_eq!(config_response.status(), StatusCode::OK);

    let role_name = "Concurrent consensus role";
    let create_response = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/channels/{channel_id}/polls"),
            &json!({
                "body": "Create one role under concurrent ratification",
                "pollType": "proposal",
                "action": {
                    "actionType": "create-role",
                    "serverRole": {
                        "name": role_name,
                        "color": "#336699",
                        "members": [],
                        "permissions": [],
                    }
                }
            }),
            &proposer,
        )
        .await;
    assert_eq!(create_response.status(), StatusCode::OK);
    let create_body = json_body(create_response).await;
    let poll_id = create_body["poll"]["id"].as_str().unwrap();
    let vote_uri = format!(
        "/api/servers/{server_id}/channels/{channel_id}/polls/{poll_id}/votes"
    );

    let disagree_response = app
        .post_json_with_bearer(
            &vote_uri,
            &json!({ "voteType": "disagree" }),
            &proposer,
        )
        .await;
    assert_eq!(disagree_response.status(), StatusCode::OK);
    assert!(
        !json_body(disagree_response).await["vote"]["isRatifyingVote"]
            .as_bool()
            .unwrap()
    );

    let agree = json!({ "voteType": "agree" });
    let (response_a, response_b) = tokio::join!(
        app.post_json_with_bearer(&vote_uri, &agree, &voter_a),
        app.post_json_with_bearer(&vote_uri, &agree, &voter_b),
    );
    assert_eq!(response_a.status(), StatusCode::OK);
    assert_eq!(response_b.status(), StatusCode::OK);

    let body_a = json_body(response_a).await;
    let body_b = json_body(response_b).await;
    let ratifying_responses = [&body_a, &body_b]
        .into_iter()
        .filter(|body| body["vote"]["isRatifyingVote"] == true)
        .count();
    assert_eq!(ratifying_responses, 1);

    let poll_id = Uuid::parse_str(poll_id).unwrap();
    let poll = polls::Entity::find_by_id(poll_id)
        .one(app.database())
        .await
        .unwrap()
        .unwrap();
    assert_eq!(poll.stage.as_str(), "ratified");

    let action = poll_actions::Entity::find()
        .filter(poll_actions::Column::PollId.eq(poll_id))
        .one(app.database())
        .await
        .unwrap()
        .unwrap();
    assert!(action.executed_at.is_some());

    let server_id = Uuid::parse_str(server_id).unwrap();
    let created_role_count = server_roles::Entity::find()
        .filter(server_roles::Column::ServerId.eq(server_id))
        .filter(server_roles::Column::Name.eq(role_name))
        .count(app.database())
        .await
        .unwrap();
    assert_eq!(created_role_count, 1);
}

#[tokio::test]
async fn blocking_is_unrestricted_by_default() {
    let app = TestApp::new().await;
    let proposer = signup_user(&app, "proposer@example.com", "Proposer").await;
    let member = signup_user(&app, "member@example.com", "Member").await;
    let (server_id, channel_id) = default_server_channel(&app).await;
    set_consensus_config(&app, &proposer, &server_id, true).await;

    let poll_id =
        create_proposal(&app, &proposer, &server_id, &channel_id).await;
    let response =
        block(&app, &member, &server_id, &channel_id, &poll_id).await;

    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn majority_vote_proposals_reject_blocks() {
    let app = TestApp::new().await;
    let proposer = signup_user(&app, "proposer@example.com", "Proposer").await;
    let member = signup_user(&app, "member@example.com", "Member").await;
    let (server_id, channel_id) = default_server_channel(&app).await;

    let config_response = app
        .put_json_with_bearer(
            &format!("/api/servers/{server_id}/configs"),
            &json!({
                "decisionMakingModel": "majority-vote",
                "agreementThreshold": 51,
                "disagreementsLimit": 2,
                "abstainsLimit": 2,
                "quorumEnabled": false,
                "votingTimeLimit": 0,
            }),
            &proposer.token,
        )
        .await;
    assert_eq!(config_response.status(), StatusCode::OK);

    let poll_id =
        create_proposal(&app, &proposer, &server_id, &channel_id).await;
    let response =
        block(&app, &member, &server_id, &channel_id, &poll_id).await;

    assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);
}

#[tokio::test]
async fn proposals_opened_before_the_restriction_keep_their_snapshot() {
    let app = TestApp::new().await;
    let proposer = signup_user(&app, "proposer@example.com", "Proposer").await;
    let member = signup_user(&app, "member@example.com", "Member").await;
    let (server_id, channel_id) = default_server_channel(&app).await;
    set_consensus_config(&app, &proposer, &server_id, true).await;

    let poll_id =
        create_proposal(&app, &proposer, &server_id, &channel_id).await;
    set_consensus_config(&app, &proposer, &server_id, false).await;

    let response =
        block(&app, &member, &server_id, &channel_id, &poll_id).await;

    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn a_block_stops_counting_once_its_voter_loses_the_permission() {
    let app = TestApp::new().await;
    let proposer = signup_user(&app, "proposer@example.com", "Proposer").await;
    let blocker = signup_user(&app, "blocker@example.com", "Blocker").await;
    let voter_a = signup_user(&app, "voter-a@example.com", "Voter A").await;
    let voter_b = signup_user(&app, "voter-b@example.com", "Voter B").await;
    let (server_id, channel_id) = default_server_channel(&app).await;
    set_consensus_config(&app, &proposer, &server_id, false).await;
    let role_id =
        grant_proposal_block(&app, &proposer, &server_id, &blocker).await;

    let poll_id =
        create_proposal(&app, &proposer, &server_id, &channel_id).await;
    assert_eq!(
        block(&app, &blocker, &server_id, &channel_id, &poll_id)
            .await
            .status(),
        StatusCode::OK
    );
    assert_eq!(
        vote(&app, &voter_a, &server_id, &channel_id, &poll_id, "agree")
            .await
            .status(),
        StatusCode::OK
    );
    assert_eq!(poll_stage(&app, &poll_id).await, "voting");

    let removal = app
        .delete_with_bearer(
            &format!(
                "/api/servers/{server_id}/roles/{role_id}/members/{}",
                blocker.user_id
            ),
            &proposer.token,
        )
        .await;
    assert_eq!(removal.status(), StatusCode::OK);

    // The next evaluation re-checks eligibility, so the stale block no longer
    // holds the proposal open
    let response =
        vote(&app, &voter_b, &server_id, &channel_id, &poll_id, "agree").await;
    assert_eq!(response.status(), StatusCode::OK);
    assert!(json_body(response).await["vote"]["isRatifyingVote"]
        .as_bool()
        .unwrap());
    assert_eq!(poll_stage(&app, &poll_id).await, "ratified");

    let block_votes = votes::Entity::find()
        .filter(votes::Column::PollId.eq(Uuid::parse_str(&poll_id).unwrap()))
        .filter(votes::Column::VoteType.eq(VoteType::Block))
        .count(app.database())
        .await
        .unwrap();
    assert_eq!(block_votes, 1, "the block vote row is kept, not deleted");
}

#[tokio::test]
async fn votes_from_removed_members_stop_counting_toward_the_outcome() {
    let app = TestApp::new().await;
    let proposer = signup_user(&app, "proposer@example.com", "Proposer").await;
    let departed = signup_user(&app, "departed@example.com", "Departed").await;
    let voter = signup_user(&app, "voter@example.com", "Voter").await;
    let (server_id, channel_id) = default_server_channel(&app).await;
    set_consensus_config(&app, &proposer, &server_id, true).await;

    let poll_id =
        create_proposal(&app, &proposer, &server_id, &channel_id).await;
    assert_eq!(
        vote(
            &app,
            &departed,
            &server_id,
            &channel_id,
            &poll_id,
            "disagree"
        )
        .await
        .status(),
        StatusCode::OK
    );

    let removal = app
        .delete_json_with_bearer(
            &format!("/api/servers/{server_id}/members"),
            &json!({ "userIds": [departed.user_id] }),
            &proposer.token,
        )
        .await;
    assert_eq!(removal.status(), StatusCode::OK);

    let response =
        vote(&app, &voter, &server_id, &channel_id, &poll_id, "agree").await;
    assert_eq!(response.status(), StatusCode::OK);
    assert!(json_body(response).await["vote"]["isRatifyingVote"]
        .as_bool()
        .unwrap());
    assert_eq!(poll_stage(&app, &poll_id).await, "ratified");
}

#[tokio::test]
async fn a_member_removed_mid_evaluation_does_not_mix_electorates() {
    let app = TestApp::new().await;
    let proposer = signup_user(&app, "proposer@example.com", "Proposer").await;
    let blocker = signup_user(&app, "blocker@example.com", "Blocker").await;
    let departed = signup_user(&app, "departed@example.com", "Departed").await;
    let voter = signup_user(&app, "voter@example.com", "Voter").await;
    let (server_id, channel_id) = default_server_channel(&app).await;

    let config_response = app
        .put_json_with_bearer(
            &format!("/api/servers/{server_id}/configs"),
            &json!({
                "decisionMakingModel": "consensus",
                "agreementThreshold": 51,
                "disagreementsLimit": 2,
                "abstainsLimit": 2,
                "quorumEnabled": true,
                "quorumThreshold": 60,
                "votingTimeLimit": 0,
                "blocksOpenToAll": false,
            }),
            &proposer.token,
        )
        .await;
    assert_eq!(config_response.status(), StatusCode::OK);
    let role_id =
        grant_proposal_block(&app, &proposer, &server_id, &blocker).await;

    let poll_id =
        create_proposal(&app, &proposer, &server_id, &channel_id).await;
    assert_eq!(
        block(&app, &blocker, &server_id, &channel_id, &poll_id)
            .await
            .status(),
        StatusCode::OK
    );
    assert_eq!(
        vote(&app, &departed, &server_id, &channel_id, &poll_id, "agree")
            .await
            .status(),
        StatusCode::OK
    );
    let revoke_block = app
        .delete_with_bearer(
            &format!(
                "/api/servers/{server_id}/roles/{role_id}/members/{}",
                blocker.user_id
            ),
            &proposer.token,
        )
        .await;
    assert_eq!(revoke_block.status(), StatusCode::OK);

    let role_members_lock = app.database().begin().await.unwrap();
    role_members_lock
        .execute_unprepared(
            "LOCK TABLE server_role_members IN ACCESS EXCLUSIVE MODE",
        )
        .await
        .unwrap();

    let remove_departed_during_evaluation = async {
        wait_for_lock_waiter(&app, "server_role_members").await;
        app.database()
            .execute_unprepared(&format!(
                "DELETE FROM channel_members WHERE user_id = '{0}';
                 DELETE FROM server_members WHERE user_id = '{0}';",
                departed.user_id
            ))
            .await
            .unwrap();
        role_members_lock.commit().await.unwrap();
    };
    let (response, ()) = tokio::join!(
        vote(&app, &voter, &server_id, &channel_id, &poll_id, "agree"),
        remove_departed_during_evaluation,
    );

    assert_eq!(response.status(), StatusCode::OK);
    assert!(!json_body(response).await["vote"]["isRatifyingVote"]
        .as_bool()
        .unwrap());
    assert_eq!(poll_stage(&app, &poll_id).await, "voting");
}

#[tokio::test]
async fn withdrawing_a_vote_retracts_the_notification_it_created() {
    let app = TestApp::new().await;
    let author = signup_user(&app, "author@example.com", "Author").await;
    let voter = signup_user(&app, "voter@example.com", "Voter").await;
    let (server_id, channel_id) = default_server_channel(&app).await;
    set_open_voting_config(&app, &author, &server_id).await;
    let poll_id = create_proposal(&app, &author, &server_id, &channel_id).await;

    let response =
        vote(&app, &voter, &server_id, &channel_id, &poll_id, "agree").await;
    assert_eq!(response.status(), StatusCode::OK);
    let vote_id = vote_id_for(&app, &poll_id, &voter).await;
    assert_eq!(proposal_vote_notifications(&app, &author).await, 1);

    let response = app
        .delete_with_bearer(
            &format!(
                "/api/servers/{server_id}/channels/{channel_id}/polls/{poll_id}/votes/{vote_id}"
            ),
            &voter.token,
        )
        .await;
    let status = response.status();
    assert_eq!(status, StatusCode::OK, "{:?}", json_body(response).await);

    assert_eq!(proposal_vote_notifications(&app, &author).await, 0);
}

/// A future deadline keeps the proposal in voting, so a vote can be withdrawn
async fn set_open_voting_config(
    app: &TestApp,
    admin: &TestUser,
    server_id: &str,
) {
    let response = app
        .put_json_with_bearer(
            &format!("/api/servers/{server_id}/configs"),
            &json!({
                "decisionMakingModel": "consensus",
                "agreementThreshold": 51,
                "disagreementsLimit": 2,
                "abstainsLimit": 2,
                "quorumEnabled": false,
                "votingTimeLimit": 60,
                "blocksOpenToAll": false,
            }),
            &admin.token,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);
}

async fn vote_id_for(app: &TestApp, poll_id: &str, voter: &TestUser) -> String {
    votes::Entity::find()
        .filter(votes::Column::PollId.eq(Uuid::parse_str(poll_id).unwrap()))
        .filter(
            votes::Column::UserId.eq(Uuid::parse_str(&voter.user_id).unwrap()),
        )
        .one(app.database())
        .await
        .unwrap()
        .expect("expected the vote to exist")
        .id
        .to_string()
}

async fn proposal_vote_notifications(app: &TestApp, user: &TestUser) -> usize {
    notifications::Entity::find()
        .filter(
            notifications::Column::RecipientUserId
                .eq(Uuid::parse_str(&user.user_id).unwrap()),
        )
        .filter(notifications::Column::Kind.eq(NotificationKind::ProposalVote))
        .all(app.database())
        .await
        .unwrap()
        .len()
}

async fn default_server_channel(app: &TestApp) -> (String, String) {
    let default_server = json_body(app.get("/api/servers/default").await).await;
    let server_id = default_server["server"]["id"].as_str().unwrap().to_owned();
    let channels =
        json_body(app.get(&format!("/api/servers/{server_id}/channels")).await)
            .await;
    let channel_id = channels["channels"][0]["id"].as_str().unwrap().to_owned();

    (server_id, channel_id)
}

async fn set_consensus_config(
    app: &TestApp,
    admin: &TestUser,
    server_id: &str,
    blocks_open_to_all: bool,
) {
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
                "blocksOpenToAll": blocks_open_to_all,
            }),
            &admin.token,
        )
        .await;
    assert_eq!(response.status(), StatusCode::OK);
}

async fn grant_proposal_block(
    app: &TestApp,
    granter: &TestUser,
    server_id: &str,
    user: &TestUser,
) -> String {
    let create_response = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/roles"),
            &json!({ "name": "Blockers", "color": "#336699" }),
            &granter.token,
        )
        .await;
    assert_eq!(create_response.status(), StatusCode::OK);
    let role_id = json_body(create_response).await["serverRole"]["id"]
        .as_str()
        .unwrap()
        .to_owned();

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
) -> String {
    let response = app
        .post_json_with_bearer(
            &format!("/api/servers/{server_id}/channels/{channel_id}/polls"),
            &json!({
                "body": "A proposal to vote on",
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

async fn block(
    app: &TestApp,
    voter: &TestUser,
    server_id: &str,
    channel_id: &str,
    poll_id: &str,
) -> axum::response::Response {
    vote(app, voter, server_id, channel_id, poll_id, "block").await
}

async fn vote(
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

async fn wait_for_lock_waiter(app: &TestApp, table: &str) {
    let statement = Statement::from_sql_and_values(
        DbBackend::Postgres,
        "SELECT COUNT(*) AS waiting FROM pg_locks \
         JOIN pg_class ON pg_class.oid = pg_locks.relation \
         WHERE pg_class.relname = $1 AND NOT pg_locks.granted",
        [table.into()],
    );
    for _ in 0..500 {
        let row = app.database().query_one(statement.clone()).await.unwrap();
        let waiting: i64 = row.unwrap().try_get("", "waiting").unwrap();
        if waiting > 0 {
            return;
        }
        tokio::time::sleep(std::time::Duration::from_millis(10)).await;
    }
    panic!("expected a query to wait on the {table} lock");
}

async fn poll_stage(app: &TestApp, poll_id: &str) -> String {
    polls::Entity::find_by_id(Uuid::parse_str(poll_id).unwrap())
        .one(app.database())
        .await
        .unwrap()
        .unwrap()
        .stage
        .to_string()
}

async fn signup_user(app: &TestApp, email: &str, name: &str) -> TestUser {
    let response = app
        .post_json(
            "/api/auth/signup",
            &json!({
                "email": email,
                "name": name,
                "password": "correct horse battery staple",
            }),
        )
        .await;
    assert_eq!(response.status(), StatusCode::CREATED);

    let body: Value = json_body(response).await;
    TestUser {
        token: body["access_token"].as_str().unwrap().to_owned(),
        user_id: body["user"]["id"].as_str().unwrap().to_owned(),
    }
}

async fn signup(app: &TestApp, email: &str, name: &str) -> String {
    let response = app
        .post_json(
            "/api/auth/signup",
            &json!({
                "email": email,
                "name": name,
                "password": "correct horse battery staple",
            }),
        )
        .await;
    assert_eq!(response.status(), StatusCode::CREATED);

    let body: Value = json_body(response).await;
    body["access_token"].as_str().unwrap().to_owned()
}
