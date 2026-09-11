mod capabilities;
pub(crate) mod instance_roles;
mod routes;
mod service;

pub(crate) use routes::router;
pub(crate) use service::{get_config, get_config_safely, initialize};
