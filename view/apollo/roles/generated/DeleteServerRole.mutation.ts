import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type DeleteServerRoleMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type DeleteServerRoleMutation = {
  __typename?: 'Mutation';
  deleteServerRole: boolean;
};

export const DeleteServerRoleDocument = gql`
  mutation DeleteServerRole($id: Int!) {
    deleteServerRole(id: $id)
  }
`;
export type DeleteServerRoleMutationFn = Apollo.MutationFunction<
  DeleteServerRoleMutation,
  DeleteServerRoleMutationVariables
>;

/**
 * __useDeleteServerRoleMutation__
 *
 * To run a mutation, you first call `useDeleteServerRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteServerRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteServerRoleMutation, { data, loading, error }] = useDeleteServerRoleMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteServerRoleMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteServerRoleMutation,
    DeleteServerRoleMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteServerRoleMutation,
    DeleteServerRoleMutationVariables
  >(DeleteServerRoleDocument, options);
}
export type DeleteServerRoleMutationHookResult = ReturnType<
  typeof useDeleteServerRoleMutation
>;
export type DeleteServerRoleMutationResult =
  Apollo.MutationResult<DeleteServerRoleMutation>;
export type DeleteServerRoleMutationOptions = Apollo.BaseMutationOptions<
  DeleteServerRoleMutation,
  DeleteServerRoleMutationVariables
>;
