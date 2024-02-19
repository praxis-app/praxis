import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { LikeFragmentDoc } from '../../fragments/gen/Like.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type LikesQueryVariables = Types.Exact<{
  likesData: Types.LikesInput;
  isLoggedIn: Types.Scalars['Boolean']['input'];
}>;

export type LikesQuery = {
  __typename?: 'Query';
  likes: Array<{
    __typename?: 'Like';
    id: number;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      isFollowedByMe: boolean;
      profilePicture: { __typename?: 'Image'; id: number };
    };
  }>;
  me?: { __typename?: 'User'; id: number };
};

export const LikesDocument = gql`
  query Likes($likesData: LikesInput!, $isLoggedIn: Boolean!) {
    likes(likesData: $likesData) {
      ...Like
    }
    me @include(if: $isLoggedIn) {
      id
    }
  }
  ${LikeFragmentDoc}
`;

/**
 * __useLikesQuery__
 *
 * To run a query within a React component, call `useLikesQuery` and pass it any options that fit your needs.
 * When your component renders, `useLikesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLikesQuery({
 *   variables: {
 *      likesData: // value for 'likesData'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useLikesQuery(
  baseOptions: Apollo.QueryHookOptions<LikesQuery, LikesQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<LikesQuery, LikesQueryVariables>(
    LikesDocument,
    options,
  );
}
export function useLikesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<LikesQuery, LikesQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<LikesQuery, LikesQueryVariables>(
    LikesDocument,
    options,
  );
}
export type LikesQueryHookResult = ReturnType<typeof useLikesQuery>;
export type LikesLazyQueryHookResult = ReturnType<typeof useLikesLazyQuery>;
export type LikesQueryResult = Apollo.QueryResult<
  LikesQuery,
  LikesQueryVariables
>;
