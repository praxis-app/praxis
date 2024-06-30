import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { PostCardFragmentDoc } from '../../fragments/gen/PostCard.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type PostQueryVariables = Types.Exact<{
  id: Types.Scalars['Int']['input'];
  isVerified: Types.Scalars['Boolean']['input'];
}>;

export type PostQuery = {
  __typename?: 'Query';
  post: {
    __typename?: 'Post';
    id: number;
    body?: string | null;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    isLikedByMe?: boolean;
    hasMissingSharedPost: boolean;
    createdAt: any;
    images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      displayName?: string | null;
      profilePicture: { __typename?: 'Image'; id: number };
    };
    group?: {
      __typename?: 'Group';
      isJoinedByMe?: boolean;
      id: number;
      name: string;
      myPermissions?: {
        __typename?: 'GroupPermissions';
        approveMemberRequests: boolean;
        createEvents: boolean;
        deleteGroup: boolean;
        manageComments: boolean;
        manageEvents: boolean;
        managePosts: boolean;
        manageRoles: boolean;
        manageSettings: boolean;
        removeMembers: boolean;
        updateGroup: boolean;
      };
      coverPhoto?: { __typename?: 'Image'; id: number } | null;
    } | null;
    event?: {
      __typename?: 'Event';
      id: number;
      name: string;
      group?: {
        __typename?: 'Group';
        id: number;
        isJoinedByMe: boolean;
      } | null;
      coverPhoto: { __typename?: 'Image'; id: number };
    } | null;
    sharedPost?: {
      __typename?: 'Post';
      id: number;
      body?: string | null;
      createdAt: any;
      images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
      user: {
        __typename?: 'User';
        id: number;
        name: string;
        displayName?: string | null;
        profilePicture: { __typename?: 'Image'; id: number };
      };
    } | null;
    shares: Array<{
      __typename?: 'Post';
      id: number;
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
    }>;
  };
};

export const PostDocument = gql`
  query Post($id: Int!, $isVerified: Boolean!) {
    post(id: $id) {
      ...PostCard
    }
  }
  ${PostCardFragmentDoc}
`;

/**
 * __usePostQuery__
 *
 * To run a query within a React component, call `usePostQuery` and pass it any options that fit your needs.
 * When your component renders, `usePostQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostQuery({
 *   variables: {
 *      id: // value for 'id'
 *      isVerified: // value for 'isVerified'
 *   },
 * });
 */
export function usePostQuery(
  baseOptions: Apollo.QueryHookOptions<PostQuery, PostQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<PostQuery, PostQueryVariables>(PostDocument, options);
}
export function usePostLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<PostQuery, PostQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<PostQuery, PostQueryVariables>(
    PostDocument,
    options,
  );
}
export type PostQueryHookResult = ReturnType<typeof usePostQuery>;
export type PostLazyQueryHookResult = ReturnType<typeof usePostLazyQuery>;
export type PostQueryResult = Apollo.QueryResult<PostQuery, PostQueryVariables>;
