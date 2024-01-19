import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UpdateRulesPriorityMutationVariables = Types.Exact<{
  rulesData: Types.UpdateRulesPriorityInput;
}>;

export type UpdateRulesPriorityMutation = {
  __typename?: 'Mutation';
  updateRulesPriority: boolean;
};

export const UpdateRulesPriorityDocument = gql`
  mutation UpdateRulesPriority($rulesData: UpdateRulesPriorityInput!) {
    updateRulesPriority(rulesData: $rulesData)
  }
`;
export type UpdateRulesPriorityMutationFn = Apollo.MutationFunction<
  UpdateRulesPriorityMutation,
  UpdateRulesPriorityMutationVariables
>;

/**
 * __useUpdateRulesPriorityMutation__
 *
 * To run a mutation, you first call `useUpdateRulesPriorityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRulesPriorityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRulesPriorityMutation, { data, loading, error }] = useUpdateRulesPriorityMutation({
 *   variables: {
 *      rulesData: // value for 'rulesData'
 *   },
 * });
 */
export function useUpdateRulesPriorityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateRulesPriorityMutation,
    UpdateRulesPriorityMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateRulesPriorityMutation,
    UpdateRulesPriorityMutationVariables
  >(UpdateRulesPriorityDocument, options);
}
export type UpdateRulesPriorityMutationHookResult = ReturnType<
  typeof useUpdateRulesPriorityMutation
>;
export type UpdateRulesPriorityMutationResult =
  Apollo.MutationResult<UpdateRulesPriorityMutation>;
export type UpdateRulesPriorityMutationOptions = Apollo.BaseMutationOptions<
  UpdateRulesPriorityMutation,
  UpdateRulesPriorityMutationVariables
>;
