import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { EventPageCardFragmentDoc } from './EventPageCard.fragment';
import { PostCardFragmentDoc } from '../../posts/generated/PostCard.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type EventPageQueryVariables = Types.Exact<{
  id: Types.Scalars['Int'];
  isLoggedIn: Types.Scalars['Boolean'];
}>;

export type EventPageQuery = {
  __typename?: 'Query';
  event: {
    __typename?: 'Event';
    id: number;
    name: string;
    description: string;
    location?: string | null;
    online: boolean;
    externalLink?: string | null;
    interestedCount: number;
    goingCount: number;
    startsAt: any;
    endsAt?: any | null;
    attendingStatus?: string | null;
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
    group?: {
      __typename?: 'Group';
      id: number;
      name: string;
      isJoinedByMe?: boolean;
      myPermissions?: {
        __typename?: 'GroupPermissions';
        manageEvents: boolean;
      };
    } | null;
    host: { __typename?: 'User'; id: number; name: string };
    coverPhoto: { __typename?: 'Image'; id: number };
  };
  me?: {
    __typename?: 'User';
    id: number;
    serverPermissions: {
      __typename?: 'ServerPermissions';
      manageEvents: boolean;
    };
  };
};

export const EventPageDocument = gql`
  query EventPage($id: Int!, $isLoggedIn: Boolean!) {
    event(id: $id) {
      ...EventPageCard
      posts {
        ...PostCard
      }
      group {
        id
        name
      }
    }
    me @include(if: $isLoggedIn) {
      id
      serverPermissions {
        manageEvents
      }
    }
  }
  ${EventPageCardFragmentDoc}
  ${PostCardFragmentDoc}
`;

/**
 * __useEventPageQuery__
 *
 * To run a query within a React component, call `useEventPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useEventPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEventPageQuery({
 *   variables: {
 *      id: // value for 'id'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useEventPageQuery(
  baseOptions: Apollo.QueryHookOptions<EventPageQuery, EventPageQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<EventPageQuery, EventPageQueryVariables>(
    EventPageDocument,
    options,
  );
}
export function useEventPageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    EventPageQuery,
    EventPageQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<EventPageQuery, EventPageQueryVariables>(
    EventPageDocument,
    options,
  );
}
export type EventPageQueryHookResult = ReturnType<typeof useEventPageQuery>;
export type EventPageLazyQueryHookResult = ReturnType<
  typeof useEventPageLazyQuery
>;
export type EventPageQueryResult = Apollo.QueryResult<
  EventPageQuery,
  EventPageQueryVariables
>;
