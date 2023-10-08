import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { GroupRoleFragmentDoc } from './GroupRole.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type CreateGroupRoleMutationVariables = Types.Exact<{
  groupRoleData: Types.CreateGroupRoleInput;
}>;

export type CreateGroupRoleMutation = {
  __typename?: 'Mutation';
  createGroupRole: {
    __typename?: 'CreateGroupRolePayload';
    groupRole: {
      __typename?: 'GroupRole';
      id: number;
      name: string;
      color: string;
      memberCount: number;
      group: {
        __typename?: 'Group';
        id: number;
        name: string;
        roles: Array<{
          __typename?: 'GroupRole';
          id: number;
          name: string;
          color: string;
          memberCount: number;
          group: { __typename?: 'Group'; id: number; name: string };
        }>;
      };
    };
  };
};

export const CreateGroupRoleDocument = gql`
  mutation CreateGroupRole($groupRoleData: CreateGroupRoleInput!) {
    createGroupRole(groupRoleData: $groupRoleData) {
      groupRole {
        ...GroupRole
        group {
          id
          roles {
            ...GroupRole
          }
        }
      }
    }
  }
  ${GroupRoleFragmentDoc}
`;
export type CreateGroupRoleMutationFn = Apollo.MutationFunction<
  CreateGroupRoleMutation,
  CreateGroupRoleMutationVariables
>;

/**
 * __useCreateGroupRoleMutation__
 *
 * To run a mutation, you first call `useCreateGroupRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupRoleMutation, { data, loading, error }] = useCreateGroupRoleMutation({
 *   variables: {
 *      groupRoleData: // value for 'groupRoleData'
 *   },
 * });
 */
export function useCreateGroupRoleMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateGroupRoleMutation,
    CreateGroupRoleMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateGroupRoleMutation,
    CreateGroupRoleMutationVariables
  >(CreateGroupRoleDocument, options);
}
export type CreateGroupRoleMutationHookResult = ReturnType<
  typeof useCreateGroupRoleMutation
>;
export type CreateGroupRoleMutationResult =
  Apollo.MutationResult<CreateGroupRoleMutation>;
export type CreateGroupRoleMutationOptions = Apollo.BaseMutationOptions<
  CreateGroupRoleMutation,
  CreateGroupRoleMutationVariables
>;
