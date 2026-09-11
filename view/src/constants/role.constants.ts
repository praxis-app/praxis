export const ABILITY_ACTIONS = [
  'delete',
  'create',
  'read',
  'update',
  'manage',
] as const;

export const SERVER_ROLE_ABILITY_SUBJECTS = [
  'ServerConfig',
  'Channel',
  'Invite',
  'Message',
  'ServerRole',
  'ProposalBlock',
  'all',
] as const;

export const INSTANCE_ROLE_ABILITY_SUBJECTS = [
  'InstanceConfig',
  'InstanceRole',
  'Server',
  'all',
] as const;

export const DEFAULT_ROLE_COLOR = '#f44336';
export const ADMIN_ROLE_NAME = 'admin';

export const SERVER_PERMISSION_KEYS = [
  'manageChannels',
  'manageServerSettings',
  'createInvites',
  'manageInvites',
  'manageServerRoles',
  'blockProposals',
] as const;

export const INSTANCE_PERMISSION_KEYS = [
  'manageInstanceSettings',
  'manageInstanceRoles',
  'manageServers',
] as const;

export const ROLE_COLOR_OPTIONS = [
  '#f44336',
  '#e91e63',
  '#9c27b0',
  '#673ab7',
  '#3f51b5',
  '#2196f3',
  '#03a9f4',
  '#00bcd4',
  '#009688',
  '#4caf50',
  '#8bc34a',
  '#cddc39',
  '#ffeb3b',
  '#ffc107',
  '#ff9800',
  '#ff5722',
  '#795548',
  '#607d8b',
];
