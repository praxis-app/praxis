import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { ServerRoleFragmentDoc } from './ServerRole.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ServerRolesQueryVariables = Types.Exact<{ [key: string]: never }>;

export type ServerRolesQuery = {
  __typename?: 'Query';
  serverRoles: Array<{
    __typename?: 'ServerRole';
    id: number;
    name: string;
    color: string;
    memberCount: number;
  }>;
  me: {
    __typename?: 'User';
    id: number;
    serverPermissions: {
      __typename?: 'ServerPermissions';
      manageRoles: boolean;
    };
  };
};

export const ServerRolesDocument = gql`
  query ServerRoles {
    serverRoles {
      ...ServerRole
    }
    me {
      id
      serverPermissions {
        manageRoles
      }
    }
  }
  ${ServerRoleFragmentDoc}
`;

/**
 * __useServerRolesQuery__
 *
 * To run a query within a React component, call `useServerRolesQuery` and pass it any options that fit your needs.
 * When your component renders, `useServerRolesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServerRolesQuery({
 *   variables: {
 *   },
 * });
 */
export function useServerRolesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ServerRolesQuery,
    ServerRolesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ServerRolesQuery, ServerRolesQueryVariables>(
    ServerRolesDocument,
    options,
  );
}
export function useServerRolesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ServerRolesQuery,
    ServerRolesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ServerRolesQuery, ServerRolesQueryVariables>(
    ServerRolesDocument,
    options,
  );
}
export type ServerRolesQueryHookResult = ReturnType<typeof useServerRolesQuery>;
export type ServerRolesLazyQueryHookResult = ReturnType<
  typeof useServerRolesLazyQuery
>;
export type ServerRolesQueryResult = Apollo.QueryResult<
  ServerRolesQuery,
  ServerRolesQueryVariables
>;
