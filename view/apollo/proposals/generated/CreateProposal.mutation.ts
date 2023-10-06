import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { ProposalCardFragmentDoc } from './ProposalCard.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type CreateProposalMutationVariables = Types.Exact<{
  proposalData: Types.CreateProposalInput;
  isLoggedIn?: Types.InputMaybe<Types.Scalars['Boolean']>;
}>;

export type CreateProposalMutation = {
  __typename?: 'Mutation';
  createProposal: {
    __typename?: 'CreateProposalPayload';
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

export const CreateProposalDocument = gql`
  mutation CreateProposal(
    $proposalData: CreateProposalInput!
    $isLoggedIn: Boolean = true
  ) {
    createProposal(proposalData: $proposalData) {
      proposal {
        ...ProposalCard
      }
    }
  }
  ${ProposalCardFragmentDoc}
`;
export type CreateProposalMutationFn = Apollo.MutationFunction<
  CreateProposalMutation,
  CreateProposalMutationVariables
>;

/**
 * __useCreateProposalMutation__
 *
 * To run a mutation, you first call `useCreateProposalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProposalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProposalMutation, { data, loading, error }] = useCreateProposalMutation({
 *   variables: {
 *      proposalData: // value for 'proposalData'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useCreateProposalMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateProposalMutation,
    CreateProposalMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreateProposalMutation,
    CreateProposalMutationVariables
  >(CreateProposalDocument, options);
}
export type CreateProposalMutationHookResult = ReturnType<
  typeof useCreateProposalMutation
>;
export type CreateProposalMutationResult =
  Apollo.MutationResult<CreateProposalMutation>;
export type CreateProposalMutationOptions = Apollo.BaseMutationOptions<
  CreateProposalMutation,
  CreateProposalMutationVariables
>;
