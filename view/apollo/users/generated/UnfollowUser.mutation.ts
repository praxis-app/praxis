import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UnfollowUserMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type UnfollowUserMutation = {
  __typename?: 'Mutation';
  unfollowUser: boolean;
};

export const UnfollowUserDocument = gql`
  mutation UnfollowUser($id: Int!) {
    unfollowUser(id: $id)
  }
`;
export type UnfollowUserMutationFn = Apollo.MutationFunction<
  UnfollowUserMutation,
  UnfollowUserMutationVariables
>;

/**
 * __useUnfollowUserMutation__
 *
 * To run a mutation, you first call `useUnfollowUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnfollowUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unfollowUserMutation, { data, loading, error }] = useUnfollowUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUnfollowUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UnfollowUserMutation,
    UnfollowUserMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UnfollowUserMutation,
    UnfollowUserMutationVariables
  >(UnfollowUserDocument, options);
}
export type UnfollowUserMutationHookResult = ReturnType<
  typeof useUnfollowUserMutation
>;
export type UnfollowUserMutationResult =
  Apollo.MutationResult<UnfollowUserMutation>;
export type UnfollowUserMutationOptions = Apollo.BaseMutationOptions<
  UnfollowUserMutation,
  UnfollowUserMutationVariables
>;
