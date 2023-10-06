import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type GroupRolesByGroupIdQueryVariables = Types.Exact<{
  groupId: Types.Scalars['Int'];
}>;

export type GroupRolesByGroupIdQuery = {
  __typename?: 'Query';
  group: {
    __typename?: 'Group';
    id: number;
    roles: Array<{ __typename?: 'GroupRole'; id: number; name: string }>;
  };
};

export const GroupRolesByGroupIdDocument = gql`
  query GroupRolesByGroupId($groupId: Int!) {
    group(id: $groupId) {
      id
      roles {
        id
        name
      }
    }
  }
`;

/**
 * __useGroupRolesByGroupIdQuery__
 *
 * To run a query within a React component, call `useGroupRolesByGroupIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupRolesByGroupIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupRolesByGroupIdQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGroupRolesByGroupIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GroupRolesByGroupIdQuery,
    GroupRolesByGroupIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GroupRolesByGroupIdQuery,
    GroupRolesByGroupIdQueryVariables
  >(GroupRolesByGroupIdDocument, options);
}
export function useGroupRolesByGroupIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GroupRolesByGroupIdQuery,
    GroupRolesByGroupIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GroupRolesByGroupIdQuery,
    GroupRolesByGroupIdQueryVariables
  >(GroupRolesByGroupIdDocument, options);
}
export type GroupRolesByGroupIdQueryHookResult = ReturnType<
  typeof useGroupRolesByGroupIdQuery
>;
export type GroupRolesByGroupIdLazyQueryHookResult = ReturnType<
  typeof useGroupRolesByGroupIdLazyQuery
>;
export type GroupRolesByGroupIdQueryResult = Apollo.QueryResult<
  GroupRolesByGroupIdQuery,
  GroupRolesByGroupIdQueryVariables
>;
