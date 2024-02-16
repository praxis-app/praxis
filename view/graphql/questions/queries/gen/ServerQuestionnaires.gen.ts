import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { QuestionnaireTicketCardFragmentDoc } from '../../fragments/gen/QuestionnaireTicketCard.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ServerQuestionnairesQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type ServerQuestionnairesQuery = {
  __typename?: 'Query';
  serverQuestionnaireTickets: Array<{
    __typename?: 'QuestionnaireTicket';
    id: number;
    status: string;
    voteCount: number;
    commentCount: number;
    questionCount: number;
    answerCount: number;
    createdAt: any;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      profilePicture: { __typename?: 'Image'; id: number };
    };
    settings: {
      __typename?: 'QuestionnaireTicketConfig';
      id: number;
      closingAt?: any | null;
      decisionMakingModel: string;
      ratificationThreshold: number;
      reservationsLimit: number;
      standAsidesLimit: number;
    };
    myVote?: { __typename?: 'Vote'; id: number; voteType: string } | null;
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
  }>;
};

export const ServerQuestionnairesDocument = gql`
  query ServerQuestionnaires {
    serverQuestionnaireTickets {
      ...QuestionnaireTicketCard
    }
  }
  ${QuestionnaireTicketCardFragmentDoc}
`;

/**
 * __useServerQuestionnairesQuery__
 *
 * To run a query within a React component, call `useServerQuestionnairesQuery` and pass it any options that fit your needs.
 * When your component renders, `useServerQuestionnairesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServerQuestionnairesQuery({
 *   variables: {
 *   },
 * });
 */
export function useServerQuestionnairesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ServerQuestionnairesQuery,
    ServerQuestionnairesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    ServerQuestionnairesQuery,
    ServerQuestionnairesQueryVariables
  >(ServerQuestionnairesDocument, options);
}
export function useServerQuestionnairesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ServerQuestionnairesQuery,
    ServerQuestionnairesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ServerQuestionnairesQuery,
    ServerQuestionnairesQueryVariables
  >(ServerQuestionnairesDocument, options);
}
export type ServerQuestionnairesQueryHookResult = ReturnType<
  typeof useServerQuestionnairesQuery
>;
export type ServerQuestionnairesLazyQueryHookResult = ReturnType<
  typeof useServerQuestionnairesLazyQuery
>;
export type ServerQuestionnairesQueryResult = Apollo.QueryResult<
  ServerQuestionnairesQuery,
  ServerQuestionnairesQueryVariables
>;
