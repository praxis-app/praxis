import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { QuestionnaireTicketCardFragmentDoc } from '../../fragments/gen/QuestionnaireTicketCard.gen';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import { VoteFragmentDoc } from '../../../votes/fragments/gen/Vote.gen';
import { AnsweredQuestionCardFragmentDoc } from '../../fragments/gen/AnsweredQuestionCard.gen';
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
    answerCount: number;
    commentCount: number;
    questionCount: number;
    voteCount: number;
    votesNeededToVerify: number;
    agreementVoteCount: number;
    createdAt: any;
    questions: Array<{
      __typename?: 'Question';
      id: number;
      text: string;
      priority: number;
      likeCount: number;
      commentCount: number;
      isLikedByMe: boolean;
      answer?: {
        __typename?: 'Answer';
        id: number;
        text: string;
        updatedAt: any;
        user: {
          __typename?: 'User';
          id: number;
          name: string;
          displayName?: string | null;
        };
      } | null;
    }>;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      displayName?: string | null;
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
        displayName?: string | null;
        profilePicture: { __typename?: 'Image'; id: number };
      };
    }>;
    settings: {
      __typename?: 'QuestionnaireTicketConfig';
      id: number;
      closingAt?: any | null;
      decisionMakingModel: Types.DecisionMakingModel;
      ratificationThreshold: number;
      reservationsLimit: number;
      standAsidesLimit: number;
    };
    myVote?: { __typename?: 'Vote'; id: number; voteType: string } | null;
  };
};

export const QuestionnairePageDocument = gql`
  query QuestionnairePage($questionnaireTicketId: Int!) {
    questionnaireTicket(id: $questionnaireTicketId) {
      ...QuestionnaireTicketCard
      questions {
        ...AnsweredQuestionCard
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
  ${AnsweredQuestionCardFragmentDoc}
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
