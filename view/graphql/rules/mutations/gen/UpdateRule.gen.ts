import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { RuleFragmentDoc } from '../../fragments/gen/Rule.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UpdateRuleMutationVariables = Types.Exact<{
  ruleData: Types.UpdateRuleInput;
}>;

export type UpdateRuleMutation = {
  __typename?: 'Mutation';
  updateRule: {
    __typename?: 'UpdateRulePayload';
    rule: {
      __typename?: 'Rule';
      id: number;
      title: string;
      description: string;
      priority: number;
    };
  };
};

export const UpdateRuleDocument = gql`
  mutation UpdateRule($ruleData: UpdateRuleInput!) {
    updateRule(ruleData: $ruleData) {
      rule {
        ...Rule
      }
    }
  }
  ${RuleFragmentDoc}
`;
export type UpdateRuleMutationFn = Apollo.MutationFunction<
  UpdateRuleMutation,
  UpdateRuleMutationVariables
>;

/**
 * __useUpdateRuleMutation__
 *
 * To run a mutation, you first call `useUpdateRuleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRuleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRuleMutation, { data, loading, error }] = useUpdateRuleMutation({
 *   variables: {
 *      ruleData: // value for 'ruleData'
 *   },
 * });
 */
export function useUpdateRuleMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateRuleMutation,
    UpdateRuleMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateRuleMutation, UpdateRuleMutationVariables>(
    UpdateRuleDocument,
    options,
  );
}
export type UpdateRuleMutationHookResult = ReturnType<
  typeof useUpdateRuleMutation
>;
export type UpdateRuleMutationResult =
  Apollo.MutationResult<UpdateRuleMutation>;
export type UpdateRuleMutationOptions = Apollo.BaseMutationOptions<
  UpdateRuleMutation,
  UpdateRuleMutationVariables
>;
