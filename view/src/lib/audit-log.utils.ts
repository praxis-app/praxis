import {
  getInstancePermissionValues,
  getPermissionText,
  getServerPermissionValues,
} from '@/lib/role.utils';
import {
  type AbilityAction,
  type InstancePermission,
  type InstancePermissionKeys,
  type ServerPermission,
  type ServerPermissionKeys,
} from '@/types/role.types';
import translation from '@/locales/en.json';
import { t } from 'i18next';

export type AuditPermissionScope = 'server' | 'instance';

const FULL_ACCESS_PERMISSION = 'fullAccess';

type AuditPermissionName =
  | ServerPermissionKeys
  | InstancePermissionKeys
  | typeof FULL_ACCESS_PERMISSION;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const PERMISSIONS_KEY = 'permissions';
const MEMBER_KEYS = ['members', 'memberIds'];

type ChangeType = 'add' | 'remove';

export interface AuditMember {
  id: string;
  name: string;
}

export interface AuditFieldChange {
  key: string;
  before: unknown;
  after: unknown;
  hasBefore: boolean;
  hasAfter: boolean;
}

const parsePermissionRules = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isRecord).map((rule) => ({
    subject: String(rule.subject),
    action: (Array.isArray(rule.action)
      ? rule.action.map(String)
      : [String(rule.action)]) as AbilityAction[],
  }));
};

const getGrantedPermissionNames = (
  value: unknown,
  scope: AuditPermissionScope,
): AuditPermissionName[] => {
  const rules = parsePermissionRules(value);
  if (
    rules.some(
      (rule) => rule.subject === 'all' && rule.action.includes('manage'),
    )
  ) {
    return [FULL_ACCESS_PERMISSION];
  }
  const permissionValues =
    scope === 'instance'
      ? getInstancePermissionValues(rules as InstancePermission[])
      : getServerPermissionValues(rules as ServerPermission[]);
  return permissionValues
    .filter((permission) => permission.value)
    .map((permission) => permission.name);
};

export const getAuditPermissionLabel = (name: AuditPermissionName) =>
  name === FULL_ACCESS_PERMISSION
    ? t('auditLog.permissions.fullAccess')
    : getPermissionText(name).displayName;

const parseMembers = (value: unknown): AuditMember[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((member) =>
    isRecord(member)
      ? { id: String(member.id), name: String(member.name) }
      : { id: String(member), name: t('auditLog.origins.unknownActor') },
  );
};

const diffBy = <T>(
  before: T[],
  after: T[],
  getKey: (item: T) => string,
): { item: T; changeType: ChangeType }[] => {
  const beforeKeys = new Set(before.map(getKey));
  const afterKeys = new Set(after.map(getKey));
  return [
    ...after
      .filter((item) => !beforeKeys.has(getKey(item)))
      .map((item) => ({ item, changeType: 'add' as const })),
    ...before
      .filter((item) => !afterKeys.has(getKey(item)))
      .map((item) => ({ item, changeType: 'remove' as const })),
  ];
};

export const getAuditChanges = (
  beforeValue: unknown,
  afterValue: unknown,
  scope: AuditPermissionScope,
) => {
  const before = isRecord(beforeValue) ? beforeValue : null;
  const after = isRecord(afterValue) ? afterValue : null;
  const keys = Array.from(
    new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]),
  );
  const getMembers = (record: Record<string, unknown> | null) =>
    MEMBER_KEYS.flatMap((key) => parseMembers(record?.[key]));

  const permissions = diffBy(
    getGrantedPermissionNames(before?.[PERMISSIONS_KEY], scope),
    getGrantedPermissionNames(after?.[PERMISSIONS_KEY], scope),
    (name) => name,
  ).map(({ item, changeType }) => ({ name: item, changeType }));

  const members = diffBy(
    getMembers(before),
    getMembers(after),
    (member) => member.id,
  ).map(({ item, changeType }) => ({ member: item, changeType }));

  const fields: AuditFieldChange[] = keys
    .filter((key) => key !== PERMISSIONS_KEY && !MEMBER_KEYS.includes(key))
    .map((key) => ({
      key,
      before: before?.[key],
      after: after?.[key],
      hasBefore: !!before,
      hasAfter: !!after,
    }))
    .filter((field) => {
      if (field.hasBefore && field.hasAfter) {
        return JSON.stringify(field.before) !== JSON.stringify(field.after);
      }
      const value = field.hasAfter ? field.after : field.before;
      return value !== null && value !== undefined && value !== '';
    });

  return {
    fields,
    permissions,
    members,
    count: fields.length + permissions.length + members.length,
  };
};

export const getAuditFieldLabel = (key: string) => {
  if (key in translation.auditLog.fields) {
    return t(
      `auditLog.fields.${key as keyof typeof translation.auditLog.fields}`,
    );
  }
  if (key in translation.settings.names) {
    return t(
      `settings.names.${key as keyof typeof translation.settings.names}`,
    );
  }
  return key;
};
