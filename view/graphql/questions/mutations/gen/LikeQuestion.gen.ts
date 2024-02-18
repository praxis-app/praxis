import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { LikeFragmentDoc } from '../../../likes/fragments/gen/Like.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type LikeQuestionMutationVariables = Types.Exact<{
  likeData: Types.CreateLikeInput;
  isLoggedIn: Types.Scalars['Boolean']['input'];
}>;

export type LikeQuestionMutation = {
  __typename?: 'Mutation';
  createLike: {
    __typename?: 'CreateLikePayload';
    question?: {
      __typename?: 'Question';
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

export const LikeQuestionDocument = gql`
  mutation LikeQuestion($likeData: CreateLikeInput!, $isLoggedIn: Boolean!) {
    createLike(likeData: $likeData) {
      question {
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
export type LikeQuestionMutationFn = Apollo.MutationFunction<
  LikeQuestionMutation,
  LikeQuestionMutationVariables
>;

/**
 * __useLikeQuestionMutation__
 *
 * To run a mutation, you first call `useLikeQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLikeQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [likeQuestionMutation, { data, loading, error }] = useLikeQuestionMutation({
 *   variables: {
 *      likeData: // value for 'likeData'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useLikeQuestionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    LikeQuestionMutation,
    LikeQuestionMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    LikeQuestionMutation,
    LikeQuestionMutationVariables
  >(LikeQuestionDocument, options);
}
export type LikeQuestionMutationHookResult = ReturnType<
  typeof useLikeQuestionMutation
>;
export type LikeQuestionMutationResult =
  Apollo.MutationResult<LikeQuestionMutation>;
export type LikeQuestionMutationOptions = Apollo.BaseMutationOptions<
  LikeQuestionMutation,
  LikeQuestionMutationVariables
>;
