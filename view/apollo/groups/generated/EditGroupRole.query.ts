import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { EditGroupRoleTabsFragmentDoc } from './EditGroupRoleTabs.fragment';
import { GroupPermissionsFragmentDoc } from './GroupPermissions.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type EditGroupRoleQueryVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type EditGroupRoleQuery = {
  __typename?: 'Query';
  groupRole: {
    __typename?: 'GroupRole';
    id: number;
    name: string;
    color: string;
    memberCount: number;
    group: {
      __typename?: 'Group';
      id: number;
      name: string;
      myPermissions: {
        __typename?: 'GroupPermissions';
        approveMemberRequests: boolean;
        createEvents: boolean;
        deleteGroup: boolean;
        manageComments: boolean;
        manageEvents: boolean;
        managePosts: boolean;
        manageRoles: boolean;
        manageSettings: boolean;
        removeMembers: boolean;
        updateGroup: boolean;
      };
    };
    permissions: {
      __typename?: 'GroupRolePermission';
      id: number;
      approveMemberRequests: boolean;
      createEvents: boolean;
      deleteGroup: boolean;
      manageComments: boolean;
      manageEvents: boolean;
      managePosts: boolean;
      manageRoles: boolean;
      manageSettings: boolean;
      removeMembers: boolean;
      updateGroup: boolean;
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
};

export const EditGroupRoleDocument = gql`
  query EditGroupRole($id: Int!) {
    groupRole(id: $id) {
      ...EditGroupRoleTabs
      group {
        id
        myPermissions {
          ...GroupPermissions
        }
      }
    }
  }
  ${EditGroupRoleTabsFragmentDoc}
  ${GroupPermissionsFragmentDoc}
`;

/**
 * __useEditGroupRoleQuery__
 *
 * To run a query within a React component, call `useEditGroupRoleQuery` and pass it any options that fit your needs.
 * When your component renders, `useEditGroupRoleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEditGroupRoleQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useEditGroupRoleQuery(
  baseOptions: Apollo.QueryHookOptions<
    EditGroupRoleQuery,
    EditGroupRoleQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<EditGroupRoleQuery, EditGroupRoleQueryVariables>(
    EditGroupRoleDocument,
    options,
  );
}
export function useEditGroupRoleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    EditGroupRoleQuery,
    EditGroupRoleQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<EditGroupRoleQuery, EditGroupRoleQueryVariables>(
    EditGroupRoleDocument,
    options,
  );
}
export type EditGroupRoleQueryHookResult = ReturnType<
  typeof useEditGroupRoleQuery
>;
export type EditGroupRoleLazyQueryHookResult = ReturnType<
  typeof useEditGroupRoleLazyQuery
>;
export type EditGroupRoleQueryResult = Apollo.QueryResult<
  EditGroupRoleQuery,
  EditGroupRoleQueryVariables
>;
