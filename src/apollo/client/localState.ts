import { makeVar } from "@apollo/client";
import { Common } from "../../constants";
import { setAuthToken } from "../../utils/auth";

export const feedItemsVar = makeVar<FeedItem[]>([]);
export const motionVar = makeVar<Motion | null>(null);
export const votesVar = makeVar<Vote[]>([]);

export const defaults = {
  user: { isAuthenticated: false, __typename: Common.TypeNames.CurrentUser },
};

export const resolvers = {
  Mutation: {
    setCurrentUser: (
      _: any,
      { user }: { user: CurrentUser },
      { cache }: any
    ) => {
      user.id = user.id.toString();
      const data = {
        user: {
          ...user,
          isAuthenticated: true,
          __typename: Common.TypeNames.CurrentUser,
        },
      };
      cache.writeData({ data });
      return data;
    },

    logoutUser: (_: any, variables: any, { cache }: any) => {
      const data = {
        user: {
          id: null,
          name: null,
          email: null,
          isAuthenticated: false,
          __typename: Common.TypeNames.CurrentUser,
        },
      };
      cache.writeData({ data });
      localStorage.removeItem("jwtToken");
      setAuthToken(false);
      return data;
    },
  },
};
