import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { QuestionFragmentDoc } from '../../fragments/gen/Question.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type VibeCheckQueryVariables = Types.Exact<{ [key: string]: never }>;

export type VibeCheckQuery = {
  __typename?: 'Query';
  serverQuestions: Array<{ __typename?: 'Question'; id: number; text: string }>;
};

export const VibeCheckDocument = gql`
  query VibeCheck {
    serverQuestions {
      ...Question
    }
  }
  ${QuestionFragmentDoc}
`;

/**
 * __useVibeCheckQuery__
 *
 * To run a query within a React component, call `useVibeCheckQuery` and pass it any options that fit your needs.
 * When your component renders, `useVibeCheckQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVibeCheckQuery({
 *   variables: {
 *   },
 * });
 */
export function useVibeCheckQuery(
  baseOptions?: Apollo.QueryHookOptions<
    VibeCheckQuery,
    VibeCheckQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<VibeCheckQuery, VibeCheckQueryVariables>(
    VibeCheckDocument,
    options,
  );
}
export function useVibeCheckLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    VibeCheckQuery,
    VibeCheckQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<VibeCheckQuery, VibeCheckQueryVariables>(
    VibeCheckDocument,
    options,
  );
}
export type VibeCheckQueryHookResult = ReturnType<typeof useVibeCheckQuery>;
export type VibeCheckLazyQueryHookResult = ReturnType<
  typeof useVibeCheckLazyQuery
>;
export type VibeCheckQueryResult = Apollo.QueryResult<
  VibeCheckQuery,
  VibeCheckQueryVariables
>;