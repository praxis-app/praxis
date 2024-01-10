import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type DeleteNotificationMutationVariables = Types.Exact<{
  id: Types.Scalars['Int']['input'];
}>;

export type DeleteNotificationMutation = {
  __typename?: 'Mutation';
  deleteNotification: boolean;
};

export const DeleteNotificationDocument = gql`
  mutation DeleteNotification($id: Int!) {
    deleteNotification(id: $id)
  }
`;
export type DeleteNotificationMutationFn = Apollo.MutationFunction<
  DeleteNotificationMutation,
  DeleteNotificationMutationVariables
>;

/**
 * __useDeleteNotificationMutation__
 *
 * To run a mutation, you first call `useDeleteNotificationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteNotificationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteNotificationMutation, { data, loading, error }] = useDeleteNotificationMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteNotificationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteNotificationMutation,
    DeleteNotificationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteNotificationMutation,
    DeleteNotificationMutationVariables
  >(DeleteNotificationDocument, options);
}
export type DeleteNotificationMutationHookResult = ReturnType<
  typeof useDeleteNotificationMutation
>;
export type DeleteNotificationMutationResult =
  Apollo.MutationResult<DeleteNotificationMutation>;
export type DeleteNotificationMutationOptions = Apollo.BaseMutationOptions<
  DeleteNotificationMutation,
  DeleteNotificationMutationVariables
>;
