import axios from "axios";

const setAuthToken = (token: any) => {
  if (token) {
    axios.defaults.headers.common.Authorization = token;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

const isLoggedIn = () => {
  return localStorage.getItem("jwtToken") !== null;
};

export { setAuthToken, isLoggedIn };
