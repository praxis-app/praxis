import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { GroupPageCardFragmentDoc } from '../../fragments/gen/GroupPageCard.gen';
import { ToggleFormsFragmentDoc } from '../../../users/fragments/gen/ToggleForms.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type GroupPageQueryVariables = Types.Exact<{
  name: Types.Scalars['String']['input'];
  isLoggedIn: Types.Scalars['Boolean']['input'];
}>;

export type GroupPageQuery = {
  __typename?: 'Query';
  group: {
    __typename?: 'Group';
    description: string;
    id: number;
    name: string;
    memberCount: number;
    memberRequestCount?: number | null;
    isJoinedByMe?: boolean;
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
    settings: {
      __typename?: 'GroupConfig';
      id: number;
      isPublic: boolean;
      adminModel: string;
    };
  };
  me?: {
    __typename?: 'User';
    id: number;
    serverPermissions: {
      __typename?: 'ServerPermissions';
      removeGroups: boolean;
    };
    joinedGroups: Array<{
      __typename?: 'Group';
      id: number;
      name: string;
      settings: {
        __typename?: 'GroupConfig';
        id: number;
        votingTimeLimit: number;
      };
    }>;
  };
};

export const GroupPageDocument = gql`
  query GroupPage($name: String!, $isLoggedIn: Boolean!) {
    group(name: $name) {
      ...GroupPageCard
      description
    }
    me @include(if: $isLoggedIn) {
      id
      serverPermissions {
        removeGroups
      }
      ...ToggleForms
    }
  }
  ${GroupPageCardFragmentDoc}
  ${ToggleFormsFragmentDoc}
`;

/**
 * __useGroupPageQuery__
 *
 * To run a query within a React component, call `useGroupPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupPageQuery({
 *   variables: {
 *      name: // value for 'name'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useGroupPageQuery(
  baseOptions: Apollo.QueryHookOptions<GroupPageQuery, GroupPageQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GroupPageQuery, GroupPageQueryVariables>(
    GroupPageDocument,
    options,
  );
}
export function useGroupPageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GroupPageQuery,
    GroupPageQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GroupPageQuery, GroupPageQueryVariables>(
    GroupPageDocument,
    options,
  );
}
export type GroupPageQueryHookResult = ReturnType<typeof useGroupPageQuery>;
export type GroupPageLazyQueryHookResult = ReturnType<
  typeof useGroupPageLazyQuery
>;
export type GroupPageQueryResult = Apollo.QueryResult<
  GroupPageQuery,
  GroupPageQueryVariables
>;
