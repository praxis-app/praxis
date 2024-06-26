import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserEntryFragmentDoc } from '../../fragments/gen/UserEntry.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UsersQueryVariables = Types.Exact<{
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;

export type UsersQuery = {
  __typename?: 'Query';
  usersCount: number;
  users: Array<{
    __typename?: 'User';
    id: number;
    isVerified: boolean;
    name: string;
    displayName?: string | null;
    isFollowedByMe: boolean;
    profilePicture: { __typename?: 'Image'; id: number };
  }>;
  me: {
    __typename?: 'User';
    id: number;
    serverPermissions: {
      __typename?: 'ServerPermissions';
      removeMembers: boolean;
    };
  };
};

export const UsersDocument = gql`
  query Users($offset: Int, $limit: Int) {
    users(offset: $offset, limit: $limit) {
      ...UserEntry
    }
    usersCount
    me {
      id
      serverPermissions {
        removeMembers
      }
    }
  }
  ${UserEntryFragmentDoc}
`;

/**
 * __useUsersQuery__
 *
 * To run a query within a React component, call `useUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersQuery({
 *   variables: {
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useUsersQuery(
  baseOptions?: Apollo.QueryHookOptions<UsersQuery, UsersQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<UsersQuery, UsersQueryVariables>(
    UsersDocument,
    options,
  );
}
export function useUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<UsersQuery, UsersQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<UsersQuery, UsersQueryVariables>(
    UsersDocument,
    options,
  );
}
export type UsersQueryHookResult = ReturnType<typeof useUsersQuery>;
export type UsersLazyQueryHookResult = ReturnType<typeof useUsersLazyQuery>;
export type UsersQueryResult = Apollo.QueryResult<
  UsersQuery,
  UsersQueryVariables
>;
