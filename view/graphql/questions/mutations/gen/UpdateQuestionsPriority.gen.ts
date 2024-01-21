import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UpdateQuestionsPriorityMutationVariables = Types.Exact<{
  questionsData: Types.UpdateQuestionsPriorityInput;
}>;

export type UpdateQuestionsPriorityMutation = {
  __typename?: 'Mutation';
  updateQuestionsPriority: boolean;
};

export const UpdateQuestionsPriorityDocument = gql`
  mutation UpdateQuestionsPriority(
    $questionsData: UpdateQuestionsPriorityInput!
  ) {
    updateQuestionsPriority(questionsData: $questionsData)
  }
`;
export type UpdateQuestionsPriorityMutationFn = Apollo.MutationFunction<
  UpdateQuestionsPriorityMutation,
  UpdateQuestionsPriorityMutationVariables
>;

/**
 * __useUpdateQuestionsPriorityMutation__
 *
 * To run a mutation, you first call `useUpdateQuestionsPriorityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateQuestionsPriorityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateQuestionsPriorityMutation, { data, loading, error }] = useUpdateQuestionsPriorityMutation({
 *   variables: {
 *      questionsData: // value for 'questionsData'
 *   },
 * });
 */
export function useUpdateQuestionsPriorityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateQuestionsPriorityMutation,
    UpdateQuestionsPriorityMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateQuestionsPriorityMutation,
    UpdateQuestionsPriorityMutationVariables
  >(UpdateQuestionsPriorityDocument, options);
}
export type UpdateQuestionsPriorityMutationHookResult = ReturnType<
  typeof useUpdateQuestionsPriorityMutation
>;
export type UpdateQuestionsPriorityMutationResult =
  Apollo.MutationResult<UpdateQuestionsPriorityMutation>;
export type UpdateQuestionsPriorityMutationOptions = Apollo.BaseMutationOptions<
  UpdateQuestionsPriorityMutation,
  UpdateQuestionsPriorityMutationVariables
>;
