import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { NotificationFragmentDoc } from '../../fragments/gen/Notification.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type BulkUpdateNotificationsMutationVariables = Types.Exact<{
  notificationsData: Types.BulkUpdateNotificationsInput;
}>;

export type BulkUpdateNotificationsMutation = {
  __typename?: 'Mutation';
  bulkUpdateNotifications: {
    __typename?: 'BulkUpdateNotificationsPayload';
    notifications: Array<{
      __typename?: 'Notification';
      id: number;
      actionType: string;
      status: string;
      createdAt: any;
      otherUser?: {
        __typename?: 'User';
        id: number;
        name: string;
        profilePicture: { __typename?: 'Image'; id: number };
      } | null;
      proposal?: { __typename?: 'Proposal'; id: number } | null;
      post?: { __typename?: 'Post'; id: number } | null;
    }>;
  };
};

export const BulkUpdateNotificationsDocument = gql`
  mutation BulkUpdateNotifications(
    $notificationsData: BulkUpdateNotificationsInput!
  ) {
    bulkUpdateNotifications(notificationsData: $notificationsData) {
      notifications {
        ...Notification
      }
    }
  }
  ${NotificationFragmentDoc}
`;
export type BulkUpdateNotificationsMutationFn = Apollo.MutationFunction<
  BulkUpdateNotificationsMutation,
  BulkUpdateNotificationsMutationVariables
>;

/**
 * __useBulkUpdateNotificationsMutation__
 *
 * To run a mutation, you first call `useBulkUpdateNotificationsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkUpdateNotificationsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkUpdateNotificationsMutation, { data, loading, error }] = useBulkUpdateNotificationsMutation({
 *   variables: {
 *      notificationsData: // value for 'notificationsData'
 *   },
 * });
 */
export function useBulkUpdateNotificationsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    BulkUpdateNotificationsMutation,
    BulkUpdateNotificationsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    BulkUpdateNotificationsMutation,
    BulkUpdateNotificationsMutationVariables
  >(BulkUpdateNotificationsDocument, options);
}
export type BulkUpdateNotificationsMutationHookResult = ReturnType<
  typeof useBulkUpdateNotificationsMutation
>;
export type BulkUpdateNotificationsMutationResult =
  Apollo.MutationResult<BulkUpdateNotificationsMutation>;
export type BulkUpdateNotificationsMutationOptions = Apollo.BaseMutationOptions<
  BulkUpdateNotificationsMutation,
  BulkUpdateNotificationsMutationVariables
>;
