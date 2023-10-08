import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { EventCompactFragmentDoc } from './EventCompact.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type CreateEventMutationVariables = Types.Exact<{
  eventData: Types.CreateEventInput;
  isLoggedIn?: Types.InputMaybe<Types.Scalars['Boolean']>;
}>;

export type CreateEventMutation = {
  __typename?: 'Mutation';
  createEvent: {
    __typename?: 'CreateEventPayload';
    event: {
      __typename?: 'Event';
      id: number;
      name: string;
      description: string;
      startsAt: any;
      interestedCount: number;
      goingCount: number;
      online: boolean;
      location?: string | null;
      attendingStatus?: string | null;
      coverPhoto: { __typename?: 'Image'; id: number };
      group?: {
        __typename?: 'Group';
        id: number;
        isJoinedByMe?: boolean;
        myPermissions?: {
          __typename?: 'GroupPermissions';
          manageEvents: boolean;
        };
      } | null;
    };
  };
};

export const CreateEventDocument = gql`
  mutation CreateEvent(
    $eventData: CreateEventInput!
    $isLoggedIn: Boolean = true
  ) {
    createEvent(eventData: $eventData) {
      event {
        ...EventCompact
      }
    }
  }
  ${EventCompactFragmentDoc}
`;
export type CreateEventMutationFn = Apollo.MutationFunction<
  CreateEventMutation,
  CreateEventMutationVariables
>;

/**
 * __useCreateEventMutation__
 *
 * To run a mutation, you first call `useCreateEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEventMutation, { data, loading, error }] = useCreateEventMutation({
 *   variables: {
 *      eventData: // value for 'eventData'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useCreateEventMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateEventMutation,
    CreateEventMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateEventMutation, CreateEventMutationVariables>(
    CreateEventDocument,
    options,
  );
}
export type CreateEventMutationHookResult = ReturnType<
  typeof useCreateEventMutation
>;
export type CreateEventMutationResult =
  Apollo.MutationResult<CreateEventMutation>;
export type CreateEventMutationOptions = Apollo.BaseMutationOptions<
  CreateEventMutation,
  CreateEventMutationVariables
>;
