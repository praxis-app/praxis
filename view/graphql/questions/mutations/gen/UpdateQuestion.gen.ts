import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { QuestionEditorCardFragmentDoc } from '../../fragments/gen/QuestionEditorCard.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UpdateQuestionMutationVariables = Types.Exact<{
  questionData: Types.UpdateQuestionInput;
}>;

export type UpdateQuestionMutation = {
  __typename?: 'Mutation';
  updateQuestion: {
    __typename?: 'UpdateQuestionPayload';
    question: {
      __typename?: 'Question';
      id: number;
      text: string;
      priority: number;
    };
  };
};

export const UpdateQuestionDocument = gql`
  mutation UpdateQuestion($questionData: UpdateQuestionInput!) {
    updateQuestion(questionData: $questionData) {
      question {
        ...QuestionEditorCard
      }
    }
  }
  ${QuestionEditorCardFragmentDoc}
`;
export type UpdateQuestionMutationFn = Apollo.MutationFunction<
  UpdateQuestionMutation,
  UpdateQuestionMutationVariables
>;

/**
 * __useUpdateQuestionMutation__
 *
 * To run a mutation, you first call `useUpdateQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateQuestionMutation, { data, loading, error }] = useUpdateQuestionMutation({
 *   variables: {
 *      questionData: // value for 'questionData'
 *   },
 * });
 */
export function useUpdateQuestionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateQuestionMutation,
    UpdateQuestionMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateQuestionMutation,
    UpdateQuestionMutationVariables
  >(UpdateQuestionDocument, options);
}
export type UpdateQuestionMutationHookResult = ReturnType<
  typeof useUpdateQuestionMutation
>;
export type UpdateQuestionMutationResult =
  Apollo.MutationResult<UpdateQuestionMutation>;
export type UpdateQuestionMutationOptions = Apollo.BaseMutationOptions<
  UpdateQuestionMutation,
  UpdateQuestionMutationVariables
>;
