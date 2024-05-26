import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type CreateVoteMutationVariables = Types.Exact<{
  voteData: Types.CreateVoteInput;
}>;

export type CreateVoteMutation = {
  __typename?: 'Mutation';
  createVote: {
    __typename?: 'CreateVotePayload';
    vote: {
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
      proposal?: {
        __typename?: 'Proposal';
        id: number;
        stage: string;
        voteCount: number;
        myVote?: { __typename?: 'Vote'; id: number; voteType: string } | null;
        action: {
          __typename?: 'ProposalAction';
          id: number;
          actionType: string;
        };
        group?: {
          __typename?: 'Group';
          id: number;
          name: string;
          description: string;
        } | null;
      } | null;
      questionnaireTicket?: {
        __typename?: 'QuestionnaireTicket';
        id: number;
        voteCount: number;
        myVote?: { __typename?: 'Vote'; id: number; voteType: string } | null;
      } | null;
    };
  };
};

export const CreateVoteDocument = gql`
  mutation CreateVote($voteData: CreateVoteInput!) {
    createVote(voteData: $voteData) {
      vote {
        id
        voteType
        user {
          ...UserAvatar
        }
        proposal {
          id
          stage
          voteCount
          myVote {
            id
            voteType
          }
          action {
            id
            actionType
          }
          group {
            id
            name
            description
          }
        }
        questionnaireTicket {
          id
          voteCount
          myVote {
            id
            voteType
          }
        }
      }
    }
  }
  ${UserAvatarFragmentDoc}
`;
export type CreateVoteMutationFn = Apollo.MutationFunction<
  CreateVoteMutation,
  CreateVoteMutationVariables
>;

/**
 * __useCreateVoteMutation__
 *
 * To run a mutation, you first call `useCreateVoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateVoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createVoteMutation, { data, loading, error }] = useCreateVoteMutation({
 *   variables: {
 *      voteData: // value for 'voteData'
 *   },
 * });
 */
export function useCreateVoteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreateVoteMutation,
    CreateVoteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateVoteMutation, CreateVoteMutationVariables>(
    CreateVoteDocument,
    options,
  );
}
export type CreateVoteMutationHookResult = ReturnType<
  typeof useCreateVoteMutation
>;
export type CreateVoteMutationResult =
  Apollo.MutationResult<CreateVoteMutation>;
export type CreateVoteMutationOptions = Apollo.BaseMutationOptions<
  CreateVoteMutation,
  CreateVoteMutationVariables
>;
