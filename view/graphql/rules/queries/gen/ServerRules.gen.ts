import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { RuleFragmentDoc } from '../../fragments/gen/Rule.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ServerRulesQueryVariables = Types.Exact<{
  isLoggedIn: Types.Scalars['Boolean']['input'];
}>;

export type ServerRulesQuery = {
  __typename?: 'Query';
  serverRules: Array<{
    __typename?: 'Rule';
    id: number;
    title: string;
    description: string;
    priority: number;
  }>;
  me?: {
    __typename?: 'User';
    id: number;
    serverPermissions: {
      __typename?: 'ServerPermissions';
      manageRules: boolean;
    };
  };
};

export const ServerRulesDocument = gql`
  query ServerRules($isLoggedIn: Boolean!) {
    serverRules {
      ...Rule
    }
    me @include(if: $isLoggedIn) {
      id
      serverPermissions {
        manageRules
      }
    }
  }
  ${RuleFragmentDoc}
`;

/**
 * __useServerRulesQuery__
 *
 * To run a query within a React component, call `useServerRulesQuery` and pass it any options that fit your needs.
 * When your component renders, `useServerRulesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServerRulesQuery({
 *   variables: {
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useServerRulesQuery(
  baseOptions: Apollo.QueryHookOptions<
    ServerRulesQuery,
    ServerRulesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ServerRulesQuery, ServerRulesQueryVariables>(
    ServerRulesDocument,
    options,
  );
}
export function useServerRulesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ServerRulesQuery,
    ServerRulesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ServerRulesQuery, ServerRulesQueryVariables>(
    ServerRulesDocument,
    options,
  );
}
export type ServerRulesQueryHookResult = ReturnType<typeof useServerRulesQuery>;
export type ServerRulesLazyQueryHookResult = ReturnType<
  typeof useServerRulesLazyQuery
>;
export type ServerRulesQueryResult = Apollo.QueryResult<
  ServerRulesQuery,
  ServerRulesQueryVariables
>;
