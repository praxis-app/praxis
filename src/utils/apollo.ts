import {
  ApolloError,
  LazyQueryHookOptions,
  OperationVariables,
} from "@apollo/client";
import { toastVar } from "../apollo/client/localState";
import { ToastStatus } from "../constants/common";

export const errorToast = (error: unknown) => {
  toastVar({
    title: (error as ApolloError).graphQLErrors[0].message,
    status: ToastStatus.Error,
  });
};

export const noCache: LazyQueryHookOptions<any, OperationVariables> = {
  fetchPolicy: "no-cache",
};
