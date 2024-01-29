import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { QuestionEditorCardFragmentDoc } from '../../fragments/gen/QuestionEditorCard.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type CreateQuestionMutationVariables = Types.Exact<{
  questionData: Types.CreateQuestionInput;
}>;

export type CreateQuestionMutation = {
  __typename?: 'Mutation';
  createQuestion: {
    __typename?: 'CreateQuestionPayload';
    question: {
      __typename?: 'Question';
      id: number;
      text: string;
      priority: number;
    };
  };
};

export const CreateQuestionDocument = gql`
  mutation CreateQuestion($questionData: CreateQuestionInput!) {
    createQuestion(questionData: $questionData) {
      question {
        ...QuestionEditorCard
      }
    }
  }
  ${QuestionEditorCardFragmentDoc}
`;
export type CreateQuestionMutationFn = Apollo.MutationFunction<
  CreateQuestionMutation,
  CreateQuestionMutationVariables
>;

/**
 * __useCreateQuestionMutation__
 *
 * To run a mutation, you first call `useCreateQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createQuestionMutation, { data, loading, error }] = useCreateQuestionMutation({
 *   variables: {
 *      questionData: // value for 'questionData'
 *   },
 * });
 */
export function useCreateQuestionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateQuestionMutation,
    CreateQuestionMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateQuestionMutation,
    CreateQuestionMutationVariables
  >(CreateQuestionDocument, options);
}
export type CreateQuestionMutationHookResult = ReturnType<
  typeof useCreateQuestionMutation
>;
export type CreateQuestionMutationResult =
  Apollo.MutationResult<CreateQuestionMutation>;
export type CreateQuestionMutationOptions = Apollo.BaseMutationOptions<
  CreateQuestionMutation,
  CreateQuestionMutationVariables
>;
