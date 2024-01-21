import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { QuestionEditorEntryFragmentDoc } from '../../fragments/gen/QuestionEditorEntry.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ServerQuestionsQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type ServerQuestionsQuery = {
  __typename?: 'Query';
  serverQuestions: Array<{
    __typename?: 'Question';
    id: number;
    text: string;
    priority: number;
  }>;
};

export const ServerQuestionsDocument = gql`
  query ServerQuestions {
    serverQuestions {
      ...QuestionEditorEntry
    }
  }
  ${QuestionEditorEntryFragmentDoc}
`;

/**
 * __useServerQuestionsQuery__
 *
 * To run a query within a React component, call `useServerQuestionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useServerQuestionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServerQuestionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useServerQuestionsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ServerQuestionsQuery,
    ServerQuestionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ServerQuestionsQuery, ServerQuestionsQueryVariables>(
    ServerQuestionsDocument,
    options,
  );
}
export function useServerQuestionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ServerQuestionsQuery,
    ServerQuestionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ServerQuestionsQuery,
    ServerQuestionsQueryVariables
  >(ServerQuestionsDocument, options);
}
export type ServerQuestionsQueryHookResult = ReturnType<
  typeof useServerQuestionsQuery
>;
export type ServerQuestionsLazyQueryHookResult = ReturnType<
  typeof useServerQuestionsLazyQuery
>;
export type ServerQuestionsQueryResult = Apollo.QueryResult<
  ServerQuestionsQuery,
  ServerQuestionsQueryVariables
>;
