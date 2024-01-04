import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { PostCardFragmentDoc } from '../../../posts/fragments/gen/PostCard.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type EventFeedQueryVariables = Types.Exact<{
  eventId: Types.Scalars['Int']['input'];
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  isLoggedIn: Types.Scalars['Boolean']['input'];
}>;

export type EventFeedQuery = {
  __typename?: 'Query';
  event: {
    __typename?: 'Event';
    id: number;
    postsCount: number;
    posts: Array<{
      __typename?: 'Post';
      id: number;
      body?: string | null;
      likesCount: number;
      commentCount: number;
      isLikedByMe?: boolean;
      createdAt: any;
      images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
      user: {
        __typename?: 'User';
        id: number;
        name: string;
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
    }>;
  };
};

export const EventFeedDocument = gql`
  query EventFeed(
    $eventId: Int!
    $offset: Int
    $limit: Int
    $isLoggedIn: Boolean!
  ) {
    event(id: $eventId) {
      id
      posts(offset: $offset, limit: $limit) {
        ...PostCard
      }
      postsCount
    }
  }
  ${PostCardFragmentDoc}
`;

/**
 * __useEventFeedQuery__
 *
 * To run a query within a React component, call `useEventFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useEventFeedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEventFeedQuery({
 *   variables: {
 *      eventId: // value for 'eventId'
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useEventFeedQuery(
  baseOptions: Apollo.QueryHookOptions<EventFeedQuery, EventFeedQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<EventFeedQuery, EventFeedQueryVariables>(
    EventFeedDocument,
    options,
  );
}
export function useEventFeedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    EventFeedQuery,
    EventFeedQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<EventFeedQuery, EventFeedQueryVariables>(
    EventFeedDocument,
    options,
  );
}
export type EventFeedQueryHookResult = ReturnType<typeof useEventFeedQuery>;
export type EventFeedLazyQueryHookResult = ReturnType<
  typeof useEventFeedLazyQuery
>;
export type EventFeedQueryResult = Apollo.QueryResult<
  EventFeedQuery,
  EventFeedQueryVariables
>;
