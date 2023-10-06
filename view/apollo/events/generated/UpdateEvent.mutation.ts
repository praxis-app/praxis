import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { EventPageCardFragmentDoc } from './EventPageCard.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UpdateEventMutationVariables = Types.Exact<{
  eventData: Types.UpdateEventInput;
  isLoggedIn?: Types.InputMaybe<Types.Scalars['Boolean']>;
}>;

export type UpdateEventMutation = {
  __typename?: 'Mutation';
  updateEvent: {
    __typename?: 'UpdateEventPayload';
    event: {
      __typename?: 'Event';
      id: number;
      name: string;
      description: string;
      location?: string | null;
      online: boolean;
      externalLink?: string | null;
      interestedCount: number;
      goingCount: number;
      startsAt: any;
      endsAt?: any | null;
      attendingStatus?: string | null;
      host: { __typename?: 'User'; id: number; name: string };
      coverPhoto: { __typename?: 'Image'; id: number };
      group?: {
        __typename?: 'Group';
        id: number;
        name: string;
        isJoinedByMe?: boolean;
        myPermissions?: {
          __typename?: 'GroupPermissions';
          manageEvents: boolean;
        };
      } | null;
    };
  };
};

export const UpdateEventDocument = gql`
  mutation UpdateEvent(
    $eventData: UpdateEventInput!
    $isLoggedIn: Boolean = true
  ) {
    updateEvent(eventData: $eventData) {
      event {
        ...EventPageCard
      }
    }
  }
  ${EventPageCardFragmentDoc}
`;
export type UpdateEventMutationFn = Apollo.MutationFunction<
  UpdateEventMutation,
  UpdateEventMutationVariables
>;

/**
 * __useUpdateEventMutation__
 *
 * To run a mutation, you first call `useUpdateEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEventMutation, { data, loading, error }] = useUpdateEventMutation({
 *   variables: {
 *      eventData: // value for 'eventData'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useUpdateEventMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateEventMutation,
    UpdateEventMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateEventMutation, UpdateEventMutationVariables>(
    UpdateEventDocument,
    options,
  );
}
export type UpdateEventMutationHookResult = ReturnType<
  typeof useUpdateEventMutation
>;
export type UpdateEventMutationResult =
  Apollo.MutationResult<UpdateEventMutation>;
export type UpdateEventMutationOptions = Apollo.BaseMutationOptions<
  UpdateEventMutation,
  UpdateEventMutationVariables
>;
