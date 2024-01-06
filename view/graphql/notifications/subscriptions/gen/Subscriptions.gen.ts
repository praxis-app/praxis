import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type NotificationsSubscriptionVariables = Types.Exact<{
  [key: string]: never;
}>;

export type NotificationsSubscription = {
  __typename?: 'Subscription';
  notifications: {
    __typename?: 'Notification';
    id: number;
    message: string;
    status: string;
    createdAt: any;
  };
};

export const NotificationsDocument = gql`
  subscription Notifications {
    notifications {
      id
      message
      status
      createdAt
    }
  }
`;

/**
 * __useNotificationsSubscription__
 *
 * To run a query within a React component, call `useNotificationsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useNotificationsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNotificationsSubscription({
 *   variables: {
 *   },
 * });
 */
export function useNotificationsSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    NotificationsSubscription,
    NotificationsSubscriptionVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    NotificationsSubscription,
    NotificationsSubscriptionVariables
  >(NotificationsDocument, options);
}
export type NotificationsSubscriptionHookResult = ReturnType<
  typeof useNotificationsSubscription
>;
export type NotificationsSubscriptionResult =
  Apollo.SubscriptionResult<NotificationsSubscription>;
