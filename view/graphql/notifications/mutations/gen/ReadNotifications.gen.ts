import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ReadNotificationsMutationVariables = Types.Exact<{
  [key: string]: never;
}>;

export type ReadNotificationsMutation = {
  __typename?: 'Mutation';
  readNotifications: boolean;
};

export const ReadNotificationsDocument = gql`
  mutation ReadNotifications {
    readNotifications
  }
`;
export type ReadNotificationsMutationFn = Apollo.MutationFunction<
  ReadNotificationsMutation,
  ReadNotificationsMutationVariables
>;

/**
 * __useReadNotificationsMutation__
 *
 * To run a mutation, you first call `useReadNotificationsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReadNotificationsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [readNotificationsMutation, { data, loading, error }] = useReadNotificationsMutation({
 *   variables: {
 *   },
 * });
 */
export function useReadNotificationsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ReadNotificationsMutation,
    ReadNotificationsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ReadNotificationsMutation,
    ReadNotificationsMutationVariables
  >(ReadNotificationsDocument, options);
}
export type ReadNotificationsMutationHookResult = ReturnType<
  typeof useReadNotificationsMutation
>;
export type ReadNotificationsMutationResult =
  Apollo.MutationResult<ReadNotificationsMutation>;
export type ReadNotificationsMutationOptions = Apollo.BaseMutationOptions<
  ReadNotificationsMutation,
  ReadNotificationsMutationVariables
>;
