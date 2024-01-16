import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type DeleteRuleMutationVariables = Types.Exact<{
  id: Types.Scalars['Int']['input'];
}>;

export type DeleteRuleMutation = {
  __typename?: 'Mutation';
  deleteRule: boolean;
};

export const DeleteRuleDocument = gql`
  mutation DeleteRule($id: Int!) {
    deleteRule(id: $id)
  }
`;
export type DeleteRuleMutationFn = Apollo.MutationFunction<
  DeleteRuleMutation,
  DeleteRuleMutationVariables
>;

/**
 * __useDeleteRuleMutation__
 *
 * To run a mutation, you first call `useDeleteRuleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteRuleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteRuleMutation, { data, loading, error }] = useDeleteRuleMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteRuleMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteRuleMutation,
    DeleteRuleMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteRuleMutation, DeleteRuleMutationVariables>(
    DeleteRuleDocument,
    options,
  );
}
export type DeleteRuleMutationHookResult = ReturnType<
  typeof useDeleteRuleMutation
>;
export type DeleteRuleMutationResult =
  Apollo.MutationResult<DeleteRuleMutation>;
export type DeleteRuleMutationOptions = Apollo.BaseMutationOptions<
  DeleteRuleMutation,
  DeleteRuleMutationVariables
>;
