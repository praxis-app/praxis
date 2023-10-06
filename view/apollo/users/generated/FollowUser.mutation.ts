import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { FollowFragmentDoc } from './Follow.fragment';
import { UserProfileCardFragmentDoc } from './UserProfileCard.fragment';
import { FeedItemFragmentDoc } from '../../posts/generated/FeedItem.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type FollowUserMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
  isLoggedIn?: Types.InputMaybe<Types.Scalars['Boolean']>;
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
      homeFeed: Array<
        | {
            __typename?: 'Post';
            id: number;
            body?: string | null;
            likesCount: number;
            commentCount: number;
            isLikedByMe?: boolean;
            createdAt: any;
            images: Array<{
              __typename?: 'Image';
              id: number;
              filename: string;
            }>;
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
          }
        | {
            __typename?: 'Proposal';
            id: number;
            body?: string | null;
            stage: string;
            voteCount: number;
            commentCount: number;
            createdAt: any;
            action: {
              __typename?: 'ProposalAction';
              id: number;
              actionType: string;
              groupDescription?: string | null;
              groupName?: string | null;
              event?: {
                __typename?: 'ProposalActionEvent';
                id: number;
                name: string;
                description: string;
                location?: string | null;
                online: boolean;
                startsAt: any;
                endsAt?: any | null;
                externalLink?: string | null;
                coverPhoto?: { __typename?: 'Image'; id: number } | null;
                host: {
                  __typename?: 'User';
                  id: number;
                  name: string;
                  profilePicture: { __typename?: 'Image'; id: number };
                };
                proposalAction: {
                  __typename?: 'ProposalAction';
                  id: number;
                  proposal: {
                    __typename?: 'Proposal';
                    id: number;
                    group?: {
                      __typename?: 'Group';
                      id: number;
                      name: string;
                    } | null;
                  };
                };
              } | null;
              role?: {
                __typename?: 'ProposalActionRole';
                id: number;
                name?: string | null;
                color?: string | null;
                oldName?: string | null;
                oldColor?: string | null;
                permissions: {
                  __typename?: 'ProposalActionPermission';
                  id: number;
                  approveMemberRequests?: boolean | null;
                  createEvents?: boolean | null;
                  deleteGroup?: boolean | null;
                  manageComments?: boolean | null;
                  manageEvents?: boolean | null;
                  managePosts?: boolean | null;
                  manageRoles?: boolean | null;
                  manageSettings?: boolean | null;
                  removeMembers?: boolean | null;
                  updateGroup?: boolean | null;
                };
                members?: Array<{
                  __typename?: 'ProposalActionRoleMember';
                  id: number;
                  changeType: string;
                  user: {
                    __typename?: 'User';
                    id: number;
                    name: string;
                    profilePicture: { __typename?: 'Image'; id: number };
                  };
                }> | null;
                groupRole?: {
                  __typename?: 'GroupRole';
                  id: number;
                  name: string;
                  color: string;
                } | null;
              } | null;
              groupCoverPhoto?: {
                __typename?: 'Image';
                id: number;
                filename: string;
              } | null;
            };
            user: {
              __typename?: 'User';
              id: number;
              name: string;
              profilePicture: { __typename?: 'Image'; id: number };
            };
            group?: {
              __typename?: 'Group';
              id: number;
              isJoinedByMe?: boolean;
              name: string;
              myPermissions?: {
                __typename?: 'GroupPermissions';
                manageComments: boolean;
              };
              coverPhoto?: { __typename?: 'Image'; id: number } | null;
            } | null;
            images: Array<{
              __typename?: 'Image';
              id: number;
              filename: string;
            }>;
            votes: Array<{
              __typename?: 'Vote';
              id: number;
              voteType: string;
              user: {
                __typename?: 'User';
                id: number;
                name: string;
                profilePicture: { __typename?: 'Image'; id: number };
              };
            }>;
          }
      >;
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
  mutation FollowUser($id: Int!, $isLoggedIn: Boolean = true) {
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
        homeFeed {
          ...FeedItem
        }
        following {
          ...Follow
        }
        ...UserProfileCard
      }
    }
  }
  ${FollowFragmentDoc}
  ${UserProfileCardFragmentDoc}
  ${FeedItemFragmentDoc}
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
 *      isLoggedIn: // value for 'isLoggedIn'
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
