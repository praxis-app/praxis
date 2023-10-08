import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type LeaveGroupMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type LeaveGroupMutation = {
  __typename?: 'Mutation';
  leaveGroup: boolean;
};

export const LeaveGroupDocument = gql`
  mutation LeaveGroup($id: Int!) {
    leaveGroup(id: $id)
  }
`;
export type LeaveGroupMutationFn = Apollo.MutationFunction<
  LeaveGroupMutation,
  LeaveGroupMutationVariables
>;

/**
 * __useLeaveGroupMutation__
 *
 * To run a mutation, you first call `useLeaveGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLeaveGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [leaveGroupMutation, { data, loading, error }] = useLeaveGroupMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useLeaveGroupMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LeaveGroupMutation,
    LeaveGroupMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<LeaveGroupMutation, LeaveGroupMutationVariables>(
    LeaveGroupDocument,
    options,
  );
}
export type LeaveGroupMutationHookResult = ReturnType<
  typeof useLeaveGroupMutation
>;
export type LeaveGroupMutationResult =
  Apollo.MutationResult<LeaveGroupMutation>;
export type LeaveGroupMutationOptions = Apollo.BaseMutationOptions<
  LeaveGroupMutation,
  LeaveGroupMutationVariables
>;
