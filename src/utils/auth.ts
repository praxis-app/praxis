import axios from "axios";
import { Common } from "../constants";

const setAuthToken = (token: any) => {
  if (token) axios.defaults.headers.common.Authorization = token;
  else delete axios.defaults.headers.common.Authorization;
};

const isLoggedIn = (currentUser: CurrentUser | undefined): boolean => {
  return (
    typeof currentUser !== "undefined" &&
    typeof localStorage !== "undefined" &&
    currentUser.isAuthenticated &&
    localStorage.getItem(Common.LocalStorage.JwtToken) !== null
  );
};

export { setAuthToken, isLoggedIn };
