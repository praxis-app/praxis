import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { GroupProfileCardFragmentDoc } from '../../fragments/gen/GroupProfileCard.gen';
import { ToggleFormsFragmentDoc } from '../../../users/fragments/gen/ToggleForms.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type GroupProfileQueryVariables = Types.Exact<{
  name: Types.Scalars['String']['input'];
  isLoggedIn: Types.Scalars['Boolean']['input'];
}>;

export type GroupProfileQuery = {
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

export const GroupProfileDocument = gql`
  query GroupProfile($name: String!, $isLoggedIn: Boolean!) {
    group(name: $name) {
      ...GroupProfileCard
      description
    }
    me @include(if: $isLoggedIn) {
      id
      ...ToggleForms
    }
  }
  ${GroupProfileCardFragmentDoc}
  ${ToggleFormsFragmentDoc}
`;

/**
 * __useGroupProfileQuery__
 *
 * To run a query within a React component, call `useGroupProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupProfileQuery({
 *   variables: {
 *      name: // value for 'name'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useGroupProfileQuery(
  baseOptions: Apollo.QueryHookOptions<
    GroupProfileQuery,
    GroupProfileQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GroupProfileQuery, GroupProfileQueryVariables>(
    GroupProfileDocument,
    options,
  );
}
export function useGroupProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GroupProfileQuery,
    GroupProfileQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GroupProfileQuery, GroupProfileQueryVariables>(
    GroupProfileDocument,
    options,
  );
}
export type GroupProfileQueryHookResult = ReturnType<
  typeof useGroupProfileQuery
>;
export type GroupProfileLazyQueryHookResult = ReturnType<
  typeof useGroupProfileLazyQuery
>;
export type GroupProfileQueryResult = Apollo.QueryResult<
  GroupProfileQuery,
  GroupProfileQueryVariables
>;
