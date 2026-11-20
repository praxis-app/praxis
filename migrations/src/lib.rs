pub use sea_orm_migration::prelude::*;

mod m20260404_110000_create_users;
mod m20260408_000001_create_basic_chat;
mod m20260414_000001_create_roles;
mod m20260416_000001_create_invites;
mod m20260418_000001_add_user_profiles_and_images;
mod m20260419_000001_create_polls;
mod m20260420_000001_add_anonymous_users;
mod m20260505_000001_add_call_conversations;
mod m20260525_000001_preserve_call_decisions;
mod m20260629_000001_add_poll_action_execution;
mod m20260703_000001_add_poll_action_server_configs;
mod m20260715_000001_add_forum_channel_schema;
mod m20260802_000001_add_events;
mod m20260811_000001_drop_unused_image_content_types;
mod m20260814_000001_add_server_images;
mod m20260817_000001_add_channel_sort_order;
mod m20260827_000001_add_poll_reply_threads;
mod m20260829_000001_add_notifications;
mod m20260830_000001_add_restricted_block_votes;
mod m20260901_000001_rename_blocks_restricted;
mod m20260907_000001_add_proposal_and_event_notifications;
mod m20260908_000001_add_channel_member_read_timestamps;
mod m20260923_000001_add_basic_moderation;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20260404_110000_create_users::Migration),
            Box::new(m20260408_000001_create_basic_chat::Migration),
            Box::new(m20260414_000001_create_roles::Migration),
            Box::new(m20260416_000001_create_invites::Migration),
            Box::new(m20260418_000001_add_user_profiles_and_images::Migration),
            Box::new(m20260419_000001_create_polls::Migration),
            Box::new(m20260420_000001_add_anonymous_users::Migration),
            Box::new(m20260505_000001_add_call_conversations::Migration),
            Box::new(m20260525_000001_preserve_call_decisions::Migration),
            Box::new(m20260629_000001_add_poll_action_execution::Migration),
            Box::new(
                m20260703_000001_add_poll_action_server_configs::Migration,
            ),
            Box::new(m20260715_000001_add_forum_channel_schema::Migration),
            Box::new(m20260802_000001_add_events::Migration),
            Box::new(
                m20260811_000001_drop_unused_image_content_types::Migration,
            ),
            Box::new(m20260814_000001_add_server_images::Migration),
            Box::new(m20260817_000001_add_channel_sort_order::Migration),
            Box::new(m20260827_000001_add_poll_reply_threads::Migration),
            Box::new(m20260829_000001_add_notifications::Migration),
            Box::new(m20260830_000001_add_restricted_block_votes::Migration),
            Box::new(m20260901_000001_rename_blocks_restricted::Migration),
            Box::new(
                m20260907_000001_add_proposal_and_event_notifications::Migration,
            ),
            Box::new(
                m20260908_000001_add_channel_member_read_timestamps::Migration,
            ),
            Box::new(m20260923_000001_add_basic_moderation::Migration),
        ]
    }
}
