import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../fragments/gen/UserAvatar.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type VerifiedServerMembersQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type VerifiedServerMembersQuery = {
  __typename?: 'Query';
  verifiedUsers: Array<{
    __typename?: 'User';
    id: number;
    name: string;
    displayName?: string | null;
    profilePicture: { __typename?: 'Image'; id: number };
  }>;
};

export const VerifiedServerMembersDocument = gql`
  query VerifiedServerMembers {
    verifiedUsers {
      id
      ...UserAvatar
    }
  }
  ${UserAvatarFragmentDoc}
`;

/**
 * __useVerifiedServerMembersQuery__
 *
 * To run a query within a React component, call `useVerifiedServerMembersQuery` and pass it any options that fit your needs.
 * When your component renders, `useVerifiedServerMembersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVerifiedServerMembersQuery({
 *   variables: {
 *   },
 * });
 */
export function useVerifiedServerMembersQuery(
  baseOptions?: Apollo.QueryHookOptions<
    VerifiedServerMembersQuery,
    VerifiedServerMembersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    VerifiedServerMembersQuery,
    VerifiedServerMembersQueryVariables
  >(VerifiedServerMembersDocument, options);
}
export function useVerifiedServerMembersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    VerifiedServerMembersQuery,
    VerifiedServerMembersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    VerifiedServerMembersQuery,
    VerifiedServerMembersQueryVariables
  >(VerifiedServerMembersDocument, options);
}
export type VerifiedServerMembersQueryHookResult = ReturnType<
  typeof useVerifiedServerMembersQuery
>;
export type VerifiedServerMembersLazyQueryHookResult = ReturnType<
  typeof useVerifiedServerMembersLazyQuery
>;
export type VerifiedServerMembersQueryResult = Apollo.QueryResult<
  VerifiedServerMembersQuery,
  VerifiedServerMembersQueryVariables
>;
