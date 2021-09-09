import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { FOLLOWERS } from "../apollo/client/queries";
import { noCache } from "../utils/apollo";

export const useFollowersByUserId = (
  userId: string | undefined,
  callDep?: any
): [ClientFollow[], (followers: ClientFollow[]) => void, boolean] => {
  const [followers, setFollowers] = useState<ClientFollow[]>([]);
  const [getFollowersRes, followersRes] = useLazyQuery(FOLLOWERS, noCache);

  useEffect(() => {
    if (userId)
      getFollowersRes({
        variables: {
          userId,
        },
      });
  }, [userId, JSON.stringify(callDep)]);

  useEffect(() => {
    if (followersRes.data) setFollowers(followersRes.data.userFollowers);
  }, [followersRes.data]);

  return [followers, setFollowers, !followersRes.data];
};
