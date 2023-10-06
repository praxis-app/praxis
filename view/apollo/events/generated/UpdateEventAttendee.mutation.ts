import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UpdateEventAttendeeMutationVariables = Types.Exact<{
  eventAttendeeData: Types.UpdateEventAttendeeInput;
}>;

export type UpdateEventAttendeeMutation = {
  __typename?: 'Mutation';
  updateEventAttendee: {
    __typename?: 'UpdateEventAttendeePayload';
    event: {
      __typename?: 'Event';
      id: number;
      attendingStatus?: string | null;
      goingCount: number;
      interestedCount: number;
    };
  };
};

export const UpdateEventAttendeeDocument = gql`
  mutation UpdateEventAttendee($eventAttendeeData: UpdateEventAttendeeInput!) {
    updateEventAttendee(eventAttendeeData: $eventAttendeeData) {
      event {
        id
        attendingStatus
        goingCount
        interestedCount
      }
    }
  }
`;
export type UpdateEventAttendeeMutationFn = Apollo.MutationFunction<
  UpdateEventAttendeeMutation,
  UpdateEventAttendeeMutationVariables
>;

/**
 * __useUpdateEventAttendeeMutation__
 *
 * To run a mutation, you first call `useUpdateEventAttendeeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEventAttendeeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEventAttendeeMutation, { data, loading, error }] = useUpdateEventAttendeeMutation({
 *   variables: {
 *      eventAttendeeData: // value for 'eventAttendeeData'
 *   },
 * });
 */
export function useUpdateEventAttendeeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateEventAttendeeMutation,
    UpdateEventAttendeeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateEventAttendeeMutation,
    UpdateEventAttendeeMutationVariables
  >(UpdateEventAttendeeDocument, options);
}
export type UpdateEventAttendeeMutationHookResult = ReturnType<
  typeof useUpdateEventAttendeeMutation
>;
export type UpdateEventAttendeeMutationResult =
  Apollo.MutationResult<UpdateEventAttendeeMutation>;
export type UpdateEventAttendeeMutationOptions = Apollo.BaseMutationOptions<
  UpdateEventAttendeeMutation,
  UpdateEventAttendeeMutationVariables
>;
