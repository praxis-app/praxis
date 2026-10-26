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

export const toAuditRecord = (value: unknown) =>
  isRecord(value) ? value : null;

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

export const getGrantedPermissionNames = (
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
