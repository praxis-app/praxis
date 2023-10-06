import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type DeleteLikeMutationVariables = Types.Exact<{
  likeData: Types.DeleteLikeInput;
}>;

export type DeleteLikeMutation = {
  __typename?: 'Mutation';
  deleteLike: boolean;
};

export const DeleteLikeDocument = gql`
  mutation DeleteLike($likeData: DeleteLikeInput!) {
    deleteLike(likeData: $likeData)
  }
`;
export type DeleteLikeMutationFn = Apollo.MutationFunction<
  DeleteLikeMutation,
  DeleteLikeMutationVariables
>;

/**
 * __useDeleteLikeMutation__
 *
 * To run a mutation, you first call `useDeleteLikeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteLikeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteLikeMutation, { data, loading, error }] = useDeleteLikeMutation({
 *   variables: {
 *      likeData: // value for 'likeData'
 *   },
 * });
 */
export function useDeleteLikeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteLikeMutation,
    DeleteLikeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteLikeMutation, DeleteLikeMutationVariables>(
    DeleteLikeDocument,
    options,
  );
}
export type DeleteLikeMutationHookResult = ReturnType<
  typeof useDeleteLikeMutation
>;
export type DeleteLikeMutationResult =
  Apollo.MutationResult<DeleteLikeMutation>;
export type DeleteLikeMutationOptions = Apollo.BaseMutationOptions<
  DeleteLikeMutation,
  DeleteLikeMutationVariables
>;
