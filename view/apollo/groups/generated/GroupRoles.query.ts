import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { GroupPermissionsFragmentDoc } from './GroupPermissions.fragment';
import { GroupRoleFragmentDoc } from './GroupRole.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type GroupRolesQueryVariables = Types.Exact<{
  name: Types.Scalars['String'];
}>;

export type GroupRolesQuery = {
  __typename?: 'Query';
  group: {
    __typename?: 'Group';
    id: number;
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
    roles: Array<{
      __typename?: 'GroupRole';
      id: number;
      name: string;
      color: string;
      memberCount: number;
      group: { __typename?: 'Group'; id: number; name: string };
    }>;
  };
};

export const GroupRolesDocument = gql`
  query GroupRoles($name: String!) {
    group(name: $name) {
      id
      myPermissions {
        ...GroupPermissions
      }
      roles {
        ...GroupRole
      }
    }
  }
  ${GroupPermissionsFragmentDoc}
  ${GroupRoleFragmentDoc}
`;

/**
 * __useGroupRolesQuery__
 *
 * To run a query within a React component, call `useGroupRolesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupRolesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupRolesQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useGroupRolesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GroupRolesQuery,
    GroupRolesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GroupRolesQuery, GroupRolesQueryVariables>(
    GroupRolesDocument,
    options,
  );
}
export function useGroupRolesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GroupRolesQuery,
    GroupRolesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GroupRolesQuery, GroupRolesQueryVariables>(
    GroupRolesDocument,
    options,
  );
}
export type GroupRolesQueryHookResult = ReturnType<typeof useGroupRolesQuery>;
export type GroupRolesLazyQueryHookResult = ReturnType<
  typeof useGroupRolesLazyQuery
>;
export type GroupRolesQueryResult = Apollo.QueryResult<
  GroupRolesQuery,
  GroupRolesQueryVariables
>;
