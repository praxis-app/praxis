use axum::{
    routing::{delete, get, post, put},
    Router,
};
use sea_orm::DatabaseConnection;

use super::handlers::{
    add_instance_role_members, create_instance_role, delete_instance_role,
    get_instance_role, get_instance_roles,
    get_users_eligible_for_instance_role, remove_instance_role_member,
    update_instance_role, update_instance_role_permissions, InstanceRolesState,
};

pub(crate) fn router(
    database: DatabaseConnection,
    jwt_secret: String,
) -> Router {
    Router::new()
        .route("/", get(get_instance_roles))
        .route("/", post(create_instance_role))
        .route("/{instanceRoleId}", get(get_instance_role))
        .route("/{instanceRoleId}", put(update_instance_role))
        .route("/{instanceRoleId}", delete(delete_instance_role))
        .route(
            "/{instanceRoleId}/permissions",
            put(update_instance_role_permissions),
        )
        .route("/{instanceRoleId}/members", post(add_instance_role_members))
        .route(
            "/{instanceRoleId}/members/eligible",
            get(get_users_eligible_for_instance_role),
        )
        .route(
            "/{instanceRoleId}/members/{userId}",
            delete(remove_instance_role_member),
        )
        .with_state(InstanceRolesState::new(database, jwt_secret))
}
