import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { FollowFragmentDoc } from '../../fragments/gen/Follow.gen';
import { UserProfileCardFragmentDoc } from '../../fragments/gen/UserProfileCard.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type FollowUserMutationVariables = Types.Exact<{
  id: Types.Scalars['Int']['input'];
}>;

export type FollowUserMutation = {
  __typename?: 'Mutation';
  followUser: {
    __typename?: 'FollowUserPayload';
    followedUser: {
      __typename?: 'User';
      id: number;
      bio?: string | null;
      createdAt: any;
      followerCount: number;
      followingCount: number;
      name: string;
      isFollowedByMe: boolean;
      followers: Array<{
        __typename?: 'User';
        id: number;
        name: string;
        isFollowedByMe: boolean;
        profilePicture: { __typename?: 'Image'; id: number };
      }>;
      coverPhoto?: { __typename?: 'Image'; id: number } | null;
      profilePicture: { __typename?: 'Image'; id: number };
    };
    follower: {
      __typename?: 'User';
      id: number;
      bio?: string | null;
      createdAt: any;
      followerCount: number;
      followingCount: number;
      name: string;
      isFollowedByMe: boolean;
      following: Array<{
        __typename?: 'User';
        id: number;
        name: string;
        isFollowedByMe: boolean;
        profilePicture: { __typename?: 'Image'; id: number };
      }>;
      coverPhoto?: { __typename?: 'Image'; id: number } | null;
      profilePicture: { __typename?: 'Image'; id: number };
    };
  };
};

export const FollowUserDocument = gql`
  mutation FollowUser($id: Int!) {
    followUser(id: $id) {
      followedUser {
        id
        followers {
          ...Follow
        }
        ...UserProfileCard
      }
      follower {
        id
        following {
          ...Follow
        }
        ...UserProfileCard
      }
    }
  }
  ${FollowFragmentDoc}
  ${UserProfileCardFragmentDoc}
`;
export type FollowUserMutationFn = Apollo.MutationFunction<
  FollowUserMutation,
  FollowUserMutationVariables
>;

/**
 * __useFollowUserMutation__
 *
 * To run a mutation, you first call `useFollowUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useFollowUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [followUserMutation, { data, loading, error }] = useFollowUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFollowUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    FollowUserMutation,
    FollowUserMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<FollowUserMutation, FollowUserMutationVariables>(
    FollowUserDocument,
    options,
  );
}
export type FollowUserMutationHookResult = ReturnType<
  typeof useFollowUserMutation
>;
export type FollowUserMutationResult =
  Apollo.MutationResult<FollowUserMutation>;
export type FollowUserMutationOptions = Apollo.BaseMutationOptions<
  FollowUserMutation,
  FollowUserMutationVariables
>;
