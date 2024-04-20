import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { LikeFragmentDoc } from '../../../likes/fragments/gen/Like.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type LikeCommentMutationVariables = Types.Exact<{
  likeData: Types.CreateLikeInput;
  isLoggedIn: Types.Scalars['Boolean']['input'];
  isVerified: Types.Scalars['Boolean']['input'];
}>;

export type LikeCommentMutation = {
  __typename?: 'Mutation';
  createLike: {
    __typename?: 'CreateLikePayload';
    comment?: {
      __typename?: 'Comment';
      id: number;
      likeCount: number;
      isLikedByMe?: boolean;
    } | null;
    like: {
      __typename?: 'Like';
      id: number;
      user: {
        __typename?: 'User';
        id: number;
        name: string;
        displayName?: string | null;
        isFollowedByMe: boolean;
        profilePicture: { __typename?: 'Image'; id: number };
      };
    };
  };
};

export const LikeCommentDocument = gql`
  mutation LikeComment(
    $likeData: CreateLikeInput!
    $isLoggedIn: Boolean!
    $isVerified: Boolean!
  ) {
    createLike(likeData: $likeData) {
      comment {
        id
        likeCount
        isLikedByMe @include(if: $isLoggedIn)
      }
      like {
        id
        ...Like
      }
    }
  }
  ${LikeFragmentDoc}
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
 *      isLoggedIn: // value for 'isLoggedIn'
 *      isVerified: // value for 'isVerified'
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
