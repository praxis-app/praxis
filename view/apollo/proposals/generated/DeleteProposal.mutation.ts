import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type DeleteProposalMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type DeleteProposalMutation = {
  __typename?: 'Mutation';
  deleteProposal: boolean;
};

export const DeleteProposalDocument = gql`
  mutation DeleteProposal($id: Int!) {
    deleteProposal(id: $id)
  }
`;
export type DeleteProposalMutationFn = Apollo.MutationFunction<
  DeleteProposalMutation,
  DeleteProposalMutationVariables
>;

/**
 * __useDeleteProposalMutation__
 *
 * To run a mutation, you first call `useDeleteProposalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteProposalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteProposalMutation, { data, loading, error }] = useDeleteProposalMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteProposalMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteProposalMutation,
    DeleteProposalMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteProposalMutation,
    DeleteProposalMutationVariables
  >(DeleteProposalDocument, options);
}
export type DeleteProposalMutationHookResult = ReturnType<
  typeof useDeleteProposalMutation
>;
export type DeleteProposalMutationResult =
  Apollo.MutationResult<DeleteProposalMutation>;
export type DeleteProposalMutationOptions = Apollo.BaseMutationOptions<
  DeleteProposalMutation,
  DeleteProposalMutationVariables
>;
