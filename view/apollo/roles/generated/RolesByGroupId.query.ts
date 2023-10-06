import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { EditGroupRoleTabsFragmentDoc } from '../../groups/generated/EditGroupRoleTabs.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type RolesByGroupIdQueryVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type RolesByGroupIdQuery = {
  __typename?: 'Query';
  group: {
    __typename?: 'Group';
    id: number;
    roles: Array<{
      __typename?: 'GroupRole';
      id: number;
      name: string;
      color: string;
      memberCount: number;
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
      group: { __typename?: 'Group'; id: number; name: string };
      members: Array<{
        __typename?: 'User';
        id: number;
        name: string;
        profilePicture: { __typename?: 'Image'; id: number };
      }>;
    }>;
  };
};

export const RolesByGroupIdDocument = gql`
  query RolesByGroupId($id: Int!) {
    group(id: $id) {
      id
      roles {
        ...EditGroupRoleTabs
      }
    }
  }
  ${EditGroupRoleTabsFragmentDoc}
`;

/**
 * __useRolesByGroupIdQuery__
 *
 * To run a query within a React component, call `useRolesByGroupIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useRolesByGroupIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRolesByGroupIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRolesByGroupIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    RolesByGroupIdQuery,
    RolesByGroupIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<RolesByGroupIdQuery, RolesByGroupIdQueryVariables>(
    RolesByGroupIdDocument,
    options,
  );
}
export function useRolesByGroupIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    RolesByGroupIdQuery,
    RolesByGroupIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<RolesByGroupIdQuery, RolesByGroupIdQueryVariables>(
    RolesByGroupIdDocument,
    options,
  );
}
export type RolesByGroupIdQueryHookResult = ReturnType<
  typeof useRolesByGroupIdQuery
>;
export type RolesByGroupIdLazyQueryHookResult = ReturnType<
  typeof useRolesByGroupIdLazyQuery
>;
export type RolesByGroupIdQueryResult = Apollo.QueryResult<
  RolesByGroupIdQuery,
  RolesByGroupIdQueryVariables
>;
