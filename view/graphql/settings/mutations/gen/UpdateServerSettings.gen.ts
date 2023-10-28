import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UpdateServerSettingsMutationVariables = Types.Exact<{
  serverConfigData: Types.UpdateServerConfigInput;
}>;

export type UpdateServerSettingsMutation = {
  __typename?: 'Mutation';
  updateServerConfig: {
    __typename?: 'UpdateServerConfigPayload';
    serverConfig: {
      __typename?: 'ServerConfig';
      id: number;
      canaryMessage?: string | null;
      showCanaryMessage: boolean;
      canaryMessageExpiresAt?: any | null;
      updatedAt: any;
    };
  };
};

export const UpdateServerSettingsDocument = gql`
  mutation UpdateServerSettings($serverConfigData: UpdateServerConfigInput!) {
    updateServerConfig(serverConfigData: $serverConfigData) {
      serverConfig {
        id
        canaryMessage
        showCanaryMessage
        canaryMessageExpiresAt
        updatedAt
      }
    }
  }
`;
export type UpdateServerSettingsMutationFn = Apollo.MutationFunction<
  UpdateServerSettingsMutation,
  UpdateServerSettingsMutationVariables
>;

/**
 * __useUpdateServerSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateServerSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateServerSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateServerSettingsMutation, { data, loading, error }] = useUpdateServerSettingsMutation({
 *   variables: {
 *      serverConfigData: // value for 'serverConfigData'
 *   },
 * });
 */
export function useUpdateServerSettingsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateServerSettingsMutation,
    UpdateServerSettingsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateServerSettingsMutation,
    UpdateServerSettingsMutationVariables
  >(UpdateServerSettingsDocument, options);
}
export type UpdateServerSettingsMutationHookResult = ReturnType<
  typeof useUpdateServerSettingsMutation
>;
export type UpdateServerSettingsMutationResult =
  Apollo.MutationResult<UpdateServerSettingsMutation>;
export type UpdateServerSettingsMutationOptions = Apollo.BaseMutationOptions<
  UpdateServerSettingsMutation,
  UpdateServerSettingsMutationVariables
>;
