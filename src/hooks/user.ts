import { useState, useEffect } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
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
import { NavigationPaths } from "../constants/common";

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
      const decoded: ClientUser = jwtDecode(localStorage.jwtToken);
      setCurrentUserMutate(decoded);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        logoutUserMutate();
      }
    }
  }, []);

  const setCurrentUserMutate = async (user: ClientUser) => {
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
    Router.push(NavigationPaths.LogIn);
  };
};

// TODO: Convert return type to an array: [user, setUser, loading]
export const useUserById = (id: string | undefined): ClientUser | undefined => {
  const [user, setUser] = useState<ClientUser>();
  const [getUserRes, userRes] = useLazyQuery(USER, noCache);

  useEffect(() => {
    if (id)
      getUserRes({
        variables: { id },
      });
  }, [id]);

  useEffect(() => {
    if (userRes.data) setUser(userRes.data.user);
  }, [userRes.data]);

  return user;
};

export const useAllUsers = (
  greenLight = true,
  callDep?: any
): [ClientUser[], (users: ClientUser[]) => void, boolean] => {
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [getUsersRes, usersRes] = useLazyQuery(USERS, noCache);

  useEffect(() => {
    if (greenLight) getUsersRes();
  }, [greenLight, JSON.stringify(callDep)]);

  useEffect(() => {
    if (usersRes.data) setUsers(usersRes.data.allUsers);
  }, [usersRes.data]);

  return [users, setUsers, usersRes.loading];
};
