import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ServerRoleOptionsQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type ServerRoleOptionsQuery = {
  __typename?: 'Query';
  serverRoles: Array<{ __typename?: 'ServerRole'; id: number; name: string }>;
};

export const ServerRoleOptionsDocument = gql`
  query ServerRoleOptions {
    serverRoles {
      id
      name
    }
  }
`;

/**
 * __useServerRoleOptionsQuery__
 *
 * To run a query within a React component, call `useServerRoleOptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useServerRoleOptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServerRoleOptionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useServerRoleOptionsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ServerRoleOptionsQuery,
    ServerRoleOptionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    ServerRoleOptionsQuery,
    ServerRoleOptionsQueryVariables
  >(ServerRoleOptionsDocument, options);
}
export function useServerRoleOptionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ServerRoleOptionsQuery,
    ServerRoleOptionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ServerRoleOptionsQuery,
    ServerRoleOptionsQueryVariables
  >(ServerRoleOptionsDocument, options);
}
export type ServerRoleOptionsQueryHookResult = ReturnType<
  typeof useServerRoleOptionsQuery
>;
export type ServerRoleOptionsLazyQueryHookResult = ReturnType<
  typeof useServerRoleOptionsLazyQuery
>;
export type ServerRoleOptionsQueryResult = Apollo.QueryResult<
  ServerRoleOptionsQuery,
  ServerRoleOptionsQueryVariables
>;
