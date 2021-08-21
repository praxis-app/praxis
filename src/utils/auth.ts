import axios from "axios";
import { LocalStorage } from "../constants/common";

const setAuthToken = (token: any) => {
  if (token) axios.defaults.headers.common.Authorization = token;
  else delete axios.defaults.headers.common.Authorization;
};

const isAuthenticated = (currentUser: CurrentUser | undefined): boolean => {
  return (
    typeof currentUser !== "undefined" &&
    typeof localStorage !== "undefined" &&
    currentUser.isAuthenticated &&
    localStorage.getItem(LocalStorage.JwtToken) !== null
  );
};

export { setAuthToken, isAuthenticated };
