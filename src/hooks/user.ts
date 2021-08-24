import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import jwtDecode from "jwt-decode";
import Router from "next/router";

import {
  generateRandom,
  isAuthenticated,
  noCache,
  setAuthToken,
} from "../utils/clientIndex";
import { CURRENT_USER, USER, USERS } from "../apollo/client/queries";
import { LOGOUT_USER, SET_CURRENT_USER } from "../apollo/client/mutations";
import { navKeyVar } from "../apollo/client/localState";

export const useCurrentUser = (): CurrentUser | undefined => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const currentUserRes = useQuery(CURRENT_USER);
  const result = isAuthenticated(currentUser) ? currentUser : undefined;

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  useEffect(() => {
    navKeyVar(generateRandom());
  }, [result]);

  return result;
};

export const useRestoreUserSession = () => {
  const [setCurrentUser] = useMutation(SET_CURRENT_USER);
  const [logoutUser] = useMutation(LOGOUT_USER);

  useEffect(() => {
    if (localStorage.jwtToken) {
      setAuthToken(localStorage.jwtToken);
      const decoded: User = jwtDecode(localStorage.jwtToken);
      setCurrentUserMutate(decoded);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        logoutUserMutate();
      }
    }
  }, []);

  const setCurrentUserMutate = async (user: User) => {
    await setCurrentUser({
      variables: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  };

  const logoutUserMutate = async () => {
    await logoutUser();
    Router.push("/users/login");
  };
};

// TODO: Convert return type to an array: [user, setUser, loading]
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

export const useAllUsers = (): [User[], (users: User[]) => void, boolean] => {
  const [users, setUsers] = useState<User[]>([]);
  const usersRes = useQuery(USERS, noCache);

  useEffect(() => {
    if (usersRes.data) setUsers(usersRes.data.allUsers);
  }, [usersRes.data]);

  return [users, setUsers, !usersRes.data];
};
