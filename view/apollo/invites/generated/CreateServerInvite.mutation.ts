import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { ServerInviteCardFragmentDoc } from './ServerInviteCard.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type CreateServerInviteMutationVariables = Types.Exact<{
  serverInviteData: Types.CreateServerInviteInput;
}>;

export type CreateServerInviteMutation = {
  __typename?: 'Mutation';
  createServerInvite: {
    __typename?: 'CreateServerInvitePayload';
    serverInvite: {
      __typename?: 'ServerInvite';
      id: number;
      maxUses?: number | null;
      token: string;
      uses: number;
      expiresAt?: any | null;
      user: {
        __typename?: 'User';
        id: number;
        name: string;
        profilePicture: { __typename?: 'Image'; id: number };
      };
    };
  };
};

export const CreateServerInviteDocument = gql`
  mutation CreateServerInvite($serverInviteData: CreateServerInviteInput!) {
    createServerInvite(serverInviteData: $serverInviteData) {
      serverInvite {
        ...ServerInviteCard
      }
    }
  }
  ${ServerInviteCardFragmentDoc}
`;
export type CreateServerInviteMutationFn = Apollo.MutationFunction<
  CreateServerInviteMutation,
  CreateServerInviteMutationVariables
>;

/**
 * __useCreateServerInviteMutation__
 *
 * To run a mutation, you first call `useCreateServerInviteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateServerInviteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createServerInviteMutation, { data, loading, error }] = useCreateServerInviteMutation({
 *   variables: {
 *      serverInviteData: // value for 'serverInviteData'
 *   },
 * });
 */
export function useCreateServerInviteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateServerInviteMutation,
    CreateServerInviteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateServerInviteMutation,
    CreateServerInviteMutationVariables
  >(CreateServerInviteDocument, options);
}
export type CreateServerInviteMutationHookResult = ReturnType<
  typeof useCreateServerInviteMutation
>;
export type CreateServerInviteMutationResult =
  Apollo.MutationResult<CreateServerInviteMutation>;
export type CreateServerInviteMutationOptions = Apollo.BaseMutationOptions<
  CreateServerInviteMutation,
  CreateServerInviteMutationVariables
>;
