import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { CanaryStatementFragmentDoc } from '../../fragments/gen/CanaryStatement.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type CanaryStatementQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type CanaryStatementQuery = {
  __typename?: 'Query';
  publicCanary?: {
    __typename?: 'Canary';
    id: number;
    statement: string;
    updatedAt: any;
  } | null;
};

export const CanaryStatementDocument = gql`
  query CanaryStatement {
    publicCanary {
      ...CanaryStatement
    }
  }
  ${CanaryStatementFragmentDoc}
`;

/**
 * __useCanaryStatementQuery__
 *
 * To run a query within a React component, call `useCanaryStatementQuery` and pass it any options that fit your needs.
 * When your component renders, `useCanaryStatementQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCanaryStatementQuery({
 *   variables: {
 *   },
 * });
 */
export function useCanaryStatementQuery(
  baseOptions?: Apollo.QueryHookOptions<
    CanaryStatementQuery,
    CanaryStatementQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CanaryStatementQuery, CanaryStatementQueryVariables>(
    CanaryStatementDocument,
    options,
  );
}
export function useCanaryStatementLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CanaryStatementQuery,
    CanaryStatementQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CanaryStatementQuery,
    CanaryStatementQueryVariables
  >(CanaryStatementDocument, options);
}
export type CanaryStatementQueryHookResult = ReturnType<
  typeof useCanaryStatementQuery
>;
export type CanaryStatementLazyQueryHookResult = ReturnType<
  typeof useCanaryStatementLazyQuery
>;
export type CanaryStatementQueryResult = Apollo.QueryResult<
  CanaryStatementQuery,
  CanaryStatementQueryVariables
>;
