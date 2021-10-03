import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import {
  HAS_PERMISSION_BY_GROUP_ID,
  HAS_PERMISSION_GLOBALLY,
  PERMISSIONS_BY_ROLE_ID,
  ROLES_BY_GROUP_ID,
  ROLE_MEMBERS,
} from "../apollo/client/queries";
import { noCache } from "../utils/apollo";
import { useCurrentUser } from "./user";

export const usePermissionsByRoleId = (
  roleId: string | string[] | undefined,
  greenLight = true,
  callDep?: any
): [ClientPermission[], (permissions: ClientPermission[]) => void, boolean] => {
  const [permissions, setPermissions] = useState<ClientPermission[]>([]);
  const [getPermissionsRes, permissionsRes] = useLazyQuery(
    PERMISSIONS_BY_ROLE_ID,
    noCache
  );

  useEffect(() => {
    if (roleId && greenLight) {
      getPermissionsRes({
        variables: {
          roleId,
        },
      });
    }
  }, [roleId, greenLight, callDep]);

  useEffect(() => {
    if (permissionsRes.data)
      setPermissions(permissionsRes.data.permissionsByRoleId);
  }, [permissionsRes.data]);

  return [permissions, setPermissions, permissionsRes.loading];
};

export const useMembersByRoleId = (
  roleId: string | string[] | undefined,
  greenLight = true,
  callDep?: any
): [ClientRoleMember[], (members: ClientRoleMember[]) => void, boolean] => {
  const [members, setMembers] = useState<ClientRoleMember[]>([]);
  const [getMembersRes, membersRes] = useLazyQuery(ROLE_MEMBERS, noCache);

  useEffect(() => {
    if (roleId && greenLight) {
      getMembersRes({
        variables: {
          roleId,
        },
      });
    }
  }, [roleId, greenLight, callDep]);

  useEffect(() => {
    if (membersRes.data) setMembers(membersRes.data.roleMembers);
  }, [membersRes.data]);

  return [members, setMembers, membersRes.loading];
};

export const useRolesByGroupId = (
  groupId: string | string[] | undefined,
  greenLight = true,
  callDep?: any
): [ClientRole[], (roles: ClientRole[]) => void, boolean] => {
  const [roles, setRoles] = useState<ClientRole[]>([]);
  const [getRolesRes, rolesRes] = useLazyQuery(ROLES_BY_GROUP_ID, noCache);

  useEffect(() => {
    if (groupId && greenLight) {
      getRolesRes({
        variables: {
          groupId,
        },
      });
    }
  }, [groupId, greenLight, callDep]);

  useEffect(() => {
    if (rolesRes.data) setRoles(rolesRes.data.rolesByGroupId);
  }, [rolesRes.data]);

  return [roles, setRoles, rolesRes.loading];
};

export const useHasPermissionGlobally = (
  name: string,
  callDep?: any
): boolean[] => {
  const userId = useCurrentUser()?.id;
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [getHasPermissionRes, hasPermissionRes] = useLazyQuery(
    HAS_PERMISSION_GLOBALLY,
    noCache
  );

  useEffect(() => {
    if (userId)
      getHasPermissionRes({
        variables: {
          name,
          userId,
        },
      });
    else setHasPermission(false);
  }, [userId, JSON.stringify(callDep)]);

  useEffect(() => {
    if (hasPermissionRes.data)
      setHasPermission(hasPermissionRes.data.hasPermissionGlobally);
  }, [hasPermissionRes.data]);

  return [hasPermission, hasPermissionRes.loading];
};

export const useHasPermissionByGroupId = (
  name: string,
  groupId: string | undefined,
  callDep?: any
): boolean[] => {
  const userId = useCurrentUser()?.id;
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [getHasPermissionRes, hasPermissionRes] = useLazyQuery(
    HAS_PERMISSION_BY_GROUP_ID,
    noCache
  );

  useEffect(() => {
    if (userId && groupId)
      getHasPermissionRes({
        variables: {
          name,
          userId,
          groupId,
        },
      });
    else setHasPermission(false);
  }, [userId, groupId, JSON.stringify(callDep)]);

  useEffect(() => {
    if (hasPermissionRes.data)
      setHasPermission(hasPermissionRes.data.hasPermissionByGroupId);
  }, [hasPermissionRes.data]);

  return [hasPermission, hasPermissionRes.loading];
};
