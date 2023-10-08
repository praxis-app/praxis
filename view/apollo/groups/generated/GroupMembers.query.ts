import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { GroupMemberFragmentDoc } from './GroupMember.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type GroupMembersQueryVariables = Types.Exact<{
  name: Types.Scalars['String'];
}>;

export type GroupMembersQuery = {
  __typename?: 'Query';
  group: {
    __typename?: 'Group';
    id: number;
    members: Array<{
      __typename?: 'User';
      id: number;
      name: string;
      isFollowedByMe: boolean;
      profilePicture: { __typename?: 'Image'; id: number };
    }>;
  };
  me: { __typename?: 'User'; id: number };
};

export const GroupMembersDocument = gql`
  query GroupMembers($name: String!) {
    group(name: $name) {
      id
      members {
        ...GroupMember
      }
    }
    me {
      id
    }
  }
  ${GroupMemberFragmentDoc}
`;

/**
 * __useGroupMembersQuery__
 *
 * To run a query within a React component, call `useGroupMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupMembersQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useGroupMembersQuery(
  baseOptions: Apollo.QueryHookOptions<
    GroupMembersQuery,
    GroupMembersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GroupMembersQuery, GroupMembersQueryVariables>(
    GroupMembersDocument,
    options,
  );
}
export function useGroupMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GroupMembersQuery,
    GroupMembersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GroupMembersQuery, GroupMembersQueryVariables>(
    GroupMembersDocument,
    options,
  );
}
export type GroupMembersQueryHookResult = ReturnType<
  typeof useGroupMembersQuery
>;
export type GroupMembersLazyQueryHookResult = ReturnType<
  typeof useGroupMembersLazyQuery
>;
export type GroupMembersQueryResult = Apollo.QueryResult<
  GroupMembersQuery,
  GroupMembersQueryVariables
>;
