import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { ServerRoleFragmentDoc } from './ServerRole.fragment';
import { ServerRolePermissionsFragmentDoc } from './ServerRolePermissions.fragment';
import { RoleMemberFragmentDoc } from './RoleMember.fragment';
import { UserAvatarFragmentDoc } from '../../users/generated/UserAvatar.fragment';
import { ServerPermissionsFragmentDoc } from './ServerPermissions.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UpdateServerRoleMutationVariables = Types.Exact<{
  serverRoleData: Types.UpdateServerRoleInput;
}>;

export type UpdateServerRoleMutation = {
  __typename?: 'Mutation';
  updateServerRole: {
    __typename?: 'UpdateServerRolePayload';
    serverRole: {
      __typename?: 'ServerRole';
      id: number;
      name: string;
      color: string;
      memberCount: number;
      permissions: {
        __typename?: 'ServerRolePermission';
        id: number;
        createInvites: boolean;
        manageComments: boolean;
        manageEvents: boolean;
        manageInvites: boolean;
        managePosts: boolean;
        manageRoles: boolean;
        removeMembers: boolean;
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
    };
    me: {
      __typename?: 'User';
      id: number;
      serverPermissions: {
        __typename?: 'ServerPermissions';
        createInvites: boolean;
        manageComments: boolean;
        manageEvents: boolean;
        manageInvites: boolean;
        managePosts: boolean;
        manageRoles: boolean;
        removeMembers: boolean;
      };
    };
  };
};

export const UpdateServerRoleDocument = gql`
  mutation UpdateServerRole($serverRoleData: UpdateServerRoleInput!) {
    updateServerRole(serverRoleData: $serverRoleData) {
      serverRole {
        ...ServerRole
        permissions {
          ...ServerRolePermissions
        }
        members {
          ...RoleMember
        }
        availableUsersToAdd {
          ...UserAvatar
        }
      }
      me {
        id
        serverPermissions {
          ...ServerPermissions
        }
      }
    }
  }
  ${ServerRoleFragmentDoc}
  ${ServerRolePermissionsFragmentDoc}
  ${RoleMemberFragmentDoc}
  ${UserAvatarFragmentDoc}
  ${ServerPermissionsFragmentDoc}
`;
export type UpdateServerRoleMutationFn = Apollo.MutationFunction<
  UpdateServerRoleMutation,
  UpdateServerRoleMutationVariables
>;

/**
 * __useUpdateServerRoleMutation__
 *
 * To run a mutation, you first call `useUpdateServerRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateServerRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateServerRoleMutation, { data, loading, error }] = useUpdateServerRoleMutation({
 *   variables: {
 *      serverRoleData: // value for 'serverRoleData'
 *   },
 * });
 */
export function useUpdateServerRoleMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateServerRoleMutation,
    UpdateServerRoleMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateServerRoleMutation,
    UpdateServerRoleMutationVariables
  >(UpdateServerRoleDocument, options);
}
export type UpdateServerRoleMutationHookResult = ReturnType<
  typeof useUpdateServerRoleMutation
>;
export type UpdateServerRoleMutationResult =
  Apollo.MutationResult<UpdateServerRoleMutation>;
export type UpdateServerRoleMutationOptions = Apollo.BaseMutationOptions<
  UpdateServerRoleMutation,
  UpdateServerRoleMutationVariables
>;
