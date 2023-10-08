import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from './UserAvatar.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UsersByIdsQueryVariables = Types.Exact<{
  userIds: Array<Types.Scalars['Int']> | Types.Scalars['Int'];
}>;

export type UsersByIdsQuery = {
  __typename?: 'Query';
  usersByIds: Array<{
    __typename?: 'User';
    id: number;
    name: string;
    profilePicture: { __typename?: 'Image'; id: number };
  }>;
};

export const UsersByIdsDocument = gql`
  query UsersByIds($userIds: [Int!]!) {
    usersByIds(ids: $userIds) {
      id
      ...UserAvatar
    }
  }
  ${UserAvatarFragmentDoc}
`;

/**
 * __useUsersByIdsQuery__
 *
 * To run a query within a React component, call `useUsersByIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersByIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersByIdsQuery({
 *   variables: {
 *      userIds: // value for 'userIds'
 *   },
 * });
 */
export function useUsersByIdsQuery(
  baseOptions: Apollo.QueryHookOptions<
    UsersByIdsQuery,
    UsersByIdsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<UsersByIdsQuery, UsersByIdsQueryVariables>(
    UsersByIdsDocument,
    options,
  );
}
export function useUsersByIdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    UsersByIdsQuery,
    UsersByIdsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<UsersByIdsQuery, UsersByIdsQueryVariables>(
    UsersByIdsDocument,
    options,
  );
}
export type UsersByIdsQueryHookResult = ReturnType<typeof useUsersByIdsQuery>;
export type UsersByIdsLazyQueryHookResult = ReturnType<
  typeof useUsersByIdsLazyQuery
>;
export type UsersByIdsQueryResult = Apollo.QueryResult<
  UsersByIdsQuery,
  UsersByIdsQueryVariables
>;
