import { LazyQueryHookOptions, OperationVariables } from "@apollo/client";

export const noCache: LazyQueryHookOptions<any, OperationVariables> = {
  fetchPolicy: "no-cache",
};
