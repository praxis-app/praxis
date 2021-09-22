import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import {
  HAS_PERMISSION_BY_GROUP_ID,
  HAS_PERMISSION_GLOBALLY,
} from "../apollo/client/queries";
import { noCache } from "../utils/apollo";
import { useCurrentUser } from "./user";

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
