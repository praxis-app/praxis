use axum::http::StatusCode;
use sea_orm::{prelude::Uuid, ConnectionTrait};
use std::collections::HashSet;

use super::types::PermissionRule;
use crate::common::{ApiError, AppResult};

/// Lets `can` take `"manage"` or `["create", "read"]`
pub(crate) trait Actions {
    fn as_slice(&self) -> &[&str];
}

impl Actions for &str {
    fn as_slice(&self) -> &[&str] {
        std::slice::from_ref(self)
    }
}

impl<const N: usize> Actions for [&str; N] {
    fn as_slice(&self) -> &[&str] {
        self
    }
}

#[derive(Clone, Copy, Debug)]
pub(crate) enum PermissionScope {
    Instance,
    Server(Uuid),
    ServerOrInstance(Uuid),
}

/// If multiple `actions` are given, all of them must be granted
/// (not just one). An empty list always denies
pub(crate) async fn can<C: ConnectionTrait>(
    database: &C,
    user_id: Uuid,
    actions: impl Actions,
    subject: &str,
    scope: PermissionScope,
) -> AppResult<()> {
    let actions = actions.as_slice();
    let granted = |rules: &[_]| {
        !actions.is_empty()
            && actions
                .iter()
                .all(|action| is_allowed(rules, subject, action))
    };

    let allowed = match scope {
        PermissionScope::Instance => {
            granted(&instance_rules(database, user_id).await?)
        }
        PermissionScope::Server(server_id) => {
            server_rules(database, user_id, server_id)
                .await?
                .is_some_and(|rules| granted(&rules))
        }
        PermissionScope::ServerOrInstance(server_id) => {
            server_rules(database, user_id, server_id)
                .await?
                .is_some_and(|rules| granted(&rules))
                || granted(&instance_rules(database, user_id).await?)
        }
    };

    if allowed {
        Ok(())
    } else {
        Err(ApiError::new(StatusCode::FORBIDDEN, "Forbidden."))
    }
}

async fn instance_rules<C: ConnectionTrait>(
    database: &C,
    user_id: Uuid,
) -> AppResult<Vec<PermissionRule>> {
    crate::instance::instance_roles::service::get_permissions_by_user(
        database, user_id,
    )
    .await
}

async fn server_rules<C: ConnectionTrait>(
    database: &C,
    user_id: Uuid,
    server_id: Uuid,
) -> AppResult<Option<Vec<PermissionRule>>> {
    let mut permissions =
        crate::servers::server_roles::service::get_permissions_by_user(
            database, user_id,
        )
        .await?;
    Ok(permissions.remove(&server_id.to_string()))
}

pub(crate) async fn filter_users_who_can<C: ConnectionTrait>(
    database: &C,
    user_ids: &HashSet<Uuid>,
    action: &str,
    subject: &str,
    server_id: Uuid,
) -> AppResult<HashSet<Uuid>> {
    let user_ids: Vec<Uuid> = user_ids.iter().copied().collect();
    let permissions_by_user =
        crate::servers::server_roles::service::get_permissions_by_users(
            database, &user_ids,
        )
        .await?;
    let server_id = server_id.to_string();

    Ok(user_ids
        .into_iter()
        .filter(|user_id| {
            permissions_by_user
                .get(user_id)
                .and_then(|permissions| permissions.get(&server_id))
                .is_some_and(|rules| is_allowed(rules, subject, action))
        })
        .collect())
}

/// Whether a permission set grants `action` on `subject`. The `"all"` subject
/// matches any subject, and `manage` satisfies any action
fn is_allowed(rules: &[PermissionRule], subject: &str, action: &str) -> bool {
    rules.iter().any(|rule| {
        (rule.subject == subject || rule.subject == "all")
            && rule
                .action
                .iter()
                .any(|granted| granted == action || granted == "manage")
    })
}
