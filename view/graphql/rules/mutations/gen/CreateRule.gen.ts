import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type CreateRuleMutationVariables = Types.Exact<{
  ruleData: Types.CreateRuleInput;
}>;

export type CreateRuleMutation = {
  __typename?: 'Mutation';
  createRule: {
    __typename?: 'CreateRulePayload';
    rule: {
      __typename?: 'Rule';
      id: number;
      title: string;
      description: string;
      priority: number;
    };
  };
};

export const CreateRuleDocument = gql`
  mutation CreateRule($ruleData: CreateRuleInput!) {
    createRule(ruleData: $ruleData) {
      rule {
        id
        title
        description
        priority
      }
    }
  }
`;
export type CreateRuleMutationFn = Apollo.MutationFunction<
  CreateRuleMutation,
  CreateRuleMutationVariables
>;

/**
 * __useCreateRuleMutation__
 *
 * To run a mutation, you first call `useCreateRuleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRuleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRuleMutation, { data, loading, error }] = useCreateRuleMutation({
 *   variables: {
 *      ruleData: // value for 'ruleData'
 *   },
 * });
 */
export function useCreateRuleMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateRuleMutation,
    CreateRuleMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateRuleMutation, CreateRuleMutationVariables>(
    CreateRuleDocument,
    options,
  );
}
export type CreateRuleMutationHookResult = ReturnType<
  typeof useCreateRuleMutation
>;
export type CreateRuleMutationResult =
  Apollo.MutationResult<CreateRuleMutation>;
export type CreateRuleMutationOptions = Apollo.BaseMutationOptions<
  CreateRuleMutation,
  CreateRuleMutationVariables
>;
