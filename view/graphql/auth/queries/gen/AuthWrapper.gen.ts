import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type AuthWrapperQueryVariables = Types.Exact<{ [key: string]: never }>;

export type AuthWrapperQuery = {
  __typename?: 'Query';
  authCheck: boolean;
  me: { __typename?: 'User'; id: number; isVerified: boolean };
};

export const AuthWrapperDocument = gql`
  query AuthWrapper {
    authCheck
    me {
      id
      isVerified
    }
  }
`;

/**
 * __useAuthWrapperQuery__
 *
 * To run a query within a React component, call `useAuthWrapperQuery` and pass it any options that fit your needs.
 * When your component renders, `useAuthWrapperQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAuthWrapperQuery({
 *   variables: {
 *   },
 * });
 */
export function useAuthWrapperQuery(
  baseOptions?: Apollo.QueryHookOptions<
    AuthWrapperQuery,
    AuthWrapperQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<AuthWrapperQuery, AuthWrapperQueryVariables>(
    AuthWrapperDocument,
    options,
  );
}
export function useAuthWrapperLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    AuthWrapperQuery,
    AuthWrapperQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<AuthWrapperQuery, AuthWrapperQueryVariables>(
    AuthWrapperDocument,
    options,
  );
}
export type AuthWrapperQueryHookResult = ReturnType<typeof useAuthWrapperQuery>;
export type AuthWrapperLazyQueryHookResult = ReturnType<
  typeof useAuthWrapperLazyQuery
>;
export type AuthWrapperQueryResult = Apollo.QueryResult<
  AuthWrapperQuery,
  AuthWrapperQueryVariables
>;
