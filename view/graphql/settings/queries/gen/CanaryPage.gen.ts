import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { CanaryStatementFragmentDoc } from '../../fragments/gen/CanaryStatement.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type CanaryPageQueryVariables = Types.Exact<{ [key: string]: never }>;

export type CanaryPageQuery = {
  __typename?: 'Query';
  publicCanary?: {
    __typename?: 'Canary';
    id: number;
    statement: string;
    updatedAt: any;
  } | null;
};

export const CanaryPageDocument = gql`
  query CanaryPage {
    publicCanary {
      ...CanaryStatement
    }
  }
  ${CanaryStatementFragmentDoc}
`;

/**
 * __useCanaryPageQuery__
 *
 * To run a query within a React component, call `useCanaryPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useCanaryPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCanaryPageQuery({
 *   variables: {
 *   },
 * });
 */
export function useCanaryPageQuery(
  baseOptions?: Apollo.QueryHookOptions<
    CanaryPageQuery,
    CanaryPageQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CanaryPageQuery, CanaryPageQueryVariables>(
    CanaryPageDocument,
    options,
  );
}
export function useCanaryPageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CanaryPageQuery,
    CanaryPageQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CanaryPageQuery, CanaryPageQueryVariables>(
    CanaryPageDocument,
    options,
  );
}
export type CanaryPageQueryHookResult = ReturnType<typeof useCanaryPageQuery>;
export type CanaryPageLazyQueryHookResult = ReturnType<
  typeof useCanaryPageLazyQuery
>;
export type CanaryPageQueryResult = Apollo.QueryResult<
  CanaryPageQuery,
  CanaryPageQueryVariables
>;
