import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { CommentFragmentDoc } from '../../fragments/gen/Comment.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type CreateCommentMutationVariables = Types.Exact<{
  commentData: Types.CreateCommentInput;
  isLoggedIn?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;

export type CreateCommentMutation = {
  __typename?: 'Mutation';
  createComment: {
    __typename?: 'CreateCommentPayload';
    comment: {
      __typename?: 'Comment';
      id: number;
      body?: string | null;
      likeCount: number;
      isLikedByMe?: boolean;
      createdAt: any;
      post?: { __typename?: 'Post'; id: number; commentCount: number } | null;
      proposal?: {
        __typename?: 'Proposal';
        id: number;
        commentCount: number;
      } | null;
      images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
      user: {
        __typename?: 'User';
        id: number;
        name: string;
        profilePicture: { __typename?: 'Image'; id: number };
      };
    };
  };
};

export const CreateCommentDocument = gql`
  mutation CreateComment(
    $commentData: CreateCommentInput!
    $isLoggedIn: Boolean = true
  ) {
    createComment(commentData: $commentData) {
      comment {
        ...Comment
        post {
          id
          commentCount
        }
        proposal {
          id
          commentCount
        }
      }
    }
  }
  ${CommentFragmentDoc}
`;
export type CreateCommentMutationFn = Apollo.MutationFunction<
  CreateCommentMutation,
  CreateCommentMutationVariables
>;

/**
 * __useCreateCommentMutation__
 *
 * To run a mutation, you first call `useCreateCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCommentMutation, { data, loading, error }] = useCreateCommentMutation({
 *   variables: {
 *      commentData: // value for 'commentData'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useCreateCommentMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateCommentMutation,
    CreateCommentMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateCommentMutation,
    CreateCommentMutationVariables
  >(CreateCommentDocument, options);
}
export type CreateCommentMutationHookResult = ReturnType<
  typeof useCreateCommentMutation
>;
export type CreateCommentMutationResult =
  Apollo.MutationResult<CreateCommentMutation>;
export type CreateCommentMutationOptions = Apollo.BaseMutationOptions<
  CreateCommentMutation,
  CreateCommentMutationVariables
>;
