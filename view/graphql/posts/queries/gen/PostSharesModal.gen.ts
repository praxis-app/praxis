import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { PostShareCompactFragmentDoc } from '../../fragments/gen/PostShareCompact.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type PostSharesModalQueryVariables = Types.Exact<{
  postId: Types.Scalars['Int']['input'];
  isVerified: Types.Scalars['Boolean']['input'];
}>;

export type PostSharesModalQuery = {
  __typename?: 'Query';
  post: {
    __typename?: 'Post';
    id: number;
    shares: Array<{
      __typename?: 'Post';
      id: number;
      body?: string | null;
      likeCount: number;
      shareCount: number;
      isLikedByMe?: boolean;
      createdAt: any;
      user: {
        __typename?: 'User';
        id: number;
        name: string;
        displayName?: string | null;
        profilePicture: { __typename?: 'Image'; id: number };
      };
      group?: {
        __typename?: 'Group';
        id: number;
        name: string;
        coverPhoto?: { __typename?: 'Image'; id: number } | null;
      } | null;
      event?: {
        __typename?: 'Event';
        id: number;
        name: string;
        coverPhoto: { __typename?: 'Image'; id: number };
      } | null;
    }>;
  };
  me: {
    __typename?: 'User';
    id: number;
    serverPermissions: {
      __typename?: 'ServerPermissions';
      managePosts: boolean;
    };
  };
};

export const PostSharesModalDocument = gql`
  query PostSharesModal($postId: Int!, $isVerified: Boolean!) {
    post(id: $postId) {
      id
      shares {
        ...PostShareCompact
      }
    }
    me {
      id
      serverPermissions {
        managePosts
      }
    }
  }
  ${PostShareCompactFragmentDoc}
`;

/**
 * __usePostSharesModalQuery__
 *
 * To run a query within a React component, call `usePostSharesModalQuery` and pass it any options that fit your needs.
 * When your component renders, `usePostSharesModalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostSharesModalQuery({
 *   variables: {
 *      postId: // value for 'postId'
 *      isVerified: // value for 'isVerified'
 *   },
 * });
 */
export function usePostSharesModalQuery(
  baseOptions: Apollo.QueryHookOptions<
    PostSharesModalQuery,
    PostSharesModalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<PostSharesModalQuery, PostSharesModalQueryVariables>(
    PostSharesModalDocument,
    options,
  );
}
export function usePostSharesModalLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    PostSharesModalQuery,
    PostSharesModalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    PostSharesModalQuery,
    PostSharesModalQueryVariables
  >(PostSharesModalDocument, options);
}
export type PostSharesModalQueryHookResult = ReturnType<
  typeof usePostSharesModalQuery
>;
export type PostSharesModalLazyQueryHookResult = ReturnType<
  typeof usePostSharesModalLazyQuery
>;
export type PostSharesModalQueryResult = Apollo.QueryResult<
  PostSharesModalQuery,
  PostSharesModalQueryVariables
>;
