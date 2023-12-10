import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserProfileCardFragmentDoc } from '../../fragments/gen/UserProfileCard.gen';
import { FeedItemFragmentDoc } from '../../../posts/fragments/gen/FeedItem.gen';
import { ToggleFormsFragmentDoc } from '../../fragments/gen/ToggleForms.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UserProfileQueryVariables = Types.Exact<{
  name?: Types.InputMaybe<Types.Scalars['String']['input']>;
  isLoggedIn?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;

export type UserProfileQuery = {
  __typename?: 'Query';
  user: {
    __typename?: 'User';
    id: number;
    bio?: string | null;
    createdAt: any;
    followerCount: number;
    followingCount: number;
    name: string;
    isFollowedByMe: boolean;
    profileFeed: Array<
      | {
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
            groupSettings?: {
              __typename?: 'ProposalActionGroupConfig';
              id: number;
              decisionMakingModel?: string | null;
              ratificationThreshold?: number | null;
              reservationsLimit?: number | null;
              standAsidesLimit?: number | null;
              votingTimeLimit?: number | null;
              privacy?: string | null;
              oldDecisionMakingModel?: string | null;
              oldRatificationThreshold?: number | null;
              oldReservationsLimit?: number | null;
              oldStandAsidesLimit?: number | null;
              oldVotingTimeLimit?: number | null;
              oldPrivacy?: string | null;
              proposalAction: {
                __typename?: 'ProposalAction';
                id: number;
                proposal: {
                  __typename?: 'Proposal';
                  id: number;
                  group?: {
                    __typename?: 'Group';
                    id: number;
                    settings: {
                      __typename?: 'GroupConfig';
                      id: number;
                      decisionMakingModel: string;
                      ratificationThreshold: number;
                      reservationsLimit: number;
                      standAsidesLimit: number;
                      votingTimeLimit: number;
                      privacy: string;
                    };
                  } | null;
                };
              };
            } | null;
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
          settings: {
            __typename?: 'ProposalConfig';
            id: number;
            votingTimeLimit: number;
            decisionMakingModel: string;
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
          images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
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
    coverPhoto?: { __typename?: 'Image'; id: number } | null;
    profilePicture: { __typename?: 'Image'; id: number };
  };
  me: {
    __typename?: 'User';
    id: number;
    joinedGroups: Array<{ __typename?: 'Group'; id: number; name: string }>;
  };
};

export const UserProfileDocument = gql`
  query UserProfile($name: String, $isLoggedIn: Boolean = true) {
    user(name: $name) {
      ...UserProfileCard
      profileFeed {
        ...FeedItem
      }
    }
    me {
      id
      ...ToggleForms
    }
  }
  ${UserProfileCardFragmentDoc}
  ${FeedItemFragmentDoc}
  ${ToggleFormsFragmentDoc}
`;

/**
 * __useUserProfileQuery__
 *
 * To run a query within a React component, call `useUserProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserProfileQuery({
 *   variables: {
 *      name: // value for 'name'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useUserProfileQuery(
  baseOptions?: Apollo.QueryHookOptions<
    UserProfileQuery,
    UserProfileQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<UserProfileQuery, UserProfileQueryVariables>(
    UserProfileDocument,
    options,
  );
}
export function useUserProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    UserProfileQuery,
    UserProfileQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<UserProfileQuery, UserProfileQueryVariables>(
    UserProfileDocument,
    options,
  );
}
export type UserProfileQueryHookResult = ReturnType<typeof useUserProfileQuery>;
export type UserProfileLazyQueryHookResult = ReturnType<
  typeof useUserProfileLazyQuery
>;
export type UserProfileQueryResult = Apollo.QueryResult<
  UserProfileQuery,
  UserProfileQueryVariables
>;
