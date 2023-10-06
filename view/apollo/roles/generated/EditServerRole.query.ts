import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { EditServerRoleTabsFragmentDoc } from './EditServerRoleTabs.fragment';
import { ServerPermissionsFragmentDoc } from './ServerPermissions.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type EditServerRoleQueryVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type EditServerRoleQuery = {
  __typename?: 'Query';
  serverRole: {
    __typename?: 'ServerRole';
    id: number;
    name: string;
    color: string;
    memberCount: number;
    permissions: {
      __typename?: 'ServerRolePermission';
      id: number;
      createInvites: boolean;
      manageComments: boolean;
      manageEvents: boolean;
      manageInvites: boolean;
      managePosts: boolean;
      manageRoles: boolean;
      removeMembers: boolean;
    };
    availableUsersToAdd: Array<{
      __typename?: 'User';
      id: number;
      name: string;
      profilePicture: { __typename?: 'Image'; id: number };
    }>;
    members: Array<{
      __typename?: 'User';
      id: number;
      name: string;
      profilePicture: { __typename?: 'Image'; id: number };
    }>;
  };
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

export const EditServerRoleDocument = gql`
  query EditServerRole($id: Int!) {
    serverRole(id: $id) {
      ...EditServerRoleTabs
    }
    me {
      id
      serverPermissions {
        ...ServerPermissions
      }
    }
  }
  ${EditServerRoleTabsFragmentDoc}
  ${ServerPermissionsFragmentDoc}
`;

/**
 * __useEditServerRoleQuery__
 *
 * To run a query within a React component, call `useEditServerRoleQuery` and pass it any options that fit your needs.
 * When your component renders, `useEditServerRoleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEditServerRoleQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useEditServerRoleQuery(
  baseOptions: Apollo.QueryHookOptions<
    EditServerRoleQuery,
    EditServerRoleQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<EditServerRoleQuery, EditServerRoleQueryVariables>(
    EditServerRoleDocument,
    options,
  );
}
export function useEditServerRoleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    EditServerRoleQuery,
    EditServerRoleQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<EditServerRoleQuery, EditServerRoleQueryVariables>(
    EditServerRoleDocument,
    options,
  );
}
export type EditServerRoleQueryHookResult = ReturnType<
  typeof useEditServerRoleQuery
>;
export type EditServerRoleLazyQueryHookResult = ReturnType<
  typeof useEditServerRoleLazyQuery
>;
export type EditServerRoleQueryResult = Apollo.QueryResult<
  EditServerRoleQuery,
  EditServerRoleQueryVariables
>;
