import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { SharedPostFragmentDoc } from '../../fragments/gen/SharedPost.gen';
import { SharedProposalFragmentDoc } from '../../../proposals/fragments/gen/SharedProposal.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type SharedPostAttachmentQueryVariables = Types.Exact<{
  postId: Types.Scalars['Int']['input'];
}>;

export type SharedPostAttachmentQuery = {
  __typename?: 'Query';
  post: {
    __typename?: 'Post';
    id: number;
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

export const SharedPostAttachmentDocument = gql`
  query SharedPostAttachment($postId: Int!) {
    post(id: $postId) {
      id
      sharedPost {
        ...SharedPost
      }
      sharedProposal {
        ...SharedProposal
      }
    }
  }
  ${SharedPostFragmentDoc}
  ${SharedProposalFragmentDoc}
`;

/**
 * __useSharedPostAttachmentQuery__
 *
 * To run a query within a React component, call `useSharedPostAttachmentQuery` and pass it any options that fit your needs.
 * When your component renders, `useSharedPostAttachmentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSharedPostAttachmentQuery({
 *   variables: {
 *      postId: // value for 'postId'
 *   },
 * });
 */
export function useSharedPostAttachmentQuery(
  baseOptions: Apollo.QueryHookOptions<
    SharedPostAttachmentQuery,
    SharedPostAttachmentQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SharedPostAttachmentQuery,
    SharedPostAttachmentQueryVariables
  >(SharedPostAttachmentDocument, options);
}
export function useSharedPostAttachmentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SharedPostAttachmentQuery,
    SharedPostAttachmentQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SharedPostAttachmentQuery,
    SharedPostAttachmentQueryVariables
  >(SharedPostAttachmentDocument, options);
}
export type SharedPostAttachmentQueryHookResult = ReturnType<
  typeof useSharedPostAttachmentQuery
>;
export type SharedPostAttachmentLazyQueryHookResult = ReturnType<
  typeof useSharedPostAttachmentLazyQuery
>;
export type SharedPostAttachmentQueryResult = Apollo.QueryResult<
  SharedPostAttachmentQuery,
  SharedPostAttachmentQueryVariables
>;
