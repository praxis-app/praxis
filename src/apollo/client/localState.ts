import { setAuthToken } from "../../utils/auth";

export const defaults = {
  user: { isAuthenticated: false, __typename: "CurrentUser" },
};

export const resolvers = {
  Mutation: {
    setCurrentUser: (_, { user }, { cache }) => {
      const data = {
        user: { ...user, isAuthenticated: true, __typename: "CurrentUser" },
      };
      cache.writeData({ data });
      return data;
    },

    logoutUser: (_, variables, { cache }) => {
      const data = {
        user: {
          id: null,
          name: null,
          email: null,
          isAuthenticated: false,
          __typename: "CurrentUser",
        },
      };
      cache.writeData({ data });
      localStorage.removeItem("jwtToken");
      setAuthToken(false);
      return data;
    },
  },
};
