import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { GroupSettingsFormFragmentDoc } from '../../fragments/gen/GroupSettingsForm.gen';
import { GroupPageCardFragmentDoc } from '../../fragments/gen/GroupPageCard.gen';
import { GroupCardFragmentDoc } from '../../fragments/gen/GroupCard.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UpdateGroupSettingsMutationVariables = Types.Exact<{
  groupConfigData: Types.UpdateGroupConfigInput;
  isLoggedIn?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
  isVerified?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;

export type UpdateGroupSettingsMutation = {
  __typename?: 'Mutation';
  updateGroupConfig: {
    __typename?: 'UpdateGroupPayload';
    group: {
      __typename?: 'Group';
      id: number;
      name: string;
      memberCount: number;
      memberRequestCount?: number | null;
      isJoinedByMe?: boolean;
      description: string;
      settings: {
        __typename?: 'GroupConfig';
        id: number;
        adminModel: string;
        decisionMakingModel: string;
        ratificationThreshold: number;
        reservationsLimit: number;
        standAsidesLimit: number;
        votingTimeLimit: number;
        isPublic: boolean;
        privacy: string;
      };
      myPermissions?: {
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
      coverPhoto?: { __typename?: 'Image'; id: number } | null;
    };
  };
};

export const UpdateGroupSettingsDocument = gql`
  mutation UpdateGroupSettings(
    $groupConfigData: UpdateGroupConfigInput!
    $isLoggedIn: Boolean = true
    $isVerified: Boolean = true
  ) {
    updateGroupConfig(groupConfigData: $groupConfigData) {
      group {
        id
        ...GroupSettingsForm
        ...GroupPageCard
        ...GroupCard
      }
    }
  }
  ${GroupSettingsFormFragmentDoc}
  ${GroupPageCardFragmentDoc}
  ${GroupCardFragmentDoc}
`;
export type UpdateGroupSettingsMutationFn = Apollo.MutationFunction<
  UpdateGroupSettingsMutation,
  UpdateGroupSettingsMutationVariables
>;

/**
 * __useUpdateGroupSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateGroupSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGroupSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGroupSettingsMutation, { data, loading, error }] = useUpdateGroupSettingsMutation({
 *   variables: {
 *      groupConfigData: // value for 'groupConfigData'
 *      isLoggedIn: // value for 'isLoggedIn'
 *      isVerified: // value for 'isVerified'
 *   },
 * });
 */
export function useUpdateGroupSettingsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateGroupSettingsMutation,
    UpdateGroupSettingsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateGroupSettingsMutation,
    UpdateGroupSettingsMutationVariables
  >(UpdateGroupSettingsDocument, options);
}
export type UpdateGroupSettingsMutationHookResult = ReturnType<
  typeof useUpdateGroupSettingsMutation
>;
export type UpdateGroupSettingsMutationResult =
  Apollo.MutationResult<UpdateGroupSettingsMutation>;
export type UpdateGroupSettingsMutationOptions = Apollo.BaseMutationOptions<
  UpdateGroupSettingsMutation,
  UpdateGroupSettingsMutationVariables
>;
