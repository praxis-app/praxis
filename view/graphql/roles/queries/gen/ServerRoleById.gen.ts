import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { ServerRolePermissionsFragmentDoc } from '../../fragments/gen/ServerRolePermissions.gen';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ServerRoleByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['Int']['input'];
}>;

export type ServerRoleByIdQuery = {
  __typename?: 'Query';
  serverRole: {
    __typename?: 'ServerRole';
    id: number;
    name: string;
    color: string;
    permissions: {
      __typename?: 'ServerRolePermission';
      id: number;
      createInvites: boolean;
      manageComments: boolean;
      manageEvents: boolean;
      manageInvites: boolean;
      managePosts: boolean;
      manageQuestionnaireTickets: boolean;
      manageQuestions: boolean;
      manageRoles: boolean;
      manageRules: boolean;
      manageSettings: boolean;
      removeGroups: boolean;
      removeMembers: boolean;
      removeProposals: boolean;
    };
    members: Array<{
      __typename?: 'User';
      id: number;
      name: string;
      displayName?: string | null;
      profilePicture: { __typename?: 'Image'; id: number };
    }>;
    availableUsersToAdd: Array<{
      __typename?: 'User';
      id: number;
      name: string;
      displayName?: string | null;
      profilePicture: { __typename?: 'Image'; id: number };
    }>;
  };
};

export const ServerRoleByIdDocument = gql`
  query ServerRoleById($id: Int!) {
    serverRole(id: $id) {
      id
      name
      color
      permissions {
        ...ServerRolePermissions
      }
      members {
        ...UserAvatar
      }
      availableUsersToAdd {
        ...UserAvatar
      }
    }
  }
  ${ServerRolePermissionsFragmentDoc}
  ${UserAvatarFragmentDoc}
`;

/**
 * __useServerRoleByIdQuery__
 *
 * To run a query within a React component, call `useServerRoleByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useServerRoleByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServerRoleByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useServerRoleByIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    ServerRoleByIdQuery,
    ServerRoleByIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ServerRoleByIdQuery, ServerRoleByIdQueryVariables>(
    ServerRoleByIdDocument,
    options,
  );
}
export function useServerRoleByIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ServerRoleByIdQuery,
    ServerRoleByIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ServerRoleByIdQuery, ServerRoleByIdQueryVariables>(
    ServerRoleByIdDocument,
    options,
  );
}
export type ServerRoleByIdQueryHookResult = ReturnType<
  typeof useServerRoleByIdQuery
>;
export type ServerRoleByIdLazyQueryHookResult = ReturnType<
  typeof useServerRoleByIdLazyQuery
>;
export type ServerRoleByIdQueryResult = Apollo.QueryResult<
  ServerRoleByIdQuery,
  ServerRoleByIdQueryVariables
>;
