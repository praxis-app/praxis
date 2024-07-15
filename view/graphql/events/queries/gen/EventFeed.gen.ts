import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { PostCardFragmentDoc } from '../../../posts/fragments/gen/PostCard.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type EventFeedQueryVariables = Types.Exact<{
  eventId: Types.Scalars['Int']['input'];
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  isVerified: Types.Scalars['Boolean']['input'];
}>;

export type EventFeedQuery = {
  __typename?: 'Query';
  event: {
    __typename?: 'Event';
    id: number;
    postsCount: number;
    posts: Array<{
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
        images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
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
        stage: string;
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
          } | null;
          groupCoverPhoto?: {
            __typename?: 'Image';
            id: number;
            filename: string;
          } | null;
        };
        images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
        user: {
          __typename?: 'User';
          id: number;
          name: string;
          displayName?: string | null;
          profilePicture: { __typename?: 'Image'; id: number };
        };
      } | null;
    }>;
  };
};

export const EventFeedDocument = gql`
  query EventFeed(
    $eventId: Int!
    $offset: Int
    $limit: Int
    $isVerified: Boolean!
  ) {
    event(id: $eventId) {
      id
      posts(offset: $offset, limit: $limit) {
        ...PostCard
      }
      postsCount
    }
  }
  ${PostCardFragmentDoc}
`;

/**
 * __useEventFeedQuery__
 *
 * To run a query within a React component, call `useEventFeedQuery` and pass it any options that fit your needs.
 * When your component renders, `useEventFeedQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEventFeedQuery({
 *   variables: {
 *      eventId: // value for 'eventId'
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *      isVerified: // value for 'isVerified'
 *   },
 * });
 */
export function useEventFeedQuery(
  baseOptions: Apollo.QueryHookOptions<EventFeedQuery, EventFeedQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<EventFeedQuery, EventFeedQueryVariables>(
    EventFeedDocument,
    options,
  );
}
export function useEventFeedLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    EventFeedQuery,
    EventFeedQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<EventFeedQuery, EventFeedQueryVariables>(
    EventFeedDocument,
    options,
  );
}
export type EventFeedQueryHookResult = ReturnType<typeof useEventFeedQuery>;
export type EventFeedLazyQueryHookResult = ReturnType<
  typeof useEventFeedLazyQuery
>;
export type EventFeedQueryResult = Apollo.QueryResult<
  EventFeedQuery,
  EventFeedQueryVariables
>;
