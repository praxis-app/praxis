import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type DeleteServerInviteMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type DeleteServerInviteMutation = {
  __typename?: 'Mutation';
  deleteServerInvite: boolean;
};

export const DeleteServerInviteDocument = gql`
  mutation DeleteServerInvite($id: Int!) {
    deleteServerInvite(id: $id)
  }
`;
export type DeleteServerInviteMutationFn = Apollo.MutationFunction<
  DeleteServerInviteMutation,
  DeleteServerInviteMutationVariables
>;

/**
 * __useDeleteServerInviteMutation__
 *
 * To run a mutation, you first call `useDeleteServerInviteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteServerInviteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteServerInviteMutation, { data, loading, error }] = useDeleteServerInviteMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteServerInviteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteServerInviteMutation,
    DeleteServerInviteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteServerInviteMutation,
    DeleteServerInviteMutationVariables
  >(DeleteServerInviteDocument, options);
}
export type DeleteServerInviteMutationHookResult = ReturnType<
  typeof useDeleteServerInviteMutation
>;
export type DeleteServerInviteMutationResult =
  Apollo.MutationResult<DeleteServerInviteMutation>;
export type DeleteServerInviteMutationOptions = Apollo.BaseMutationOptions<
  DeleteServerInviteMutation,
  DeleteServerInviteMutationVariables
>;
