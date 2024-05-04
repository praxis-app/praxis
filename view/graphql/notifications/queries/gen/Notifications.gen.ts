import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { NotificationFragmentDoc } from '../../fragments/gen/Notification.gen';
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
    notificationType: string;
    status: string;
    createdAt: any;
    otherUser?: {
      __typename?: 'User';
      id: number;
      name: string;
      displayName?: string | null;
      profilePicture: { __typename?: 'Image'; id: number };
    } | null;
    post?: { __typename?: 'Post'; id: number } | null;
    proposal?: { __typename?: 'Proposal'; id: number } | null;
    group?: {
      __typename?: 'Group';
      id: number;
      name: string;
      coverPhoto?: { __typename?: 'Image'; id: number } | null;
    } | null;
    conversation?: {
      __typename?: 'Conversation';
      id: number;
      name?: string | null;
      unreadMessageCount: number;
    } | null;
    comment?: {
      __typename?: 'Comment';
      id: number;
      body?: string | null;
      post?: { __typename?: 'Post'; id: number } | null;
      proposal?: { __typename?: 'Proposal'; id: number } | null;
      question?: {
        __typename?: 'Question';
        id: number;
        questionnaireTicket: {
          __typename?: 'QuestionnaireTicket';
          id: number;
          user: { __typename?: 'User'; id: number };
        };
      } | null;
      questionnaireTicket?: {
        __typename?: 'QuestionnaireTicket';
        id: number;
        user: { __typename?: 'User'; id: number };
      } | null;
    } | null;
    questionnaireTicket?: {
      __typename?: 'QuestionnaireTicket';
      id: number;
    } | null;
    question?: {
      __typename?: 'Question';
      id: number;
      answer?: { __typename?: 'Answer'; id: number; text: string } | null;
    } | null;
  }>;
};

export const NotificationsDocument = gql`
  query Notifications($offset: Int, $limit: Int) {
    notifications(offset: $offset, limit: $limit) {
      ...Notification
    }
    notificationsCount
  }
  ${NotificationFragmentDoc}
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
