import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { PostCardFragmentDoc } from './PostCard.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type CreatePostMutationVariables = Types.Exact<{
  postData: Types.CreatePostInput;
  isLoggedIn?: Types.InputMaybe<Types.Scalars['Boolean']>;
}>;

export type CreatePostMutation = {
  __typename?: 'Mutation';
  createPost: {
    __typename?: 'CreatePostPayload';
    post: {
      __typename?: 'Post';
      id: number;
      body?: string | null;
      likesCount: number;
      commentCount: number;
      isLikedByMe?: boolean;
      createdAt: any;
      images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
      user: {
        __typename?: 'User';
        id: number;
        name: string;
        profilePicture: { __typename?: 'Image'; id: number };
      };
      group?: {
        __typename?: 'Group';
        isJoinedByMe?: boolean;
        id: number;
        name: string;
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
      } | null;
      event?: {
        __typename?: 'Event';
        id: number;
        name: string;
        group?: {
          __typename?: 'Group';
          id: number;
          isJoinedByMe: boolean;
        } | null;
        coverPhoto: { __typename?: 'Image'; id: number };
      } | null;
    };
  };
};

export const CreatePostDocument = gql`
  mutation CreatePost(
    $postData: CreatePostInput!
    $isLoggedIn: Boolean = true
  ) {
    createPost(postData: $postData) {
      post {
        ...PostCard
      }
    }
  }
  ${PostCardFragmentDoc}
`;
export type CreatePostMutationFn = Apollo.MutationFunction<
  CreatePostMutation,
  CreatePostMutationVariables
>;

/**
 * __useCreatePostMutation__
 *
 * To run a mutation, you first call `useCreatePostMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePostMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPostMutation, { data, loading, error }] = useCreatePostMutation({
 *   variables: {
 *      postData: // value for 'postData'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useCreatePostMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreatePostMutation,
    CreatePostMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreatePostMutation, CreatePostMutationVariables>(
    CreatePostDocument,
    options,
  );
}
export type CreatePostMutationHookResult = ReturnType<
  typeof useCreatePostMutation
>;
export type CreatePostMutationResult =
  Apollo.MutationResult<CreatePostMutation>;
export type CreatePostMutationOptions = Apollo.BaseMutationOptions<
  CreatePostMutation,
  CreatePostMutationVariables
>;
