import {
  INSTANCE_PERMISSION_KEYS,
  SERVER_PERMISSION_KEYS,
} from '@/constants/role.constants';
import { t } from 'i18next';
import { type Namespace, type TFunction } from 'react-i18next';
import {
  type InstanceAbility,
  type InstancePermission,
  type InstancePermissionKeys,
  type ServerAbility,
  type ServerPermission,
  type ServerPermissionKeys,
} from '../types/role.types';

export const getSettingsAccess = (
  serverAbility: ServerAbility,
  instanceAbility: InstanceAbility,
) => {
  const canManageServerSettings = serverAbility.can('manage', 'ServerConfig');
  const canManageServerRoles = serverAbility.can('manage', 'ServerRole');
  const canManageInstanceRoles = instanceAbility.can('manage', 'InstanceRole');
  const canManageServers = instanceAbility.can('manage', 'Server');

  const canAccessInvites =
    serverAbility.can('create', 'Invite') ||
    serverAbility.can('manage', 'Invite');

  const hasServerSettingsAccess =
    canManageServerSettings || canManageServerRoles || canAccessInvites;
  const hasInstanceSettingsAccess = canManageInstanceRoles || canManageServers;

  return {
    canAccessInvites,
    canManageInstanceRoles,
    canManageServers,
    canManageServerRoles,
    canManageServerSettings,
    hasInstanceSettingsAccess,
    hasServerSettingsAccess,
    hasSettingsAccess: hasServerSettingsAccess || hasInstanceSettingsAccess,
  };
};

export const getServerPermissionValues = (permissions: ServerPermission[]) =>
  SERVER_PERMISSION_KEYS.map((name) => {
    if (name === 'manageChannels') {
      return {
        value: permissions.some(
          (p) => p.subject === 'Channel' && p.action.includes('manage'),
        ),
        name,
      };
    }
    if (name === 'manageServerSettings') {
      return {
        value: permissions.some(
          (p) => p.subject === 'ServerConfig' && p.action.includes('manage'),
        ),
        name,
      };
    }
    if (name === 'manageServerRoles') {
      return {
        value: permissions.some(
          (p) => p.subject === 'ServerRole' && p.action.includes('manage'),
        ),
        name,
      };
    }
    if (name === 'createInvites') {
      return {
        value: permissions.some(
          (p) => p.subject === 'Invite' && p.action.includes('create'),
        ),
        name,
      };
    }
    if (name === 'manageInvites') {
      return {
        value: permissions.some(
          (p) => p.subject === 'Invite' && p.action.includes('manage'),
        ),
        name,
      };
    }
    if (name === 'blockProposals') {
      return {
        value: permissions.some(
          (p) => p.subject === 'ProposalBlock' && p.action.includes('create'),
        ),
        name,
      };
    }
    return {
      value: false,
      name,
    };
  });

export const getInstancePermissionValues = (
  permissions: InstancePermission[],
) =>
  INSTANCE_PERMISSION_KEYS.map((name) => {
    if (name === 'manageInstanceSettings') {
      return {
        value: permissions.some(
          (p) => p.subject === 'InstanceConfig' && p.action.includes('manage'),
        ),
        name,
      };
    }
    if (name === 'manageInstanceRoles') {
      return {
        value: permissions.some(
          (p) => p.subject === 'InstanceRole' && p.action.includes('manage'),
        ),
        name,
      };
    }
    if (name === 'manageServers') {
      return {
        value: permissions.some(
          (p) => p.subject === 'Server' && p.action.includes('manage'),
        ),
        name,
      };
    }
    return {
      value: false,
      name,
    };
  });

export const getServerPermissionValuesMap = (permissions: ServerPermission[]) =>
  getServerPermissionValues(permissions).reduce<Record<string, boolean>>(
    (result, permission) => {
      result[permission.name] = permission.value;
      return result;
    },
    {},
  );

export const getInstancePermissionValuesMap = (
  permissions: InstancePermission[],
) =>
  getInstancePermissionValues(permissions).reduce<Record<string, boolean>>(
    (result, permission) => {
      result[permission.name] = permission.value;
      return result;
    },
    {},
  );

export const getPermissionText = (
  name: ServerPermissionKeys | InstancePermissionKeys,
) => {
  const _t: TFunction<Namespace<'translation'>, undefined> = t;
  return {
    displayName: _t(`permissions.names.${name}`),
    description: _t(`permissions.descriptions.${name}`),
  };
};
