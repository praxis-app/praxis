export const MIN_MODERATION_REASON_LENGTH = 4;
export const MAX_MODERATION_REASON_LENGTH = 500;

export const AUDIT_LOG_ACTIONS = [
  'remove_message',
  'remove_forum_post',
  'hide_poll',
  'restore_poll',
  'remove_member',
  'ban_member',
  'unban_member',
  'suspend_user',
  'restore_user',
  'delete_user',
  'remove_call_participant',
  'end_call',
  'create_role',
  'update_role',
  'update_role_permissions',
  'delete_role',
  'add_role_members',
  'remove_role_member',
  'create_server',
  'update_server',
  'delete_server',
  'update_server_config',
  'create_invite',
  'delete_invite',
] as const;
