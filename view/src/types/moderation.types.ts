import { type ImageRes } from './image.types';

export interface ModerationReasonReq {
  reason?: string;
}

export interface InstanceUserRes {
  id: string;
  name: string;
  displayName: string | null;
  anonymous: boolean;
  locked: boolean;
  deletedAt: string | null;
  profilePicture: ImageRes | null;
  createdAt: string;
}

export interface InstanceUsersRes {
  users: InstanceUserRes[];
  nextCursor: string | null;
  hasMore: boolean;
}

export type AuditLogScope = 'instance' | 'server';
export type AuditLogAction =
  | 'remove_message'
  | 'remove_forum_post'
  | 'remove_member'
  | 'ban_member'
  | 'unban_member'
  | 'suspend_user'
  | 'restore_user'
  | 'delete_user'
  | 'remove_call_participant'
  | 'end_call'
  | 'create_role'
  | 'update_role'
  | 'update_role_permissions'
  | 'delete_role'
  | 'add_role_members'
  | 'remove_role_member'
  | 'create_server'
  | 'update_server'
  | 'delete_server'
  | 'update_server_config'
  | 'create_invite'
  | 'delete_invite';
export type AuditLogTargetKind =
  | 'message'
  | 'forum_post'
  | 'user'
  | 'call'
  | 'server'
  | 'server_config'
  | 'server_role'
  | 'instance_role'
  | 'invite';

export interface AuditLogFilters {
  action?: AuditLogAction;
  actorId?: string;
  targetKind?: AuditLogTargetKind;
  targetId?: string;
  serverId?: string;
  from?: string;
  to?: string;
}

export interface AuditLogActorRes {
  id: string;
  label: string;
}

export interface AuditLogScopeRes {
  serverId: string | null;
  serverLabel: string | null;
  channelId: string | null;
}

export interface AuditLogEntryRes {
  id: string;
  actor: AuditLogActorRes | null;
  origin: 'direct' | 'proposal' | 'system';
  proposalId: string | null;
  action: AuditLogAction;
  target: {
    kind: AuditLogTargetKind;
    id: string;
    label: string | null;
  };
  scope: AuditLogScopeRes;
  reason: string | null;
  beforeValue: unknown | null;
  afterValue: unknown | null;
  createdAt: string;
  applicationPath: string | null;
  proposalPath: string | null;
}

export interface AuditLogFilterValuesRes {
  actors: AuditLogActorRes[];
  servers: AuditLogScopeRes[];
  actions: AuditLogAction[];
  targetKinds: AuditLogTargetKind[];
}

export interface AuditLogRes {
  entries: AuditLogEntryRes[];
  nextCursor: string | null;
  hasMore: boolean;
  filterValues: AuditLogFilterValuesRes;
}
