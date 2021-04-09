import axios from "axios";

const setAuthToken = (token: any) => {
  if (token) {
    axios.defaults.headers.common.Authorization = token;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

const isLoggedIn = (currentUser: CurrentUser | undefined): boolean => {
  return (
    typeof currentUser !== "undefined" &&
    typeof localStorage !== "undefined" &&
    localStorage.getItem("jwtToken") !== null
  );
};

export { setAuthToken, isLoggedIn };
