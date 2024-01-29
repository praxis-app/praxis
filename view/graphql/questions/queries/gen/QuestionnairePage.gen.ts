import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { QuestionnaireTicketCardFragmentDoc } from '../../fragments/gen/QuestionnaireTicketCard.gen';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import { VoteFragmentDoc } from '../../../votes/fragments/gen/Vote.gen';
import { AnsweredQuestionFragmentDoc } from '../../fragments/gen/AnsweredQuestion.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type QuestionnairePageQueryVariables = Types.Exact<{
  questionnaireTicketId: Types.Scalars['Int']['input'];
}>;

export type QuestionnairePageQuery = {
  __typename?: 'Query';
  questionnaireTicket: {
    __typename?: 'QuestionnaireTicket';
    id: number;
    status: string;
    createdAt: any;
    questions: Array<{
      __typename?: 'Question';
      id: number;
      text: string;
      priority: number;
      answer?: { __typename?: 'Answer'; id: number; text: string } | null;
    }>;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      profilePicture: { __typename?: 'Image'; id: number };
    };
    votes: Array<{
      __typename?: 'Vote';
      id: number;
      voteType: string;
      user: {
        __typename?: 'User';
        id: number;
        name: string;
        profilePicture: { __typename?: 'Image'; id: number };
      };
    }>;
  };
};

export const QuestionnairePageDocument = gql`
  query QuestionnairePage($questionnaireTicketId: Int!) {
    questionnaireTicket(questionnaireTicketId: $questionnaireTicketId) {
      ...QuestionnaireTicketCard
      questions {
        ...AnsweredQuestion
      }
      user {
        ...UserAvatar
      }
      votes {
        ...Vote
      }
    }
  }
  ${QuestionnaireTicketCardFragmentDoc}
  ${AnsweredQuestionFragmentDoc}
  ${UserAvatarFragmentDoc}
  ${VoteFragmentDoc}
`;

/**
 * __useQuestionnairePageQuery__
 *
 * To run a query within a React component, call `useQuestionnairePageQuery` and pass it any options that fit your needs.
 * When your component renders, `useQuestionnairePageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQuestionnairePageQuery({
 *   variables: {
 *      questionnaireTicketId: // value for 'questionnaireTicketId'
 *   },
 * });
 */
export function useQuestionnairePageQuery(
  baseOptions: Apollo.QueryHookOptions<
    QuestionnairePageQuery,
    QuestionnairePageQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    QuestionnairePageQuery,
    QuestionnairePageQueryVariables
  >(QuestionnairePageDocument, options);
}
export function useQuestionnairePageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    QuestionnairePageQuery,
    QuestionnairePageQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    QuestionnairePageQuery,
    QuestionnairePageQueryVariables
  >(QuestionnairePageDocument, options);
}
export type QuestionnairePageQueryHookResult = ReturnType<
  typeof useQuestionnairePageQuery
>;
export type QuestionnairePageLazyQueryHookResult = ReturnType<
  typeof useQuestionnairePageLazyQuery
>;
export type QuestionnairePageQueryResult = Apollo.QueryResult<
  QuestionnairePageQuery,
  QuestionnairePageQueryVariables
>;
