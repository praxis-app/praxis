import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { FeedItemFragmentDoc } from '../../../posts/fragments/gen/FeedItem.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type GroupFeedQueryVariables = Types.Exact<{
  name: Types.Scalars['String']['input'];
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  isLoggedIn: Types.Scalars['Boolean']['input'];
  isVerified: Types.Scalars['Boolean']['input'];
}>;

export type GroupFeedQuery = {
  __typename?: 'Query';
  group: {
    __typename?: 'Group';
    id: number;
    feedCount: number;
    feed: Array<
      | {
          __typename?: 'Post';
          id: number;
          body?: string | null;
          likeCount: number;
          commentCount: number;
          shareCount: number;
          isLikedByMe?: boolean;
          hasMissingSharedProposal: boolean;
          hasMissingSharedPost: boolean;
          createdAt: any;
          images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
          user: {
            __typename?: 'User';
            id: number;
            name: string;
            displayName?: string | null;
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
          sharedPost?: {
            __typename?: 'Post';
            id: number;
            body?: string | null;
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
              displayName?: string | null;
              profilePicture: { __typename?: 'Image'; id: number };
            };
          } | null;
          sharedProposal?: {
            __typename?: 'Proposal';
            id: number;
            body?: string | null;
            stage: Types.ProposalStage;
            createdAt: any;
            action: {
              __typename?: 'ProposalAction';
              id: number;
              actionType: Types.ProposalActionType;
              groupDescription?: string | null;
              groupName?: string | null;
              groupSettings?: {
                __typename?: 'ProposalActionGroupConfig';
                id: number;
                adminModel?: string | null;
                decisionMakingModel?: Types.DecisionMakingModel | null;
                ratificationThreshold?: number | null;
                reservationsLimit?: number | null;
                standAsidesLimit?: number | null;
                votingTimeLimit?: number | null;
                privacy?: string | null;
                oldAdminModel?: string | null;
                oldDecisionMakingModel?: Types.DecisionMakingModel | null;
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
                        adminModel: string;
                        decisionMakingModel: Types.DecisionMakingModel;
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
                  displayName?: string | null;
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
                  createInvites?: boolean | null;
                  deleteGroup?: boolean | null;
                  manageComments?: boolean | null;
                  manageEvents?: boolean | null;
                  manageInvites?: boolean | null;
                  managePosts?: boolean | null;
                  manageQuestionnaireTickets?: boolean | null;
                  manageQuestions?: boolean | null;
                  manageRoles?: boolean | null;
                  manageRules?: boolean | null;
                  manageSettings?: boolean | null;
                  removeGroups?: boolean | null;
                  removeMembers?: boolean | null;
                  removeProposals?: boolean | null;
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
                    displayName?: string | null;
                    profilePicture: { __typename?: 'Image'; id: number };
                  };
                }> | null;
                groupRole?: {
                  __typename?: 'GroupRole';
                  id: number;
                  name: string;
                  color: string;
                } | null;
                serverRole?: {
                  __typename?: 'ServerRole';
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
            images: Array<{
              __typename?: 'Image';
              id: number;
              filename: string;
            }>;
            user: {
              __typename?: 'User';
              id: number;
              name: string;
              displayName?: string | null;
              profilePicture: { __typename?: 'Image'; id: number };
            };
          } | null;
        }
      | {
          __typename?: 'Proposal';
          id: number;
          body?: string | null;
          stage: Types.ProposalStage;
          voteCount: number;
          commentCount: number;
          shareCount: number;
          createdAt: any;
          action: {
            __typename?: 'ProposalAction';
            id: number;
            actionType: Types.ProposalActionType;
            groupDescription?: string | null;
            groupName?: string | null;
            groupSettings?: {
              __typename?: 'ProposalActionGroupConfig';
              id: number;
              adminModel?: string | null;
              decisionMakingModel?: Types.DecisionMakingModel | null;
              ratificationThreshold?: number | null;
              reservationsLimit?: number | null;
              standAsidesLimit?: number | null;
              votingTimeLimit?: number | null;
              privacy?: string | null;
              oldAdminModel?: string | null;
              oldDecisionMakingModel?: Types.DecisionMakingModel | null;
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
                      adminModel: string;
                      decisionMakingModel: Types.DecisionMakingModel;
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
                displayName?: string | null;
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
                createInvites?: boolean | null;
                deleteGroup?: boolean | null;
                manageComments?: boolean | null;
                manageEvents?: boolean | null;
                manageInvites?: boolean | null;
                managePosts?: boolean | null;
                manageQuestionnaireTickets?: boolean | null;
                manageQuestions?: boolean | null;
                manageRoles?: boolean | null;
                manageRules?: boolean | null;
                manageSettings?: boolean | null;
                removeGroups?: boolean | null;
                removeMembers?: boolean | null;
                removeProposals?: boolean | null;
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
                  displayName?: string | null;
                  profilePicture: { __typename?: 'Image'; id: number };
                };
              }> | null;
              groupRole?: {
                __typename?: 'GroupRole';
                id: number;
                name: string;
                color: string;
              } | null;
              serverRole?: {
                __typename?: 'ServerRole';
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
            decisionMakingModel: Types.DecisionMakingModel;
            ratificationThreshold: number;
            reservationsLimit: number;
            standAsidesLimit: number;
            closingAt?: any | null;
          };
          myVote?: { __typename?: 'Vote'; id: number; voteType: string } | null;
          user: {
            __typename?: 'User';
            id: number;
            name: string;
            displayName?: string | null;
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
              displayName?: string | null;
              profilePicture: { __typename?: 'Image'; id: number };
            };
          }>;
        }
    >;
  };
};

export const GroupFeedDocument = gql`
  query GroupFeed(
    $name: String!
    $offset: Int
    $limit: Int
    $isLoggedIn: Boolean!
    $isVerified: Boolean!
  ) {
    group(name: $name) {
      id
      feed(offset: $offset, limit: $limit) {
        ...FeedItem
      }
      feedCount
    }
  }
  ${FeedItemFragmentDoc}
`;

/**
 * __useGroupFeedQuery__
 *
 * To run a query within a React component, call `useGroupFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupFeedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupFeedQuery({
 *   variables: {
 *      name: // value for 'name'
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *      isLoggedIn: // value for 'isLoggedIn'
 *      isVerified: // value for 'isVerified'
 *   },
 * });
 */
export function useGroupFeedQuery(
  baseOptions: Apollo.QueryHookOptions<GroupFeedQuery, GroupFeedQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GroupFeedQuery, GroupFeedQueryVariables>(
    GroupFeedDocument,
    options,
  );
}
export function useGroupFeedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GroupFeedQuery,
    GroupFeedQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GroupFeedQuery, GroupFeedQueryVariables>(
    GroupFeedDocument,
    options,
  );
}
export type GroupFeedQueryHookResult = ReturnType<typeof useGroupFeedQuery>;
export type GroupFeedLazyQueryHookResult = ReturnType<
  typeof useGroupFeedLazyQuery
>;
export type GroupFeedQueryResult = Apollo.QueryResult<
  GroupFeedQuery,
  GroupFeedQueryVariables
>;
