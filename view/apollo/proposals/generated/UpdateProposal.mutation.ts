import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { ProposalCardFragmentDoc } from './ProposalCard.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UpdateProposalMutationVariables = Types.Exact<{
  proposalData: Types.UpdateProposalInput;
  isLoggedIn?: Types.InputMaybe<Types.Scalars['Boolean']>;
}>;

export type UpdateProposalMutation = {
  __typename?: 'Mutation';
  updateProposal: {
    __typename?: 'UpdateProposalPayload';
    proposal: {
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
    };
  };
};

export const UpdateProposalDocument = gql`
  mutation UpdateProposal(
    $proposalData: UpdateProposalInput!
    $isLoggedIn: Boolean = true
  ) {
    updateProposal(proposalData: $proposalData) {
      proposal {
        ...ProposalCard
      }
    }
  }
  ${ProposalCardFragmentDoc}
`;
export type UpdateProposalMutationFn = Apollo.MutationFunction<
  UpdateProposalMutation,
  UpdateProposalMutationVariables
>;

/**
 * __useUpdateProposalMutation__
 *
 * To run a mutation, you first call `useUpdateProposalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProposalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProposalMutation, { data, loading, error }] = useUpdateProposalMutation({
 *   variables: {
 *      proposalData: // value for 'proposalData'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useUpdateProposalMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateProposalMutation,
    UpdateProposalMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateProposalMutation,
    UpdateProposalMutationVariables
  >(UpdateProposalDocument, options);
}
export type UpdateProposalMutationHookResult = ReturnType<
  typeof useUpdateProposalMutation
>;
export type UpdateProposalMutationResult =
  Apollo.MutationResult<UpdateProposalMutation>;
export type UpdateProposalMutationOptions = Apollo.BaseMutationOptions<
  UpdateProposalMutation,
  UpdateProposalMutationVariables
>;
