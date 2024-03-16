import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { GroupCardFragmentDoc } from '../../fragments/gen/GroupCard.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type GroupsQueryVariables = Types.Exact<{
  input: Types.GroupsInput;
  isLoggedIn?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;

export type GroupsQuery = {
  __typename?: 'Query';
  groupsCount: number;
  joinedGroupsCount: number;
  groups: Array<{
    __typename?: 'Group';
    description: string;
    memberCount: number;
    memberRequestCount?: number | null;
    isJoinedByMe?: boolean;
    id: number;
    name: string;
    settings: { __typename?: 'GroupConfig'; id: number; adminModel: string };
    myPermissions?: {
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
    coverPhoto?: { __typename?: 'Image'; id: number } | null;
  }>;
  me: {
    __typename?: 'User';
    id: number;
    serverPermissions: {
      __typename?: 'ServerPermissions';
      removeGroups: boolean;
    };
  };
};

export const GroupsDocument = gql`
  query Groups($input: GroupsInput!, $isLoggedIn: Boolean = true) {
    groups(input: $input) {
      ...GroupCard
    }
    groupsCount
    joinedGroupsCount
    me {
      id
      serverPermissions {
        removeGroups
      }
    }
  }
  ${GroupCardFragmentDoc}
`;

/**
 * __useGroupsQuery__
 *
 * To run a query within a React component, call `useGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupsQuery({
 *   variables: {
 *      input: // value for 'input'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useGroupsQuery(
  baseOptions: Apollo.QueryHookOptions<GroupsQuery, GroupsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GroupsQuery, GroupsQueryVariables>(
    GroupsDocument,
    options,
  );
}
export function useGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GroupsQuery, GroupsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GroupsQuery, GroupsQueryVariables>(
    GroupsDocument,
    options,
  );
}
export type GroupsQueryHookResult = ReturnType<typeof useGroupsQuery>;
export type GroupsLazyQueryHookResult = ReturnType<typeof useGroupsLazyQuery>;
export type GroupsQueryResult = Apollo.QueryResult<
  GroupsQuery,
  GroupsQueryVariables
>;
