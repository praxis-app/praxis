import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type DeleteVoteMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type DeleteVoteMutation = {
  __typename?: 'Mutation';
  deleteVote: boolean;
};

export const DeleteVoteDocument = gql`
  mutation DeleteVote($id: Int!) {
    deleteVote(id: $id)
  }
`;
export type DeleteVoteMutationFn = Apollo.MutationFunction<
  DeleteVoteMutation,
  DeleteVoteMutationVariables
>;

/**
 * __useDeleteVoteMutation__
 *
 * To run a mutation, you first call `useDeleteVoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteVoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteVoteMutation, { data, loading, error }] = useDeleteVoteMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteVoteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteVoteMutation,
    DeleteVoteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteVoteMutation, DeleteVoteMutationVariables>(
    DeleteVoteDocument,
    options,
  );
}
export type DeleteVoteMutationHookResult = ReturnType<
  typeof useDeleteVoteMutation
>;
export type DeleteVoteMutationResult =
  Apollo.MutationResult<DeleteVoteMutation>;
export type DeleteVoteMutationOptions = Apollo.BaseMutationOptions<
  DeleteVoteMutation,
  DeleteVoteMutationVariables
>;
