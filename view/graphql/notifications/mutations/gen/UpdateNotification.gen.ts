import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { NotificationFragmentDoc } from '../../fragments/gen/Notification.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UpdateNotificationMutationVariables = Types.Exact<{
  notificationData: Types.UpdateNotificationInput;
}>;

export type UpdateNotificationMutation = {
  __typename?: 'Mutation';
  updateNotification: {
    __typename?: 'UpdateNotificationPayload';
    notification: {
      __typename?: 'Notification';
      id: number;
      status: string;
      notificationType: string;
      unreadMessageCount?: number | null;
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
        name: string;
        group?: { __typename?: 'Group'; id: number; name: string } | null;
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
    };
  };
};

export const UpdateNotificationDocument = gql`
  mutation UpdateNotification($notificationData: UpdateNotificationInput!) {
    updateNotification(notificationData: $notificationData) {
      notification {
        ...Notification
      }
    }
  }
  ${NotificationFragmentDoc}
`;
export type UpdateNotificationMutationFn = Apollo.MutationFunction<
  UpdateNotificationMutation,
  UpdateNotificationMutationVariables
>;

/**
 * __useUpdateNotificationMutation__
 *
 * To run a mutation, you first call `useUpdateNotificationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNotificationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNotificationMutation, { data, loading, error }] = useUpdateNotificationMutation({
 *   variables: {
 *      notificationData: // value for 'notificationData'
 *   },
 * });
 */
export function useUpdateNotificationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateNotificationMutation,
    UpdateNotificationMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateNotificationMutation,
    UpdateNotificationMutationVariables
  >(UpdateNotificationDocument, options);
}
export type UpdateNotificationMutationHookResult = ReturnType<
  typeof useUpdateNotificationMutation
>;
export type UpdateNotificationMutationResult =
  Apollo.MutationResult<UpdateNotificationMutation>;
export type UpdateNotificationMutationOptions = Apollo.BaseMutationOptions<
  UpdateNotificationMutation,
  UpdateNotificationMutationVariables
>;
