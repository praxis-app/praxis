import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { GroupRolePermissionsFragmentDoc } from './GroupRolePermissions.fragment';
import { UserAvatarFragmentDoc } from '../../users/generated/UserAvatar.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type GroupRoleByRoleIdQueryVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type GroupRoleByRoleIdQuery = {
  __typename?: 'Query';
  groupRole: {
    __typename?: 'GroupRole';
    id: number;
    name: string;
    color: string;
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
    members: Array<{
      __typename?: 'User';
      id: number;
      name: string;
      profilePicture: { __typename?: 'Image'; id: number };
    }>;
    availableUsersToAdd: Array<{
      __typename?: 'User';
      id: number;
      name: string;
      profilePicture: { __typename?: 'Image'; id: number };
    }>;
  };
};

export const GroupRoleByRoleIdDocument = gql`
  query GroupRoleByRoleId($id: Int!) {
    groupRole(id: $id) {
      id
      name
      color
      permissions {
        ...GroupRolePermissions
      }
      members {
        ...UserAvatar
      }
      availableUsersToAdd {
        ...UserAvatar
      }
    }
  }
  ${GroupRolePermissionsFragmentDoc}
  ${UserAvatarFragmentDoc}
`;

/**
 * __useGroupRoleByRoleIdQuery__
 *
 * To run a query within a React component, call `useGroupRoleByRoleIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupRoleByRoleIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupRoleByRoleIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGroupRoleByRoleIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GroupRoleByRoleIdQuery,
    GroupRoleByRoleIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GroupRoleByRoleIdQuery,
    GroupRoleByRoleIdQueryVariables
  >(GroupRoleByRoleIdDocument, options);
}
export function useGroupRoleByRoleIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GroupRoleByRoleIdQuery,
    GroupRoleByRoleIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GroupRoleByRoleIdQuery,
    GroupRoleByRoleIdQueryVariables
  >(GroupRoleByRoleIdDocument, options);
}
export type GroupRoleByRoleIdQueryHookResult = ReturnType<
  typeof useGroupRoleByRoleIdQuery
>;
export type GroupRoleByRoleIdLazyQueryHookResult = ReturnType<
  typeof useGroupRoleByRoleIdLazyQuery
>;
export type GroupRoleByRoleIdQueryResult = Apollo.QueryResult<
  GroupRoleByRoleIdQuery,
  GroupRoleByRoleIdQueryVariables
>;
