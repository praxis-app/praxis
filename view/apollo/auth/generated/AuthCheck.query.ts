import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type AuthCheckQueryVariables = Types.Exact<{ [key: string]: never }>;

export type AuthCheckQuery = { __typename?: 'Query'; authCheck: boolean };

export const AuthCheckDocument = gql`
  query AuthCheck {
    authCheck
  }
`;

/**
 * __useAuthCheckQuery__
 *
 * To run a query within a React component, call `useAuthCheckQuery` and pass it any options that fit your needs.
 * When your component renders, `useAuthCheckQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAuthCheckQuery({
 *   variables: {
 *   },
 * });
 */
export function useAuthCheckQuery(
  baseOptions?: Apollo.QueryHookOptions<
    AuthCheckQuery,
    AuthCheckQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<AuthCheckQuery, AuthCheckQueryVariables>(
    AuthCheckDocument,
    options,
  );
}
export function useAuthCheckLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    AuthCheckQuery,
    AuthCheckQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<AuthCheckQuery, AuthCheckQueryVariables>(
    AuthCheckDocument,
    options,
  );
}
export type AuthCheckQueryHookResult = ReturnType<typeof useAuthCheckQuery>;
export type AuthCheckLazyQueryHookResult = ReturnType<
  typeof useAuthCheckLazyQuery
>;
export type AuthCheckQueryResult = Apollo.QueryResult<
  AuthCheckQuery,
  AuthCheckQueryVariables
>;
