import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type IsFirstUserQueryVariables = Types.Exact<{ [key: string]: never }>;

export type IsFirstUserQuery = { __typename?: 'Query'; isFirstUser: boolean };

export const IsFirstUserDocument = gql`
  query IsFirstUser {
    isFirstUser
  }
`;

/**
 * __useIsFirstUserQuery__
 *
 * To run a query within a React component, call `useIsFirstUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsFirstUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsFirstUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useIsFirstUserQuery(
  baseOptions?: Apollo.QueryHookOptions<
    IsFirstUserQuery,
    IsFirstUserQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<IsFirstUserQuery, IsFirstUserQueryVariables>(
    IsFirstUserDocument,
    options,
  );
}
export function useIsFirstUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    IsFirstUserQuery,
    IsFirstUserQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<IsFirstUserQuery, IsFirstUserQueryVariables>(
    IsFirstUserDocument,
    options,
  );
}
export type IsFirstUserQueryHookResult = ReturnType<typeof useIsFirstUserQuery>;
export type IsFirstUserLazyQueryHookResult = ReturnType<
  typeof useIsFirstUserLazyQuery
>;
export type IsFirstUserQueryResult = Apollo.QueryResult<
  IsFirstUserQuery,
  IsFirstUserQueryVariables
>;
