import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type CancelGroupMemberRequestMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type CancelGroupMemberRequestMutation = {
  __typename?: 'Mutation';
  cancelGroupMemberRequest: boolean;
};

export const CancelGroupMemberRequestDocument = gql`
  mutation CancelGroupMemberRequest($id: Int!) {
    cancelGroupMemberRequest(id: $id)
  }
`;
export type CancelGroupMemberRequestMutationFn = Apollo.MutationFunction<
  CancelGroupMemberRequestMutation,
  CancelGroupMemberRequestMutationVariables
>;

/**
 * __useCancelGroupMemberRequestMutation__
 *
 * To run a mutation, you first call `useCancelGroupMemberRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelGroupMemberRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelGroupMemberRequestMutation, { data, loading, error }] = useCancelGroupMemberRequestMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCancelGroupMemberRequestMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CancelGroupMemberRequestMutation,
    CancelGroupMemberRequestMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CancelGroupMemberRequestMutation,
    CancelGroupMemberRequestMutationVariables
  >(CancelGroupMemberRequestDocument, options);
}
export type CancelGroupMemberRequestMutationHookResult = ReturnType<
  typeof useCancelGroupMemberRequestMutation
>;
export type CancelGroupMemberRequestMutationResult =
  Apollo.MutationResult<CancelGroupMemberRequestMutation>;
export type CancelGroupMemberRequestMutationOptions =
  Apollo.BaseMutationOptions<
    CancelGroupMemberRequestMutation,
    CancelGroupMemberRequestMutationVariables
  >;
