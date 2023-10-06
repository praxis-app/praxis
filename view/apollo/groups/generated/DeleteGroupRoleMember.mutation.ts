import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../users/generated/UserAvatar.fragment';
import { GroupPermissionsFragmentDoc } from './GroupPermissions.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type DeleteGroupRoleMemberMutationVariables = Types.Exact<{
  groupRoleMemberData: Types.DeleteGroupRoleMemberInput;
}>;

export type DeleteGroupRoleMemberMutation = {
  __typename?: 'Mutation';
  deleteGroupRoleMember: {
    __typename?: 'DeleteGroupRoleMemberPayload';
    groupRole: {
      __typename?: 'GroupRole';
      id: number;
      availableUsersToAdd: Array<{
        __typename?: 'User';
        id: number;
        name: string;
        profilePicture: { __typename?: 'Image'; id: number };
      }>;
      group: {
        __typename?: 'Group';
        id: number;
        myPermissions: {
          __typename?: 'GroupPermissions';
          approveMemberRequests: boolean;
          createEvents: boolean;
          deleteGroup: boolean;
          manageComments: boolean;
          manageEvents: boolean;
          managePosts: boolean;
          manageRoles: boolean;
          manageSettings: boolean;
          removeMembers: boolean;
          updateGroup: boolean;
        };
      };
    };
  };
};

export const DeleteGroupRoleMemberDocument = gql`
  mutation DeleteGroupRoleMember(
    $groupRoleMemberData: DeleteGroupRoleMemberInput!
  ) {
    deleteGroupRoleMember(groupRoleMemberData: $groupRoleMemberData) {
      groupRole {
        id
        availableUsersToAdd {
          ...UserAvatar
        }
        group {
          id
          myPermissions {
            ...GroupPermissions
          }
        }
      }
    }
  }
  ${UserAvatarFragmentDoc}
  ${GroupPermissionsFragmentDoc}
`;
export type DeleteGroupRoleMemberMutationFn = Apollo.MutationFunction<
  DeleteGroupRoleMemberMutation,
  DeleteGroupRoleMemberMutationVariables
>;

/**
 * __useDeleteGroupRoleMemberMutation__
 *
 * To run a mutation, you first call `useDeleteGroupRoleMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGroupRoleMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGroupRoleMemberMutation, { data, loading, error }] = useDeleteGroupRoleMemberMutation({
 *   variables: {
 *      groupRoleMemberData: // value for 'groupRoleMemberData'
 *   },
 * });
 */
export function useDeleteGroupRoleMemberMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteGroupRoleMemberMutation,
    DeleteGroupRoleMemberMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteGroupRoleMemberMutation,
    DeleteGroupRoleMemberMutationVariables
  >(DeleteGroupRoleMemberDocument, options);
}
export type DeleteGroupRoleMemberMutationHookResult = ReturnType<
  typeof useDeleteGroupRoleMemberMutation
>;
export type DeleteGroupRoleMemberMutationResult =
  Apollo.MutationResult<DeleteGroupRoleMemberMutation>;
export type DeleteGroupRoleMemberMutationOptions = Apollo.BaseMutationOptions<
  DeleteGroupRoleMemberMutation,
  DeleteGroupRoleMemberMutationVariables
>;
