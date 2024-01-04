import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { GroupCardFragmentDoc } from '../../fragments/gen/GroupCard.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type PublicGroupsQueryVariables = Types.Exact<{
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  isLoggedIn?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;

export type PublicGroupsQuery = {
  __typename?: 'Query';
  publicGroupsCount: number;
  publicGroups: Array<{
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
};

export const PublicGroupsDocument = gql`
  query PublicGroups($offset: Int, $limit: Int, $isLoggedIn: Boolean = false) {
    publicGroups(offset: $offset, limit: $limit) {
      ...GroupCard
    }
    publicGroupsCount
  }
  ${GroupCardFragmentDoc}
`;

/**
 * __usePublicGroupsQuery__
 *
 * To run a query within a React component, call `usePublicGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePublicGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePublicGroupsQuery({
 *   variables: {
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function usePublicGroupsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    PublicGroupsQuery,
    PublicGroupsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<PublicGroupsQuery, PublicGroupsQueryVariables>(
    PublicGroupsDocument,
    options,
  );
}
export function usePublicGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    PublicGroupsQuery,
    PublicGroupsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<PublicGroupsQuery, PublicGroupsQueryVariables>(
    PublicGroupsDocument,
    options,
  );
}
export type PublicGroupsQueryHookResult = ReturnType<
  typeof usePublicGroupsQuery
>;
export type PublicGroupsLazyQueryHookResult = ReturnType<
  typeof usePublicGroupsLazyQuery
>;
export type PublicGroupsQueryResult = Apollo.QueryResult<
  PublicGroupsQuery,
  PublicGroupsQueryVariables
>;
