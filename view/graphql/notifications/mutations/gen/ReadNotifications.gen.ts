import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { NotificationFragmentDoc } from '../../fragments/gen/Notification.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ReadNotificationsMutationVariables = Types.Exact<{
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;

export type ReadNotificationsMutation = {
  __typename?: 'Mutation';
  readNotifications: {
    __typename?: 'ReadNotificationsPayload';
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
          __typename?: 'QuestionnaireTicketQuestion';
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
      question?: {
        __typename?: 'QuestionnaireTicketQuestion';
        id: number;
        answer?: { __typename?: 'Answer'; id: number; text: string } | null;
      } | null;
    }>;
  };
};

export const ReadNotificationsDocument = gql`
  mutation ReadNotifications($offset: Int, $limit: Int) {
    readNotifications(offset: $offset, limit: $limit) {
      notifications {
        ...Notification
      }
    }
  }
  ${NotificationFragmentDoc}
`;
export type ReadNotificationsMutationFn = Apollo.MutationFunction<
  ReadNotificationsMutation,
  ReadNotificationsMutationVariables
>;

/**
 * __useReadNotificationsMutation__
 *
 * To run a mutation, you first call `useReadNotificationsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReadNotificationsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [readNotificationsMutation, { data, loading, error }] = useReadNotificationsMutation({
 *   variables: {
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useReadNotificationsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ReadNotificationsMutation,
    ReadNotificationsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ReadNotificationsMutation,
    ReadNotificationsMutationVariables
  >(ReadNotificationsDocument, options);
}
export type ReadNotificationsMutationHookResult = ReturnType<
  typeof useReadNotificationsMutation
>;
export type ReadNotificationsMutationResult =
  Apollo.MutationResult<ReadNotificationsMutation>;
export type ReadNotificationsMutationOptions = Apollo.BaseMutationOptions<
  ReadNotificationsMutation,
  ReadNotificationsMutationVariables
>;
