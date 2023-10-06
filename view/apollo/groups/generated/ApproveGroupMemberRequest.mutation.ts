import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../users/generated/UserAvatar.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ApproveGroupMemberRequestMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type ApproveGroupMemberRequestMutation = {
  __typename?: 'Mutation';
  approveGroupMemberRequest: {
    __typename?: 'ApproveGroupMemberRequestPayload';
    groupMember: {
      __typename?: 'User';
      id: number;
      name: string;
      profilePicture: { __typename?: 'Image'; id: number };
    };
  };
};

export const ApproveGroupMemberRequestDocument = gql`
  mutation ApproveGroupMemberRequest($id: Int!) {
    approveGroupMemberRequest(id: $id) {
      groupMember {
        id
        ...UserAvatar
      }
    }
  }
  ${UserAvatarFragmentDoc}
`;
export type ApproveGroupMemberRequestMutationFn = Apollo.MutationFunction<
  ApproveGroupMemberRequestMutation,
  ApproveGroupMemberRequestMutationVariables
>;

/**
 * __useApproveGroupMemberRequestMutation__
 *
 * To run a mutation, you first call `useApproveGroupMemberRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApproveGroupMemberRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [approveGroupMemberRequestMutation, { data, loading, error }] = useApproveGroupMemberRequestMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useApproveGroupMemberRequestMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ApproveGroupMemberRequestMutation,
    ApproveGroupMemberRequestMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ApproveGroupMemberRequestMutation,
    ApproveGroupMemberRequestMutationVariables
  >(ApproveGroupMemberRequestDocument, options);
}
export type ApproveGroupMemberRequestMutationHookResult = ReturnType<
  typeof useApproveGroupMemberRequestMutation
>;
export type ApproveGroupMemberRequestMutationResult =
  Apollo.MutationResult<ApproveGroupMemberRequestMutation>;
export type ApproveGroupMemberRequestMutationOptions =
  Apollo.BaseMutationOptions<
    ApproveGroupMemberRequestMutation,
    ApproveGroupMemberRequestMutationVariables
  >;
