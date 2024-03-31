import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type SendPasswordResetMutationVariables = Types.Exact<{
  email: Types.Scalars['String']['input'];
}>;

export type SendPasswordResetMutation = {
  __typename?: 'Mutation';
  sendPasswordReset: boolean;
};

export const SendPasswordResetDocument = gql`
  mutation SendPasswordReset($email: String!) {
    sendPasswordReset(email: $email)
  }
`;
export type SendPasswordResetMutationFn = Apollo.MutationFunction<
  SendPasswordResetMutation,
  SendPasswordResetMutationVariables
>;

/**
 * __useSendPasswordResetMutation__
 *
 * To run a mutation, you first call `useSendPasswordResetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendPasswordResetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendPasswordResetMutation, { data, loading, error }] = useSendPasswordResetMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useSendPasswordResetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SendPasswordResetMutation,
    SendPasswordResetMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SendPasswordResetMutation,
    SendPasswordResetMutationVariables
  >(SendPasswordResetDocument, options);
}
export type SendPasswordResetMutationHookResult = ReturnType<
  typeof useSendPasswordResetMutation
>;
export type SendPasswordResetMutationResult =
  Apollo.MutationResult<SendPasswordResetMutation>;
export type SendPasswordResetMutationOptions = Apollo.BaseMutationOptions<
  SendPasswordResetMutation,
  SendPasswordResetMutationVariables
>;
