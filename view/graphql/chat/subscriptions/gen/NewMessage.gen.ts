import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { MessageFragmentDoc } from '../../fragments/gen/Message.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type NewMessageSubscriptionVariables = Types.Exact<{
  conversationId: Types.Scalars['Int']['input'];
}>;

export type NewMessageSubscription = {
  __typename?: 'Subscription';
  newMessage: {
    __typename?: 'Message';
    id: number;
    body?: string | null;
    createdAt: any;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      displayName?: string | null;
      profilePicture: { __typename?: 'Image'; id: number };
    };
    images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
  };
};

export const NewMessageDocument = gql`
  subscription NewMessage($conversationId: Int!) {
    newMessage(conversationId: $conversationId) {
      ...Message
    }
  }
  ${MessageFragmentDoc}
`;

/**
 * __useNewMessageSubscription__
 *
 * To run a query within a React component, call `useNewMessageSubscription` and pass it any options that fit your needs.
 * When your component renders, `useNewMessageSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNewMessageSubscription({
 *   variables: {
 *      conversationId: // value for 'conversationId'
 *   },
 * });
 */
export function useNewMessageSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    NewMessageSubscription,
    NewMessageSubscriptionVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    NewMessageSubscription,
    NewMessageSubscriptionVariables
  >(NewMessageDocument, options);
}
export type NewMessageSubscriptionHookResult = ReturnType<
  typeof useNewMessageSubscription
>;
export type NewMessageSubscriptionResult =
  Apollo.SubscriptionResult<NewMessageSubscription>;
