import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type LikeCommentMutationVariables = Types.Exact<{
  likeData: Types.CreateLikeInput;
}>;

export type LikeCommentMutation = {
  __typename?: 'Mutation';
  createLike: {
    __typename?: 'CreateLikePayload';
    like: { __typename?: 'Like'; id: number };
  };
};

export const LikeCommentDocument = gql`
  mutation LikeComment($likeData: CreateLikeInput!) {
    createLike(likeData: $likeData) {
      like {
        id
      }
    }
  }
`;
export type LikeCommentMutationFn = Apollo.MutationFunction<
  LikeCommentMutation,
  LikeCommentMutationVariables
>;

/**
 * __useLikeCommentMutation__
 *
 * To run a mutation, you first call `useLikeCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLikeCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [likeCommentMutation, { data, loading, error }] = useLikeCommentMutation({
 *   variables: {
 *      likeData: // value for 'likeData'
 *   },
 * });
 */
export function useLikeCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LikeCommentMutation,
    LikeCommentMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<LikeCommentMutation, LikeCommentMutationVariables>(
    LikeCommentDocument,
    options,
  );
}
export type LikeCommentMutationHookResult = ReturnType<
  typeof useLikeCommentMutation
>;
export type LikeCommentMutationResult =
  Apollo.MutationResult<LikeCommentMutation>;
export type LikeCommentMutationOptions = Apollo.BaseMutationOptions<
  LikeCommentMutation,
  LikeCommentMutationVariables
>;
