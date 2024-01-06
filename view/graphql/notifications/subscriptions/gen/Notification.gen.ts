import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type NotificationSubscriptionVariables = Types.Exact<{
  [key: string]: never;
}>;

export type NotificationSubscription = {
  __typename?: 'Subscription';
  notification: {
    __typename?: 'Notification';
    id: number;
    actionType: string;
    status: string;
    createdAt: any;
  };
};

export const NotificationDocument = gql`
  subscription Notification {
    notification {
      id
      actionType
      status
      createdAt
    }
  }
`;

/**
 * __useNotificationSubscription__
 *
 * To run a query within a React component, call `useNotificationSubscription` and pass it any options that fit your needs.
 * When your component renders, `useNotificationSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNotificationSubscription({
 *   variables: {
 *   },
 * });
 */
export function useNotificationSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    NotificationSubscription,
    NotificationSubscriptionVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    NotificationSubscription,
    NotificationSubscriptionVariables
  >(NotificationDocument, options);
}
export type NotificationSubscriptionHookResult = ReturnType<
  typeof useNotificationSubscription
>;
export type NotificationSubscriptionResult =
  Apollo.SubscriptionResult<NotificationSubscription>;
