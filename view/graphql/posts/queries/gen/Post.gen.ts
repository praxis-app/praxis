import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { PostCardFragmentDoc } from '../../fragments/gen/PostCard.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type PostQueryVariables = Types.Exact<{
  id: Types.Scalars['Int']['input'];
  isVerified: Types.Scalars['Boolean']['input'];
}>;

export type PostQuery = {
  __typename?: 'Query';
  post: {
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
            displayName?: string | null;
            profilePicture: { __typename?: 'Image'; id: number };
          };
          proposalAction: {
            __typename?: 'ProposalAction';
            id: number;
            proposal: {
              __typename?: 'Proposal';
              id: number;
              group?: { __typename?: 'Group'; id: number; name: string } | null;
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
  };
};

export const PostDocument = gql`
  query Post($id: Int!, $isVerified: Boolean!) {
    post(id: $id) {
      ...PostCard
    }
  }
  ${PostCardFragmentDoc}
`;

/**
 * __usePostQuery__
 *
 * To run a query within a React component, call `usePostQuery` and pass it any options that fit your needs.
 * When your component renders, `usePostQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePostQuery({
 *   variables: {
 *      id: // value for 'id'
 *      isVerified: // value for 'isVerified'
 *   },
 * });
 */
export function usePostQuery(
  baseOptions: Apollo.QueryHookOptions<PostQuery, PostQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<PostQuery, PostQueryVariables>(PostDocument, options);
}
export function usePostLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<PostQuery, PostQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<PostQuery, PostQueryVariables>(
    PostDocument,
    options,
  );
}
export type PostQueryHookResult = ReturnType<typeof usePostQuery>;
export type PostLazyQueryHookResult = ReturnType<typeof usePostLazyQuery>;
export type PostQueryResult = Apollo.QueryResult<PostQuery, PostQueryVariables>;
