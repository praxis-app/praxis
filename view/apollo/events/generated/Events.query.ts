import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { EventCompactFragmentDoc } from './EventCompact.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type EventsQueryVariables = Types.Exact<{
  input: Types.EventsInput;
  isLoggedIn: Types.Scalars['Boolean'];
}>;

export type EventsQuery = {
  __typename?: 'Query';
  events: Array<{
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
};

export const EventsDocument = gql`
  query Events($input: EventsInput!, $isLoggedIn: Boolean!) {
    events(input: $input) {
      ...EventCompact
    }
  }
  ${EventCompactFragmentDoc}
`;

/**
 * __useEventsQuery__
 *
 * To run a query within a React component, call `useEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEventsQuery({
 *   variables: {
 *      input: // value for 'input'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useEventsQuery(
  baseOptions: Apollo.QueryHookOptions<EventsQuery, EventsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<EventsQuery, EventsQueryVariables>(
    EventsDocument,
    options,
  );
}
export function useEventsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<EventsQuery, EventsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<EventsQuery, EventsQueryVariables>(
    EventsDocument,
    options,
  );
}
export type EventsQueryHookResult = ReturnType<typeof useEventsQuery>;
export type EventsLazyQueryHookResult = ReturnType<typeof useEventsLazyQuery>;
export type EventsQueryResult = Apollo.QueryResult<
  EventsQuery,
  EventsQueryVariables
>;
