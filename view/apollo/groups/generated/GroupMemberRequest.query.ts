import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type GroupMemberRequestQueryVariables = Types.Exact<{
  groupId: Types.Scalars['Int'];
}>;

export type GroupMemberRequestQuery = {
  __typename?: 'Query';
  groupMemberRequest?: {
    __typename?: 'GroupMemberRequest';
    id: number;
    user: { __typename?: 'User'; id: number };
  } | null;
};

export const GroupMemberRequestDocument = gql`
  query GroupMemberRequest($groupId: Int!) {
    groupMemberRequest(groupId: $groupId) {
      id
      user {
        id
      }
    }
  }
`;

/**
 * __useGroupMemberRequestQuery__
 *
 * To run a query within a React component, call `useGroupMemberRequestQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupMemberRequestQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupMemberRequestQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGroupMemberRequestQuery(
  baseOptions: Apollo.QueryHookOptions<
    GroupMemberRequestQuery,
    GroupMemberRequestQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GroupMemberRequestQuery,
    GroupMemberRequestQueryVariables
  >(GroupMemberRequestDocument, options);
}
export function useGroupMemberRequestLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GroupMemberRequestQuery,
    GroupMemberRequestQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GroupMemberRequestQuery,
    GroupMemberRequestQueryVariables
  >(GroupMemberRequestDocument, options);
}
export type GroupMemberRequestQueryHookResult = ReturnType<
  typeof useGroupMemberRequestQuery
>;
export type GroupMemberRequestLazyQueryHookResult = ReturnType<
  typeof useGroupMemberRequestLazyQuery
>;
export type GroupMemberRequestQueryResult = Apollo.QueryResult<
  GroupMemberRequestQuery,
  GroupMemberRequestQueryVariables
>;
