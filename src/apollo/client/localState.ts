import { setAuthToken } from "../../utils/auth";

export const defaults = {
  user: { isAuthenticated: false, __typename: "CurrentUser" },
};

export const resolvers = {
  Mutation: {
    setCurrentUser: (_: any, { user }, { cache }) => {
      user.id = user.id.toString();
      const data = {
        user: { ...user, isAuthenticated: true, __typename: "CurrentUser" },
      };
      cache.writeData({ data });
      return data;
    },

    logoutUser: (_: any, variables: any, { cache }) => {
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
