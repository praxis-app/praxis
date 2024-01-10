import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UnreadNotificationsQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type UnreadNotificationsQuery = {
  __typename?: 'Query';
  unreadNotificationsCount: number;
};

export const UnreadNotificationsDocument = gql`
  query UnreadNotifications {
    unreadNotificationsCount
  }
`;

/**
 * __useUnreadNotificationsQuery__
 *
 * To run a query within a React component, call `useUnreadNotificationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUnreadNotificationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUnreadNotificationsQuery({
 *   variables: {
 *   },
 * });
 */
export function useUnreadNotificationsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    UnreadNotificationsQuery,
    UnreadNotificationsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    UnreadNotificationsQuery,
    UnreadNotificationsQueryVariables
  >(UnreadNotificationsDocument, options);
}
export function useUnreadNotificationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    UnreadNotificationsQuery,
    UnreadNotificationsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    UnreadNotificationsQuery,
    UnreadNotificationsQueryVariables
  >(UnreadNotificationsDocument, options);
}
export type UnreadNotificationsQueryHookResult = ReturnType<
  typeof useUnreadNotificationsQuery
>;
export type UnreadNotificationsLazyQueryHookResult = ReturnType<
  typeof useUnreadNotificationsLazyQuery
>;
export type UnreadNotificationsQueryResult = Apollo.QueryResult<
  UnreadNotificationsQuery,
  UnreadNotificationsQueryVariables
>;
