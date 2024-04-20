import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { NotificationFragmentDoc } from '../../fragments/gen/Notification.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type NotifiedSubscriptionVariables = Types.Exact<{
  [key: string]: never;
}>;

export type NotifiedSubscription = {
  __typename?: 'Subscription';
  notification: {
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
    group?: {
      __typename?: 'Group';
      id: number;
      name: string;
      coverPhoto?: { __typename?: 'Image'; id: number } | null;
    } | null;
    proposal?: { __typename?: 'Proposal'; id: number } | null;
    post?: { __typename?: 'Post'; id: number } | null;
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
  };
};

export const NotifiedDocument = gql`
  subscription Notified {
    notification {
      ...Notification
    }
  }
  ${NotificationFragmentDoc}
`;

/**
 * __useNotifiedSubscription__
 *
 * To run a query within a React component, call `useNotifiedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useNotifiedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNotifiedSubscription({
 *   variables: {
 *   },
 * });
 */
export function useNotifiedSubscription(
  baseOptions?: Apollo.SubscriptionHookOptions<
    NotifiedSubscription,
    NotifiedSubscriptionVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    NotifiedSubscription,
    NotifiedSubscriptionVariables
  >(NotifiedDocument, options);
}
export type NotifiedSubscriptionHookResult = ReturnType<
  typeof useNotifiedSubscription
>;
export type NotifiedSubscriptionResult =
  Apollo.SubscriptionResult<NotifiedSubscription>;
