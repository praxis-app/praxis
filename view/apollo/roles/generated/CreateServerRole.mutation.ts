import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { ServerRoleFragmentDoc } from './ServerRole.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type CreateServerRoleMutationVariables = Types.Exact<{
  serverRoleData: Types.CreateServerRoleInput;
}>;

export type CreateServerRoleMutation = {
  __typename?: 'Mutation';
  createServerRole: {
    __typename?: 'CreateServerRolePayload';
    serverRole: {
      __typename?: 'ServerRole';
      id: number;
      name: string;
      color: string;
      memberCount: number;
    };
  };
};

export const CreateServerRoleDocument = gql`
  mutation CreateServerRole($serverRoleData: CreateServerRoleInput!) {
    createServerRole(serverRoleData: $serverRoleData) {
      serverRole {
        ...ServerRole
      }
    }
  }
  ${ServerRoleFragmentDoc}
`;
export type CreateServerRoleMutationFn = Apollo.MutationFunction<
  CreateServerRoleMutation,
  CreateServerRoleMutationVariables
>;

/**
 * __useCreateServerRoleMutation__
 *
 * To run a mutation, you first call `useCreateServerRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateServerRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createServerRoleMutation, { data, loading, error }] = useCreateServerRoleMutation({
 *   variables: {
 *      serverRoleData: // value for 'serverRoleData'
 *   },
 * });
 */
export function useCreateServerRoleMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateServerRoleMutation,
    CreateServerRoleMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateServerRoleMutation,
    CreateServerRoleMutationVariables
  >(CreateServerRoleDocument, options);
}
export type CreateServerRoleMutationHookResult = ReturnType<
  typeof useCreateServerRoleMutation
>;
export type CreateServerRoleMutationResult =
  Apollo.MutationResult<CreateServerRoleMutation>;
export type CreateServerRoleMutationOptions = Apollo.BaseMutationOptions<
  CreateServerRoleMutation,
  CreateServerRoleMutationVariables
>;
