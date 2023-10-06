import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { EventCompactFragmentDoc } from '../../events/generated/EventCompact.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type GroupEventsTabQueryVariables = Types.Exact<{
  groupId: Types.Scalars['Int'];
  isLoggedIn: Types.Scalars['Boolean'];
}>;

export type GroupEventsTabQuery = {
  __typename?: 'Query';
  group: {
    __typename?: 'Group';
    futureEvents: Array<{
      __typename?: 'Event';
      id: number;
      name: string;
      description: string;
      startsAt: any;
      interestedCount: number;
      goingCount: number;
      online: boolean;
      location?: string | null;
      attendingStatus?: string | null;
      coverPhoto: { __typename?: 'Image'; id: number };
      group?: {
        __typename?: 'Group';
        id: number;
        isJoinedByMe?: boolean;
        myPermissions?: {
          __typename?: 'GroupPermissions';
          manageEvents: boolean;
        };
      } | null;
    }>;
    pastEvents: Array<{
      __typename?: 'Event';
      id: number;
      name: string;
      description: string;
      startsAt: any;
      interestedCount: number;
      goingCount: number;
      online: boolean;
      location?: string | null;
      attendingStatus?: string | null;
      coverPhoto: { __typename?: 'Image'; id: number };
      group?: {
        __typename?: 'Group';
        id: number;
        isJoinedByMe?: boolean;
        myPermissions?: {
          __typename?: 'GroupPermissions';
          manageEvents: boolean;
        };
      } | null;
    }>;
    myPermissions?: {
      __typename?: 'GroupPermissions';
      manageEvents: boolean;
      createEvents: boolean;
    };
  };
};

export const GroupEventsTabDocument = gql`
  query GroupEventsTab($groupId: Int!, $isLoggedIn: Boolean!) {
    group(id: $groupId) {
      futureEvents {
        ...EventCompact
      }
      pastEvents {
        ...EventCompact
      }
      myPermissions @include(if: $isLoggedIn) {
        manageEvents
        createEvents
      }
    }
  }
  ${EventCompactFragmentDoc}
`;

/**
 * __useGroupEventsTabQuery__
 *
 * To run a query within a React component, call `useGroupEventsTabQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupEventsTabQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupEventsTabQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useGroupEventsTabQuery(
  baseOptions: Apollo.QueryHookOptions<
    GroupEventsTabQuery,
    GroupEventsTabQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GroupEventsTabQuery, GroupEventsTabQueryVariables>(
    GroupEventsTabDocument,
    options,
  );
}
export function useGroupEventsTabLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GroupEventsTabQuery,
    GroupEventsTabQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GroupEventsTabQuery, GroupEventsTabQueryVariables>(
    GroupEventsTabDocument,
    options,
  );
}
export type GroupEventsTabQueryHookResult = ReturnType<
  typeof useGroupEventsTabQuery
>;
export type GroupEventsTabLazyQueryHookResult = ReturnType<
  typeof useGroupEventsTabLazyQuery
>;
export type GroupEventsTabQueryResult = Apollo.QueryResult<
  GroupEventsTabQuery,
  GroupEventsTabQueryVariables
>;
