import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { LikeFragmentDoc } from '../../../likes/fragments/gen/Like.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type LikeAnswerMutationVariables = Types.Exact<{
  likeData: Types.CreateLikeInput;
  isLoggedIn: Types.Scalars['Boolean']['input'];
}>;

export type LikeAnswerMutation = {
  __typename?: 'Mutation';
  createLike: {
    __typename?: 'CreateLikePayload';
    answer?: {
      __typename?: 'Answer';
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
        isFollowedByMe: boolean;
        profilePicture: { __typename?: 'Image'; id: number };
      };
    };
  };
};

export const LikeAnswerDocument = gql`
  mutation LikeAnswer($likeData: CreateLikeInput!, $isLoggedIn: Boolean!) {
    createLike(likeData: $likeData) {
      answer {
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
export type LikeAnswerMutationFn = Apollo.MutationFunction<
  LikeAnswerMutation,
  LikeAnswerMutationVariables
>;

/**
 * __useLikeAnswerMutation__
 *
 * To run a mutation, you first call `useLikeAnswerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLikeAnswerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [likeAnswerMutation, { data, loading, error }] = useLikeAnswerMutation({
 *   variables: {
 *      likeData: // value for 'likeData'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useLikeAnswerMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LikeAnswerMutation,
    LikeAnswerMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<LikeAnswerMutation, LikeAnswerMutationVariables>(
    LikeAnswerDocument,
    options,
  );
}
export type LikeAnswerMutationHookResult = ReturnType<
  typeof useLikeAnswerMutation
>;
export type LikeAnswerMutationResult =
  Apollo.MutationResult<LikeAnswerMutation>;
export type LikeAnswerMutationOptions = Apollo.BaseMutationOptions<
  LikeAnswerMutation,
  LikeAnswerMutationVariables
>;
