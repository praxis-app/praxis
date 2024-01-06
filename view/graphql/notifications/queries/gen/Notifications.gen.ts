import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type NotificationsQueryVariables = Types.Exact<{
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;

export type NotificationsQuery = {
  __typename?: 'Query';
  notificationsCount: number;
  notifications: Array<{
    __typename?: 'Notification';
    id: number;
    actionType: string;
    status: string;
    createdAt: any;
    otherUser?: { __typename?: 'User'; id: number; name: string } | null;
  }>;
};

export const NotificationsDocument = gql`
  query Notifications($offset: Int, $limit: Int) {
    notifications(offset: $offset, limit: $limit) {
      id
      actionType
      status
      createdAt
      otherUser {
        id
        name
      }
    }
    notificationsCount
  }
`;

/**
 * __useNotificationsQuery__
 *
 * To run a query within a React component, call `useNotificationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useNotificationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNotificationsQuery({
 *   variables: {
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useNotificationsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    NotificationsQuery,
    NotificationsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<NotificationsQuery, NotificationsQueryVariables>(
    NotificationsDocument,
    options,
  );
}
export function useNotificationsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    NotificationsQuery,
    NotificationsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<NotificationsQuery, NotificationsQueryVariables>(
    NotificationsDocument,
    options,
  );
}
export type NotificationsQueryHookResult = ReturnType<
  typeof useNotificationsQuery
>;
export type NotificationsLazyQueryHookResult = ReturnType<
  typeof useNotificationsLazyQuery
>;
export type NotificationsQueryResult = Apollo.QueryResult<
  NotificationsQuery,
  NotificationsQueryVariables
>;
