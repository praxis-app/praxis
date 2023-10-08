import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { ServerInviteCardFragmentDoc } from './ServerInviteCard.fragment';
import { ServerPermissionsFragmentDoc } from '../../roles/generated/ServerPermissions.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ServerInvitesQueryVariables = Types.Exact<{ [key: string]: never }>;

export type ServerInvitesQuery = {
  __typename?: 'Query';
  serverInvites: Array<{
    __typename?: 'ServerInvite';
    id: number;
    maxUses?: number | null;
    token: string;
    uses: number;
    expiresAt?: any | null;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      profilePicture: { __typename?: 'Image'; id: number };
    };
  }>;
  me: {
    __typename?: 'User';
    id: number;
    serverPermissions: {
      __typename?: 'ServerPermissions';
      createInvites: boolean;
      manageComments: boolean;
      manageEvents: boolean;
      manageInvites: boolean;
      managePosts: boolean;
      manageRoles: boolean;
      removeMembers: boolean;
    };
  };
};

export const ServerInvitesDocument = gql`
  query ServerInvites {
    serverInvites {
      ...ServerInviteCard
    }
    me {
      id
      serverPermissions {
        ...ServerPermissions
      }
    }
  }
  ${ServerInviteCardFragmentDoc}
  ${ServerPermissionsFragmentDoc}
`;

/**
 * __useServerInvitesQuery__
 *
 * To run a query within a React component, call `useServerInvitesQuery` and pass it any options that fit your needs.
 * When your component renders, `useServerInvitesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServerInvitesQuery({
 *   variables: {
 *   },
 * });
 */
export function useServerInvitesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ServerInvitesQuery,
    ServerInvitesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ServerInvitesQuery, ServerInvitesQueryVariables>(
    ServerInvitesDocument,
    options,
  );
}
export function useServerInvitesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ServerInvitesQuery,
    ServerInvitesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ServerInvitesQuery, ServerInvitesQueryVariables>(
    ServerInvitesDocument,
    options,
  );
}
export type ServerInvitesQueryHookResult = ReturnType<
  typeof useServerInvitesQuery
>;
export type ServerInvitesLazyQueryHookResult = ReturnType<
  typeof useServerInvitesLazyQuery
>;
export type ServerInvitesQueryResult = Apollo.QueryResult<
  ServerInvitesQuery,
  ServerInvitesQueryVariables
>;
