import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { GroupAvatarFragmentDoc } from './GroupAvatar.fragment';
import { GroupPermissionsFragmentDoc } from './GroupPermissions.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type CreateGroupMutationVariables = Types.Exact<{
  groupData: Types.CreateGroupInput;
}>;

export type CreateGroupMutation = {
  __typename?: 'Mutation';
  createGroup: {
    __typename?: 'CreateGroupPayload';
    group: {
      __typename?: 'Group';
      description: string;
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
      members: Array<{ __typename?: 'User'; id: number }>;
      coverPhoto?: { __typename?: 'Image'; id: number } | null;
    };
  };
};

export const CreateGroupDocument = gql`
  mutation CreateGroup($groupData: CreateGroupInput!) {
    createGroup(groupData: $groupData) {
      group {
        ...GroupAvatar
        description
        myPermissions {
          ...GroupPermissions
        }
        members {
          id
        }
      }
    }
  }
  ${GroupAvatarFragmentDoc}
  ${GroupPermissionsFragmentDoc}
`;
export type CreateGroupMutationFn = Apollo.MutationFunction<
  CreateGroupMutation,
  CreateGroupMutationVariables
>;

/**
 * __useCreateGroupMutation__
 *
 * To run a mutation, you first call `useCreateGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupMutation, { data, loading, error }] = useCreateGroupMutation({
 *   variables: {
 *      groupData: // value for 'groupData'
 *   },
 * });
 */
export function useCreateGroupMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateGroupMutation,
    CreateGroupMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateGroupMutation, CreateGroupMutationVariables>(
    CreateGroupDocument,
    options,
  );
}
export type CreateGroupMutationHookResult = ReturnType<
  typeof useCreateGroupMutation
>;
export type CreateGroupMutationResult =
  Apollo.MutationResult<CreateGroupMutation>;
export type CreateGroupMutationOptions = Apollo.BaseMutationOptions<
  CreateGroupMutation,
  CreateGroupMutationVariables
>;
