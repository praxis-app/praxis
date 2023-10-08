import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../users/generated/UserAvatar.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type GroupMembersByGroupIdQueryVariables = Types.Exact<{
  groupId: Types.Scalars['Int'];
}>;

export type GroupMembersByGroupIdQuery = {
  __typename?: 'Query';
  group: {
    __typename?: 'Group';
    id: number;
    members: Array<{
      __typename?: 'User';
      id: number;
      name: string;
      profilePicture: { __typename?: 'Image'; id: number };
    }>;
  };
};

export const GroupMembersByGroupIdDocument = gql`
  query GroupMembersByGroupId($groupId: Int!) {
    group(id: $groupId) {
      id
      members {
        id
        ...UserAvatar
      }
    }
  }
  ${UserAvatarFragmentDoc}
`;

/**
 * __useGroupMembersByGroupIdQuery__
 *
 * To run a query within a React component, call `useGroupMembersByGroupIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupMembersByGroupIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupMembersByGroupIdQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGroupMembersByGroupIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GroupMembersByGroupIdQuery,
    GroupMembersByGroupIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GroupMembersByGroupIdQuery,
    GroupMembersByGroupIdQueryVariables
  >(GroupMembersByGroupIdDocument, options);
}
export function useGroupMembersByGroupIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GroupMembersByGroupIdQuery,
    GroupMembersByGroupIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GroupMembersByGroupIdQuery,
    GroupMembersByGroupIdQueryVariables
  >(GroupMembersByGroupIdDocument, options);
}
export type GroupMembersByGroupIdQueryHookResult = ReturnType<
  typeof useGroupMembersByGroupIdQuery
>;
export type GroupMembersByGroupIdLazyQueryHookResult = ReturnType<
  typeof useGroupMembersByGroupIdLazyQuery
>;
export type GroupMembersByGroupIdQueryResult = Apollo.QueryResult<
  GroupMembersByGroupIdQuery,
  GroupMembersByGroupIdQueryVariables
>;
