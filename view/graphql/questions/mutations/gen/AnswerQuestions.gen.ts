import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { AnswerQuestionsFormFragmentDoc } from '../../fragments/gen/AnswerQuestionsForm.gen';
import { AnsweredQuestionsFragmentDoc } from '../../fragments/gen/AnsweredQuestions.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type AnswerQuestionsMutationVariables = Types.Exact<{
  answersData: Types.AnswerQuestionsInput;
}>;

export type AnswerQuestionsMutation = {
  __typename?: 'Mutation';
  answerQuestions: {
    __typename?: 'AnswerQuestionsPayload';
    questionnaireTicket: {
      __typename?: 'QuestionnaireTicket';
      status: string;
      id: number;
      questions: Array<{
        __typename?: 'Question';
        id: number;
        text: string;
        priority: number;
        myAnswer?: { __typename?: 'Answer'; id: number; text: string } | null;
      }>;
    };
  };
};

export const AnswerQuestionsDocument = gql`
  mutation AnswerQuestions($answersData: AnswerQuestionsInput!) {
    answerQuestions(answersData: $answersData) {
      questionnaireTicket {
        ...AnswerQuestionsForm
        ...AnsweredQuestions
        status
      }
    }
  }
  ${AnswerQuestionsFormFragmentDoc}
  ${AnsweredQuestionsFragmentDoc}
`;
export type AnswerQuestionsMutationFn = Apollo.MutationFunction<
  AnswerQuestionsMutation,
  AnswerQuestionsMutationVariables
>;

/**
 * __useAnswerQuestionsMutation__
 *
 * To run a mutation, you first call `useAnswerQuestionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAnswerQuestionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [answerQuestionsMutation, { data, loading, error }] = useAnswerQuestionsMutation({
 *   variables: {
 *      answersData: // value for 'answersData'
 *   },
 * });
 */
export function useAnswerQuestionsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AnswerQuestionsMutation,
    AnswerQuestionsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AnswerQuestionsMutation,
    AnswerQuestionsMutationVariables
  >(AnswerQuestionsDocument, options);
}
export type AnswerQuestionsMutationHookResult = ReturnType<
  typeof useAnswerQuestionsMutation
>;
export type AnswerQuestionsMutationResult =
  Apollo.MutationResult<AnswerQuestionsMutation>;
export type AnswerQuestionsMutationOptions = Apollo.BaseMutationOptions<
  AnswerQuestionsMutation,
  AnswerQuestionsMutationVariables
>;
