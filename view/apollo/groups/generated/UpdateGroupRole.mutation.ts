import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { GroupRoleFragmentDoc } from './GroupRole.fragment';
import { GroupRolePermissionsFragmentDoc } from './GroupRolePermissions.fragment';
import { RoleMemberFragmentDoc } from '../../roles/generated/RoleMember.fragment';
import { UserAvatarFragmentDoc } from '../../users/generated/UserAvatar.fragment';
import { GroupPermissionsFragmentDoc } from './GroupPermissions.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UpdateGroupRoleMutationVariables = Types.Exact<{
  groupRoleData: Types.UpdateGroupRoleInput;
}>;

export type UpdateGroupRoleMutation = {
  __typename?: 'Mutation';
  updateGroupRole: {
    __typename?: 'UpdateGroupRolePayload';
    groupRole: {
      __typename?: 'GroupRole';
      id: number;
      name: string;
      color: string;
      memberCount: number;
      permissions: {
        __typename?: 'GroupRolePermission';
        id: number;
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
      members: Array<{
        __typename?: 'User';
        id: number;
        name: string;
        profilePicture: { __typename?: 'Image'; id: number };
      }>;
      availableUsersToAdd: Array<{
        __typename?: 'User';
        id: number;
        name: string;
        profilePicture: { __typename?: 'Image'; id: number };
      }>;
      group: {
        __typename?: 'Group';
        id: number;
        name: string;
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

export const UpdateGroupRoleDocument = gql`
  mutation UpdateGroupRole($groupRoleData: UpdateGroupRoleInput!) {
    updateGroupRole(groupRoleData: $groupRoleData) {
      groupRole {
        ...GroupRole
        permissions {
          ...GroupRolePermissions
        }
        members {
          ...RoleMember
        }
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
  ${GroupRoleFragmentDoc}
  ${GroupRolePermissionsFragmentDoc}
  ${RoleMemberFragmentDoc}
  ${UserAvatarFragmentDoc}
  ${GroupPermissionsFragmentDoc}
`;
export type UpdateGroupRoleMutationFn = Apollo.MutationFunction<
  UpdateGroupRoleMutation,
  UpdateGroupRoleMutationVariables
>;

/**
 * __useUpdateGroupRoleMutation__
 *
 * To run a mutation, you first call `useUpdateGroupRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGroupRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGroupRoleMutation, { data, loading, error }] = useUpdateGroupRoleMutation({
 *   variables: {
 *      groupRoleData: // value for 'groupRoleData'
 *   },
 * });
 */
export function useUpdateGroupRoleMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateGroupRoleMutation,
    UpdateGroupRoleMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateGroupRoleMutation,
    UpdateGroupRoleMutationVariables
  >(UpdateGroupRoleDocument, options);
}
export type UpdateGroupRoleMutationHookResult = ReturnType<
  typeof useUpdateGroupRoleMutation
>;
export type UpdateGroupRoleMutationResult =
  Apollo.MutationResult<UpdateGroupRoleMutation>;
export type UpdateGroupRoleMutationOptions = Apollo.BaseMutationOptions<
  UpdateGroupRoleMutation,
  UpdateGroupRoleMutationVariables
>;
