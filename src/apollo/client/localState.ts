import { makeVar } from "@apollo/client";
import {
  FocusTargets,
  FormToggleState,
  INITIAL_FEED_STATE,
  INITIAL_PAGINATION_STATE,
  ModalOpenState,
  ToastNotification,
  LocalStorage,
  TypeNames,
} from "../../constants/common";
import { setAuthToken } from "../../utils/auth";

export const motionVar = makeVar<Motion | null>(null);
export const votesVar = makeVar<Vote[]>([]);
export const navKeyVar = makeVar<string>("");
export const navOpenVar = makeVar<boolean>(false);
export const modalOpenVar = makeVar<ModalOpenState>("");
export const tabVar = makeVar<number | null>(null);
export const formToggleVar = makeVar<FormToggleState>("");
export const breadcrumbsVar = makeVar<Breadcrumb[]>([]);
export const toastVar = makeVar<ToastNotification | null>(null);
export const focusVar = makeVar<FocusTargets>(FocusTargets.None);
export const feedVar = makeVar<FeedState>(INITIAL_FEED_STATE);
export const paginationVar = makeVar<PaginationState>(INITIAL_PAGINATION_STATE);

export const defaults = {
  user: { isAuthenticated: false, __typename: TypeNames.CurrentUser },
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
          __typename: TypeNames.CurrentUser,
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
          __typename: TypeNames.CurrentUser,
        },
      };
      cache.writeData({ data });
      localStorage.removeItem(LocalStorage.JwtToken);
      setAuthToken(false);
      return data;
    },
  },
};
