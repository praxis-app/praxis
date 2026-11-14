import { type AUDIT_LOG_ACTIONS } from '@/constants/moderation.constants';
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

export interface AccountModerationStateRes {
  locked: boolean;
  deletedAt: string | null;
  canBeModerated: boolean;
}

export interface MemberModerationStateRes {
  isMember: boolean;
  isBanned: boolean;
  canBeModerated: boolean;
}

export interface UserModerationRes {
  account?: AccountModerationStateRes;
  server?: MemberModerationStateRes;
}

export interface InstanceUsersRes {
  users: InstanceUserRes[];
  nextCursor: string | null;
  hasMore: boolean;
}

export type AuditLogScope = 'instance' | 'server';
export type AuditLogAction = (typeof AUDIT_LOG_ACTIONS)[number];
export type AuditLogTargetKind =
  | 'message'
  | 'forum_post'
  | 'poll'
  | 'user'
  | 'call'
  | 'server'
  | 'server_config'
  | 'server_role'
  | 'instance_role'
  | 'invite';

export interface AuditLogFilters {
  actorId?: string;
  targetKind?: AuditLogTargetKind;
  search?: string;
  searchActions?: string;
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
