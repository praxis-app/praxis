import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { PostCardFragmentDoc } from '../../fragments/gen/PostCard.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UpdatePostMutationVariables = Types.Exact<{
  postData: Types.UpdatePostInput;
  isVerified?: Types.InputMaybe<Types.Scalars['Boolean']['input']>;
}>;

export type UpdatePostMutation = {
  __typename?: 'Mutation';
  updatePost: {
    __typename?: 'UpdatePostPayload';
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
          actionType: Types.ProposalActionType;
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
    };
  };
};

export const UpdatePostDocument = gql`
  mutation UpdatePost(
    $postData: UpdatePostInput!
    $isVerified: Boolean = true
  ) {
    updatePost(postData: $postData) {
      post {
        ...PostCard
      }
    }
  }
  ${PostCardFragmentDoc}
`;
export type UpdatePostMutationFn = Apollo.MutationFunction<
  UpdatePostMutation,
  UpdatePostMutationVariables
>;

/**
 * __useUpdatePostMutation__
 *
 * To run a mutation, you first call `useUpdatePostMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePostMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePostMutation, { data, loading, error }] = useUpdatePostMutation({
 *   variables: {
 *      postData: // value for 'postData'
 *      isVerified: // value for 'isVerified'
 *   },
 * });
 */
export function useUpdatePostMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdatePostMutation,
    UpdatePostMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdatePostMutation, UpdatePostMutationVariables>(
    UpdatePostDocument,
    options,
  );
}
export type UpdatePostMutationHookResult = ReturnType<
  typeof useUpdatePostMutation
>;
export type UpdatePostMutationResult =
  Apollo.MutationResult<UpdatePostMutation>;
export type UpdatePostMutationOptions = Apollo.BaseMutationOptions<
  UpdatePostMutation,
  UpdatePostMutationVariables
>;
