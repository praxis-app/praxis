import { type ForcedSubject, type MongoAbility } from '@casl/ability';
import {
  ABILITY_ACTIONS,
  INSTANCE_ROLE_ABILITY_SUBJECTS,
  INSTANCE_PERMISSION_KEYS,
  SERVER_ROLE_ABILITY_SUBJECTS,
  SERVER_PERMISSION_KEYS,
} from '../constants/role.constants';
import { type UserRes } from './user.types';

export type AbilityAction = (typeof ABILITY_ACTIONS)[number];
export type ServerAbilitySubject =
  (typeof SERVER_ROLE_ABILITY_SUBJECTS)[number];
export type InstanceAbilitySubject =
  (typeof INSTANCE_ROLE_ABILITY_SUBJECTS)[number];

export type ServerAbilities = [
  AbilityAction,
  ServerAbilitySubject | ForcedSubject<Exclude<ServerAbilitySubject, 'all'>>,
];

export type ServerAbility = MongoAbility<ServerAbilities>;

export type InstanceAbilities = [
  AbilityAction,
  (
    | InstanceAbilitySubject
    | ForcedSubject<Exclude<InstanceAbilitySubject, 'all'>>
  ),
];

export type InstanceAbility = MongoAbility<InstanceAbilities>;

export type ServerPermissionKeys = (typeof SERVER_PERMISSION_KEYS)[number];
export type InstancePermissionKeys = (typeof INSTANCE_PERMISSION_KEYS)[number];

export interface ServerPermission {
  subject: ServerAbilitySubject;
  action: AbilityAction[];
}

export interface InstancePermission {
  subject: InstanceAbilitySubject;
  action: AbilityAction[];
}

// -------------------------------------------------------------------------
// Requests
// -------------------------------------------------------------------------

export interface CreateRoleReq {
  name: string;
  color: string;
}

export interface UpdateServerRolePermissionsReq {
  permissions: ServerPermission[];
}

export interface UpdateInstanceRolePermissionsReq {
  permissions: InstancePermission[];
}

// -------------------------------------------------------------------------
// Responses
// -------------------------------------------------------------------------

export interface ServerRoleRes {
  id: string;
  name: string;
  color: string;
  permissions: ServerPermission[];
  memberCount: number;
  members: UserRes[];
}

export interface InstanceRoleRes {
  id: string;
  name: string;
  color: string;
  permissions: InstancePermission[];
  memberCount: number;
  members: UserRes[];
}
