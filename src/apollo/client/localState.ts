import { makeVar } from "@apollo/client";
import { Common } from "../../constants";
import { setAuthToken } from "../../utils/auth";

export const feedVar = makeVar<FeedState>(Common.DEFAULT_FEED_STATE);
export const motionVar = makeVar<Motion | null>(null);
export const votesVar = makeVar<Vote[]>([]);
export const headerKeyVar = makeVar<string>("");
export const breadcrumbsVar = makeVar<Breadcrumb[]>([]);
export const toastVar = makeVar<ToastNotification | null>(null);
// TODO: Set default state for pagination similar to feed state
export const paginationVar = makeVar<PaginationState | null>(null);

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

    logoutUser: (_: any, _variables: any, { cache }: any) => {
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
      localStorage.removeItem(Common.LocalStorage.JwtToken);
      setAuthToken(false);
      return data;
    },
  },
};
