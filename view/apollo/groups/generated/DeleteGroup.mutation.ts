import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type DeleteGroupMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type DeleteGroupMutation = {
  __typename?: 'Mutation';
  deleteGroup: boolean;
};

export const DeleteGroupDocument = gql`
  mutation DeleteGroup($id: Int!) {
    deleteGroup(id: $id)
  }
`;
export type DeleteGroupMutationFn = Apollo.MutationFunction<
  DeleteGroupMutation,
  DeleteGroupMutationVariables
>;

/**
 * __useDeleteGroupMutation__
 *
 * To run a mutation, you first call `useDeleteGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGroupMutation, { data, loading, error }] = useDeleteGroupMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteGroupMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteGroupMutation,
    DeleteGroupMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteGroupMutation, DeleteGroupMutationVariables>(
    DeleteGroupDocument,
    options,
  );
}
export type DeleteGroupMutationHookResult = ReturnType<
  typeof useDeleteGroupMutation
>;
export type DeleteGroupMutationResult =
  Apollo.MutationResult<DeleteGroupMutation>;
export type DeleteGroupMutationOptions = Apollo.BaseMutationOptions<
  DeleteGroupMutation,
  DeleteGroupMutationVariables
>;
