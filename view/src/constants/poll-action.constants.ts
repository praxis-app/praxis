/**
 * NOTE: The order of action types for `POLL_ACTION_TYPE` determines the
 * order of action types in the select input in the create poll form
 */
export const POLL_ACTION_TYPE = [
  'general',
  'change-settings',
  'change-role',
  'create-role',
  'plan-event',
  'test',
] as const;

export const ROLE_ATTRIBUTE_CHANGE_TYPE = ['add', 'remove'] as const;
