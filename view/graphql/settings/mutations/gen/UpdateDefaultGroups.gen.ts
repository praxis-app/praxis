import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { AddDefaultGroupsOptionFragmentDoc } from '../../fragments/gen/AddDefaultGroupsOption.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UpdateDefaultGroupsMutationVariables = Types.Exact<{
  defaultGroupsData: Types.UpdateDefaultGroupsInput;
}>;

export type UpdateDefaultGroupsMutation = {
  __typename?: 'Mutation';
  updateDefaultGroups: {
    __typename?: 'UpdateDefaultGroupsPayload';
    groups: Array<{
      __typename?: 'Group';
      id: number;
      isDefault: boolean;
      name: string;
      coverPhoto?: { __typename?: 'Image'; id: number } | null;
    }>;
  };
};

export const UpdateDefaultGroupsDocument = gql`
  mutation UpdateDefaultGroups($defaultGroupsData: UpdateDefaultGroupsInput!) {
    updateDefaultGroups(defaultGroupsData: $defaultGroupsData) {
      groups {
        ...AddDefaultGroupsOption
      }
    }
  }
  ${AddDefaultGroupsOptionFragmentDoc}
`;
export type UpdateDefaultGroupsMutationFn = Apollo.MutationFunction<
  UpdateDefaultGroupsMutation,
  UpdateDefaultGroupsMutationVariables
>;

/**
 * __useUpdateDefaultGroupsMutation__
 *
 * To run a mutation, you first call `useUpdateDefaultGroupsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDefaultGroupsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDefaultGroupsMutation, { data, loading, error }] = useUpdateDefaultGroupsMutation({
 *   variables: {
 *      defaultGroupsData: // value for 'defaultGroupsData'
 *   },
 * });
 */
export function useUpdateDefaultGroupsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateDefaultGroupsMutation,
    UpdateDefaultGroupsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateDefaultGroupsMutation,
    UpdateDefaultGroupsMutationVariables
  >(UpdateDefaultGroupsDocument, options);
}
export type UpdateDefaultGroupsMutationHookResult = ReturnType<
  typeof useUpdateDefaultGroupsMutation
>;
export type UpdateDefaultGroupsMutationResult =
  Apollo.MutationResult<UpdateDefaultGroupsMutation>;
export type UpdateDefaultGroupsMutationOptions = Apollo.BaseMutationOptions<
  UpdateDefaultGroupsMutation,
  UpdateDefaultGroupsMutationVariables
>;
