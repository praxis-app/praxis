use entity::users;
use sea_orm::prelude::Uuid;

#[derive(Debug, Clone)]
pub(crate) struct UserRecord {
    pub(crate) id: Uuid,
    pub(crate) email: Option<String>,
    pub(crate) name: String,
    pub(crate) display_name: Option<String>,
    pub(crate) password_hash: Option<String>,
    pub(crate) anonymous: bool,
}

impl From<users::Model> for UserRecord {
    fn from(user: users::Model) -> Self {
        Self {
            id: user.id,
            email: user.email,
            name: user.name,
            display_name: user.display_name,
            password_hash: user.password,
            anonymous: user.anonymous,
        }
    }
}
