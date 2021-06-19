import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";

import { CURRENT_USER, USER } from "../apollo/client/queries";
import { noCache } from "../utils/apollo";
import { isAuthenticated } from "../utils/auth";
import { randomKey } from "../utils/common";
import { headerKeyVar } from "../apollo/client/localState";

export const useCurrentUser = (): CurrentUser | undefined => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const currentUserRes = useQuery(CURRENT_USER);
  const result = isAuthenticated(currentUser) ? currentUser : undefined;

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  useEffect(() => {
    headerKeyVar(randomKey());
  }, [result]);

  return result;
};

export const useUserById = (id: string): User | undefined => {
  const [user, setUser] = useState<User>();
  const userRes = useQuery(USER, {
    variables: { id },
    ...noCache,
  });

  useEffect(() => {
    if (userRes.data) setUser(userRes.data.user);
  }, [userRes.data]);

  return user;
};
