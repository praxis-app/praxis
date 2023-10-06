import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../users/generated/UserAvatar.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type CreateGroupMemberRequestMutationVariables = Types.Exact<{
  groupId: Types.Scalars['Int'];
}>;

export type CreateGroupMemberRequestMutation = {
  __typename?: 'Mutation';
  createGroupMemberRequest: {
    __typename?: 'CreateGroupMemberRequestPayload';
    groupMemberRequest: {
      __typename?: 'GroupMemberRequest';
      id: number;
      group: { __typename?: 'Group'; id: number; name: string };
      user: {
        __typename?: 'User';
        id: number;
        name: string;
        profilePicture: { __typename?: 'Image'; id: number };
      };
    };
  };
};

export const CreateGroupMemberRequestDocument = gql`
  mutation CreateGroupMemberRequest($groupId: Int!) {
    createGroupMemberRequest(groupId: $groupId) {
      groupMemberRequest {
        id
        group {
          id
          name
        }
        user {
          ...UserAvatar
        }
      }
    }
  }
  ${UserAvatarFragmentDoc}
`;
export type CreateGroupMemberRequestMutationFn = Apollo.MutationFunction<
  CreateGroupMemberRequestMutation,
  CreateGroupMemberRequestMutationVariables
>;

/**
 * __useCreateGroupMemberRequestMutation__
 *
 * To run a mutation, you first call `useCreateGroupMemberRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupMemberRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupMemberRequestMutation, { data, loading, error }] = useCreateGroupMemberRequestMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useCreateGroupMemberRequestMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateGroupMemberRequestMutation,
    CreateGroupMemberRequestMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateGroupMemberRequestMutation,
    CreateGroupMemberRequestMutationVariables
  >(CreateGroupMemberRequestDocument, options);
}
export type CreateGroupMemberRequestMutationHookResult = ReturnType<
  typeof useCreateGroupMemberRequestMutation
>;
export type CreateGroupMemberRequestMutationResult =
  Apollo.MutationResult<CreateGroupMemberRequestMutation>;
export type CreateGroupMemberRequestMutationOptions =
  Apollo.BaseMutationOptions<
    CreateGroupMemberRequestMutation,
    CreateGroupMemberRequestMutationVariables
  >;
