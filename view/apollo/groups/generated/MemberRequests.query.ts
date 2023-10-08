import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { MemberRequestFragmentDoc } from './MemberRequest.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type MemberRequestsQueryVariables = Types.Exact<{
  groupName: Types.Scalars['String'];
}>;

export type MemberRequestsQuery = {
  __typename?: 'Query';
  group: {
    __typename?: 'Group';
    id: number;
    memberRequests?: Array<{
      __typename?: 'GroupMemberRequest';
      id: number;
      user: {
        __typename?: 'User';
        id: number;
        name: string;
        profilePicture: { __typename?: 'Image'; id: number };
      };
      group: { __typename?: 'Group'; id: number };
    }> | null;
  };
};

export const MemberRequestsDocument = gql`
  query MemberRequests($groupName: String!) {
    group(name: $groupName) {
      id
      memberRequests {
        ...MemberRequest
      }
    }
  }
  ${MemberRequestFragmentDoc}
`;

/**
 * __useMemberRequestsQuery__
 *
 * To run a query within a React component, call `useMemberRequestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMemberRequestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMemberRequestsQuery({
 *   variables: {
 *      groupName: // value for 'groupName'
 *   },
 * });
 */
export function useMemberRequestsQuery(
  baseOptions: Apollo.QueryHookOptions<
    MemberRequestsQuery,
    MemberRequestsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<MemberRequestsQuery, MemberRequestsQueryVariables>(
    MemberRequestsDocument,
    options,
  );
}
export function useMemberRequestsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    MemberRequestsQuery,
    MemberRequestsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<MemberRequestsQuery, MemberRequestsQueryVariables>(
    MemberRequestsDocument,
    options,
  );
}
export type MemberRequestsQueryHookResult = ReturnType<
  typeof useMemberRequestsQuery
>;
export type MemberRequestsLazyQueryHookResult = ReturnType<
  typeof useMemberRequestsLazyQuery
>;
export type MemberRequestsQueryResult = Apollo.QueryResult<
  MemberRequestsQuery,
  MemberRequestsQueryVariables
>;
