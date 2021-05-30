import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { CURRENT_USER, USER } from "../apollo/client/queries";
import { noCache } from "../utils/apollo";
import { isAuthenticated } from "../utils/auth";

export const useCurrentUser = (): CurrentUser | undefined => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const currentUserRes = useQuery(CURRENT_USER);

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  return isAuthenticated(currentUser) ? currentUser : undefined;
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
