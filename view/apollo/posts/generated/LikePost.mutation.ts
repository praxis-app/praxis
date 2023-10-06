import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type LikePostMutationVariables = Types.Exact<{
  likeData: Types.CreateLikeInput;
  isLoggedIn?: Types.InputMaybe<Types.Scalars['Boolean']>;
}>;

export type LikePostMutation = {
  __typename?: 'Mutation';
  createLike: {
    __typename?: 'CreateLikePayload';
    like: {
      __typename?: 'Like';
      id: number;
      post?: {
        __typename?: 'Post';
        id: number;
        likesCount: number;
        isLikedByMe?: boolean;
      } | null;
    };
  };
};

export const LikePostDocument = gql`
  mutation LikePost($likeData: CreateLikeInput!, $isLoggedIn: Boolean = true) {
    createLike(likeData: $likeData) {
      like {
        id
        post {
          id
          likesCount
          isLikedByMe @include(if: $isLoggedIn)
        }
      }
    }
  }
`;
export type LikePostMutationFn = Apollo.MutationFunction<
  LikePostMutation,
  LikePostMutationVariables
>;

/**
 * __useLikePostMutation__
 *
 * To run a mutation, you first call `useLikePostMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLikePostMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [likePostMutation, { data, loading, error }] = useLikePostMutation({
 *   variables: {
 *      likeData: // value for 'likeData'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useLikePostMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LikePostMutation,
    LikePostMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<LikePostMutation, LikePostMutationVariables>(
    LikePostDocument,
    options,
  );
}
export type LikePostMutationHookResult = ReturnType<typeof useLikePostMutation>;
export type LikePostMutationResult = Apollo.MutationResult<LikePostMutation>;
export type LikePostMutationOptions = Apollo.BaseMutationOptions<
  LikePostMutation,
  LikePostMutationVariables
>;
