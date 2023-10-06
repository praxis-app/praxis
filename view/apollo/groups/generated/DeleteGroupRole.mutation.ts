import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type DeleteGroupRoleMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type DeleteGroupRoleMutation = {
  __typename?: 'Mutation';
  deleteGroupRole: boolean;
};

export const DeleteGroupRoleDocument = gql`
  mutation DeleteGroupRole($id: Int!) {
    deleteGroupRole(id: $id)
  }
`;
export type DeleteGroupRoleMutationFn = Apollo.MutationFunction<
  DeleteGroupRoleMutation,
  DeleteGroupRoleMutationVariables
>;

/**
 * __useDeleteGroupRoleMutation__
 *
 * To run a mutation, you first call `useDeleteGroupRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGroupRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGroupRoleMutation, { data, loading, error }] = useDeleteGroupRoleMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteGroupRoleMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteGroupRoleMutation,
    DeleteGroupRoleMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteGroupRoleMutation,
    DeleteGroupRoleMutationVariables
  >(DeleteGroupRoleDocument, options);
}
export type DeleteGroupRoleMutationHookResult = ReturnType<
  typeof useDeleteGroupRoleMutation
>;
export type DeleteGroupRoleMutationResult =
  Apollo.MutationResult<DeleteGroupRoleMutation>;
export type DeleteGroupRoleMutationOptions = Apollo.BaseMutationOptions<
  DeleteGroupRoleMutation,
  DeleteGroupRoleMutationVariables
>;
