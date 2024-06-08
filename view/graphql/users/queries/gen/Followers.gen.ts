import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { FollowFragmentDoc } from '../../fragments/gen/Follow.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type FollowersQueryVariables = Types.Exact<{
  name: Types.Scalars['String']['input'];
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;

export type FollowersQuery = {
  __typename?: 'Query';
  user: {
    __typename?: 'User';
    id: number;
    displayName?: string | null;
    followerCount: number;
    followers: Array<{
      __typename?: 'User';
      id: number;
      name: string;
      displayName?: string | null;
      isFollowedByMe: boolean;
      profilePicture: { __typename?: 'Image'; id: number };
    }>;
  };
  me: { __typename?: 'User'; id: number };
};

export const FollowersDocument = gql`
  query Followers($name: String!, $offset: Int, $limit: Int) {
    user(name: $name) {
      id
      displayName
      followers(offset: $offset, limit: $limit) {
        ...Follow
      }
      followerCount
    }
    me {
      id
    }
  }
  ${FollowFragmentDoc}
`;

/**
 * __useFollowersQuery__
 *
 * To run a query within a React component, call `useFollowersQuery` and pass it any options that fit your needs.
 * When your component renders, `useFollowersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFollowersQuery({
 *   variables: {
 *      name: // value for 'name'
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useFollowersQuery(
  baseOptions: Apollo.QueryHookOptions<FollowersQuery, FollowersQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<FollowersQuery, FollowersQueryVariables>(
    FollowersDocument,
    options,
  );
}
export function useFollowersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    FollowersQuery,
    FollowersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<FollowersQuery, FollowersQueryVariables>(
    FollowersDocument,
    options,
  );
}
export type FollowersQueryHookResult = ReturnType<typeof useFollowersQuery>;
export type FollowersLazyQueryHookResult = ReturnType<
  typeof useFollowersLazyQuery
>;
export type FollowersQueryResult = Apollo.QueryResult<
  FollowersQuery,
  FollowersQueryVariables
>;
