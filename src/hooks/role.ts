import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { HAS_PERMISSION_GLOBALLY } from "../apollo/client/queries";
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

  return [hasPermission, !hasPermissionRes.data];
};
