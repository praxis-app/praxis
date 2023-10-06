import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { FollowFragmentDoc } from './Follow.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type FollowingQueryVariables = Types.Exact<{
  name: Types.Scalars['String'];
}>;

export type FollowingQuery = {
  __typename?: 'Query';
  user: {
    __typename?: 'User';
    id: number;
    followingCount: number;
    following: Array<{
      __typename?: 'User';
      id: number;
      name: string;
      isFollowedByMe: boolean;
      profilePicture: { __typename?: 'Image'; id: number };
    }>;
  };
  me: { __typename?: 'User'; id: number };
};

export const FollowingDocument = gql`
  query Following($name: String!) {
    user(name: $name) {
      id
      followingCount
      following {
        ...Follow
      }
    }
    me {
      id
    }
  }
  ${FollowFragmentDoc}
`;

/**
 * __useFollowingQuery__
 *
 * To run a query within a React component, call `useFollowingQuery` and pass it any options that fit your needs.
 * When your component renders, `useFollowingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFollowingQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useFollowingQuery(
  baseOptions: Apollo.QueryHookOptions<FollowingQuery, FollowingQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<FollowingQuery, FollowingQueryVariables>(
    FollowingDocument,
    options,
  );
}
export function useFollowingLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    FollowingQuery,
    FollowingQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<FollowingQuery, FollowingQueryVariables>(
    FollowingDocument,
    options,
  );
}
export type FollowingQueryHookResult = ReturnType<typeof useFollowingQuery>;
export type FollowingLazyQueryHookResult = ReturnType<
  typeof useFollowingLazyQuery
>;
export type FollowingQueryResult = Apollo.QueryResult<
  FollowingQuery,
  FollowingQueryVariables
>;
