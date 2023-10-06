import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type CreateEventAttendeeMutationVariables = Types.Exact<{
  eventAttendeeData: Types.CreateEventAttendeeInput;
}>;

export type CreateEventAttendeeMutation = {
  __typename?: 'Mutation';
  createEventAttendee: {
    __typename?: 'CreateEventAttendeePayload';
    event: {
      __typename?: 'Event';
      id: number;
      attendingStatus?: string | null;
      goingCount: number;
      interestedCount: number;
    };
  };
};

export const CreateEventAttendeeDocument = gql`
  mutation CreateEventAttendee($eventAttendeeData: CreateEventAttendeeInput!) {
    createEventAttendee(eventAttendeeData: $eventAttendeeData) {
      event {
        id
        attendingStatus
        goingCount
        interestedCount
      }
    }
  }
`;
export type CreateEventAttendeeMutationFn = Apollo.MutationFunction<
  CreateEventAttendeeMutation,
  CreateEventAttendeeMutationVariables
>;

/**
 * __useCreateEventAttendeeMutation__
 *
 * To run a mutation, you first call `useCreateEventAttendeeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEventAttendeeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEventAttendeeMutation, { data, loading, error }] = useCreateEventAttendeeMutation({
 *   variables: {
 *      eventAttendeeData: // value for 'eventAttendeeData'
 *   },
 * });
 */
export function useCreateEventAttendeeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateEventAttendeeMutation,
    CreateEventAttendeeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateEventAttendeeMutation,
    CreateEventAttendeeMutationVariables
  >(CreateEventAttendeeDocument, options);
}
export type CreateEventAttendeeMutationHookResult = ReturnType<
  typeof useCreateEventAttendeeMutation
>;
export type CreateEventAttendeeMutationResult =
  Apollo.MutationResult<CreateEventAttendeeMutation>;
export type CreateEventAttendeeMutationOptions = Apollo.BaseMutationOptions<
  CreateEventAttendeeMutation,
  CreateEventAttendeeMutationVariables
>;
