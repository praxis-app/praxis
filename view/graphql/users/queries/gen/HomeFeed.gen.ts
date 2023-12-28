import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { FeedItemFragmentDoc } from '../../../posts/fragments/gen/FeedItem.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type HomeFeedQueryVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  after?: Types.InputMaybe<Types.Scalars['DateTime']['input']>;
  isLoggedIn?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;

export type HomeFeedQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'User';
    id: number;
    homeFeed: {
      __typename?: 'HomeFeedConnection';
      totalCount: number;
      edges: Array<{
        __typename?: 'HomeFeedEdge';
        node:
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
                groupSettings?: {
                  __typename?: 'ProposalActionGroupConfig';
                  id: number;
                  adminModel?: string | null;
                  decisionMakingModel?: string | null;
                  ratificationThreshold?: number | null;
                  reservationsLimit?: number | null;
                  standAsidesLimit?: number | null;
                  votingTimeLimit?: number | null;
                  privacy?: string | null;
                  oldAdminModel?: string | null;
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
                          adminModel: string;
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
                decisionMakingModel: string;
                ratificationThreshold: number;
                reservationsLimit: number;
                standAsidesLimit: number;
                closingAt?: any | null;
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
            };
      }>;
      pageInfo: {
        __typename?: 'PageInfo';
        startCursor?: any | null;
        endCursor?: any | null;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    };
  };
};

export const HomeFeedDocument = gql`
  query HomeFeed($first: Int, $after: DateTime, $isLoggedIn: Boolean = true) {
    me {
      id
      homeFeed(first: $first, after: $after) {
        edges {
          node {
            ...FeedItem
          }
        }
        pageInfo {
          startCursor
          endCursor
          hasNextPage
          hasPreviousPage
        }
        totalCount
      }
    }
  }
  ${FeedItemFragmentDoc}
`;

/**
 * __useHomeFeedQuery__
 *
 * To run a query within a React component, call `useHomeFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useHomeFeedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHomeFeedQuery({
 *   variables: {
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useHomeFeedQuery(
  baseOptions?: Apollo.QueryHookOptions<HomeFeedQuery, HomeFeedQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HomeFeedQuery, HomeFeedQueryVariables>(
    HomeFeedDocument,
    options,
  );
}
export function useHomeFeedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HomeFeedQuery,
    HomeFeedQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HomeFeedQuery, HomeFeedQueryVariables>(
    HomeFeedDocument,
    options,
  );
}
export type HomeFeedQueryHookResult = ReturnType<typeof useHomeFeedQuery>;
export type HomeFeedLazyQueryHookResult = ReturnType<
  typeof useHomeFeedLazyQuery
>;
export type HomeFeedQueryResult = Apollo.QueryResult<
  HomeFeedQuery,
  HomeFeedQueryVariables
>;
