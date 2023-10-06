import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../users/generated/UserAvatar.fragment';
import { ServerPermissionsFragmentDoc } from './ServerPermissions.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type DeleteServerRoleMemberMutationVariables = Types.Exact<{
  serverRoleMemberData: Types.DeleteServerRoleMemberInput;
}>;

export type DeleteServerRoleMemberMutation = {
  __typename?: 'Mutation';
  deleteServerRoleMember: {
    __typename?: 'DeleteServerRoleMemberPayload';
    serverRole: {
      __typename?: 'ServerRole';
      id: number;
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

export const DeleteServerRoleMemberDocument = gql`
  mutation DeleteServerRoleMember(
    $serverRoleMemberData: DeleteServerRoleMemberInput!
  ) {
    deleteServerRoleMember(serverRoleMemberData: $serverRoleMemberData) {
      serverRole {
        id
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
  ${UserAvatarFragmentDoc}
  ${ServerPermissionsFragmentDoc}
`;
export type DeleteServerRoleMemberMutationFn = Apollo.MutationFunction<
  DeleteServerRoleMemberMutation,
  DeleteServerRoleMemberMutationVariables
>;

/**
 * __useDeleteServerRoleMemberMutation__
 *
 * To run a mutation, you first call `useDeleteServerRoleMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteServerRoleMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteServerRoleMemberMutation, { data, loading, error }] = useDeleteServerRoleMemberMutation({
 *   variables: {
 *      serverRoleMemberData: // value for 'serverRoleMemberData'
 *   },
 * });
 */
export function useDeleteServerRoleMemberMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteServerRoleMemberMutation,
    DeleteServerRoleMemberMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteServerRoleMemberMutation,
    DeleteServerRoleMemberMutationVariables
  >(DeleteServerRoleMemberDocument, options);
}
export type DeleteServerRoleMemberMutationHookResult = ReturnType<
  typeof useDeleteServerRoleMemberMutation
>;
export type DeleteServerRoleMemberMutationResult =
  Apollo.MutationResult<DeleteServerRoleMemberMutation>;
export type DeleteServerRoleMemberMutationOptions = Apollo.BaseMutationOptions<
  DeleteServerRoleMemberMutation,
  DeleteServerRoleMemberMutationVariables
>;
