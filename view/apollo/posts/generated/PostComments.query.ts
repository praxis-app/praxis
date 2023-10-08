import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { CommentFragmentDoc } from '../../comments/generated/Comment.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type PostCommentsQueryVariables = Types.Exact<{
  id: Types.Scalars['Int'];
  isLoggedIn: Types.Scalars['Boolean'];
  withGroup: Types.Scalars['Boolean'];
  groupId?: Types.InputMaybe<Types.Scalars['Int']>;
  withEvent: Types.Scalars['Boolean'];
  eventId?: Types.InputMaybe<Types.Scalars['Int']>;
}>;

export type PostCommentsQuery = {
  __typename?: 'Query';
  post: {
    __typename?: 'Post';
    id: number;
    comments: Array<{
      __typename?: 'Comment';
      id: number;
      body?: string | null;
      images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
      user: {
        __typename?: 'User';
        id: number;
        name: string;
        profilePicture: { __typename?: 'Image'; id: number };
      };
    }>;
  };
  me?: {
    __typename?: 'User';
    id: number;
    serverPermissions: {
      __typename?: 'ServerPermissions';
      manageComments: boolean;
    };
  };
  group?: {
    __typename?: 'Group';
    id: number;
    isJoinedByMe?: boolean;
    myPermissions?: {
      __typename?: 'GroupPermissions';
      manageComments: boolean;
    };
  };
  event?: {
    __typename?: 'Event';
    id: number;
    group?: {
      __typename?: 'Group';
      id: number;
      isJoinedByMe?: boolean;
      myPermissions?: {
        __typename?: 'GroupPermissions';
        manageComments: boolean;
      };
    } | null;
  };
};

export const PostCommentsDocument = gql`
  query PostComments(
    $id: Int!
    $isLoggedIn: Boolean!
    $withGroup: Boolean!
    $groupId: Int
    $withEvent: Boolean!
    $eventId: Int
  ) {
    post(id: $id) {
      id
      comments {
        ...Comment
      }
    }
    me @include(if: $isLoggedIn) {
      id
      serverPermissions {
        manageComments
      }
    }
    group(id: $groupId) @include(if: $withGroup) {
      id
      isJoinedByMe @include(if: $isLoggedIn)
      myPermissions @include(if: $isLoggedIn) {
        manageComments
      }
    }
    event(id: $eventId) @include(if: $withEvent) {
      id
      group {
        id
        isJoinedByMe @include(if: $isLoggedIn)
        myPermissions @include(if: $isLoggedIn) {
          manageComments
        }
      }
    }
  }
  ${CommentFragmentDoc}
`;

/**
 * __usePostCommentsQuery__
 *
 * To run a query within a React component, call `usePostCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `usePostCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostCommentsQuery({
 *   variables: {
 *      id: // value for 'id'
 *      isLoggedIn: // value for 'isLoggedIn'
 *      withGroup: // value for 'withGroup'
 *      groupId: // value for 'groupId'
 *      withEvent: // value for 'withEvent'
 *      eventId: // value for 'eventId'
 *   },
 * });
 */
export function usePostCommentsQuery(
  baseOptions: Apollo.QueryHookOptions<
    PostCommentsQuery,
    PostCommentsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<PostCommentsQuery, PostCommentsQueryVariables>(
    PostCommentsDocument,
    options,
  );
}
export function usePostCommentsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    PostCommentsQuery,
    PostCommentsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<PostCommentsQuery, PostCommentsQueryVariables>(
    PostCommentsDocument,
    options,
  );
}
export type PostCommentsQueryHookResult = ReturnType<
  typeof usePostCommentsQuery
>;
export type PostCommentsLazyQueryHookResult = ReturnType<
  typeof usePostCommentsLazyQuery
>;
export type PostCommentsQueryResult = Apollo.QueryResult<
  PostCommentsQuery,
  PostCommentsQueryVariables
>;
