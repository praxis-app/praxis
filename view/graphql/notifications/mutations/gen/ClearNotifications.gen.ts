import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ClearNotificationMutationVariables = Types.Exact<{
  [key: string]: never;
}>;

export type ClearNotificationMutation = {
  __typename?: 'Mutation';
  clearNotifications: boolean;
};

export const ClearNotificationDocument = gql`
  mutation ClearNotification {
    clearNotifications
  }
`;
export type ClearNotificationMutationFn = Apollo.MutationFunction<
  ClearNotificationMutation,
  ClearNotificationMutationVariables
>;

/**
 * __useClearNotificationMutation__
 *
 * To run a mutation, you first call `useClearNotificationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useClearNotificationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [clearNotificationMutation, { data, loading, error }] = useClearNotificationMutation({
 *   variables: {
 *   },
 * });
 */
export function useClearNotificationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ClearNotificationMutation,
    ClearNotificationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ClearNotificationMutation,
    ClearNotificationMutationVariables
  >(ClearNotificationDocument, options);
}
export type ClearNotificationMutationHookResult = ReturnType<
  typeof useClearNotificationMutation
>;
export type ClearNotificationMutationResult =
  Apollo.MutationResult<ClearNotificationMutation>;
export type ClearNotificationMutationOptions = Apollo.BaseMutationOptions<
  ClearNotificationMutation,
  ClearNotificationMutationVariables
>;
