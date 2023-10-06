import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type DeleteEventAttendeeMutationVariables = Types.Exact<{
  eventId: Types.Scalars['Int'];
}>;

export type DeleteEventAttendeeMutation = {
  __typename?: 'Mutation';
  deleteEventAttendee: boolean;
};

export const DeleteEventAttendeeDocument = gql`
  mutation DeleteEventAttendee($eventId: Int!) {
    deleteEventAttendee(eventId: $eventId)
  }
`;
export type DeleteEventAttendeeMutationFn = Apollo.MutationFunction<
  DeleteEventAttendeeMutation,
  DeleteEventAttendeeMutationVariables
>;

/**
 * __useDeleteEventAttendeeMutation__
 *
 * To run a mutation, you first call `useDeleteEventAttendeeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteEventAttendeeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteEventAttendeeMutation, { data, loading, error }] = useDeleteEventAttendeeMutation({
 *   variables: {
 *      eventId: // value for 'eventId'
 *   },
 * });
 */
export function useDeleteEventAttendeeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteEventAttendeeMutation,
    DeleteEventAttendeeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteEventAttendeeMutation,
    DeleteEventAttendeeMutationVariables
  >(DeleteEventAttendeeDocument, options);
}
export type DeleteEventAttendeeMutationHookResult = ReturnType<
  typeof useDeleteEventAttendeeMutation
>;
export type DeleteEventAttendeeMutationResult =
  Apollo.MutationResult<DeleteEventAttendeeMutation>;
export type DeleteEventAttendeeMutationOptions = Apollo.BaseMutationOptions<
  DeleteEventAttendeeMutation,
  DeleteEventAttendeeMutationVariables
>;
