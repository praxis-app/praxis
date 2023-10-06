import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type DenyGroupMemberRequestMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type DenyGroupMemberRequestMutation = {
  __typename?: 'Mutation';
  denyGroupMemberRequest: boolean;
};

export const DenyGroupMemberRequestDocument = gql`
  mutation DenyGroupMemberRequest($id: Int!) {
    denyGroupMemberRequest(id: $id)
  }
`;
export type DenyGroupMemberRequestMutationFn = Apollo.MutationFunction<
  DenyGroupMemberRequestMutation,
  DenyGroupMemberRequestMutationVariables
>;

/**
 * __useDenyGroupMemberRequestMutation__
 *
 * To run a mutation, you first call `useDenyGroupMemberRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDenyGroupMemberRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [denyGroupMemberRequestMutation, { data, loading, error }] = useDenyGroupMemberRequestMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDenyGroupMemberRequestMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DenyGroupMemberRequestMutation,
    DenyGroupMemberRequestMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DenyGroupMemberRequestMutation,
    DenyGroupMemberRequestMutationVariables
  >(DenyGroupMemberRequestDocument, options);
}
export type DenyGroupMemberRequestMutationHookResult = ReturnType<
  typeof useDenyGroupMemberRequestMutation
>;
export type DenyGroupMemberRequestMutationResult =
  Apollo.MutationResult<DenyGroupMemberRequestMutation>;
export type DenyGroupMemberRequestMutationOptions = Apollo.BaseMutationOptions<
  DenyGroupMemberRequestMutation,
  DenyGroupMemberRequestMutationVariables
>;
