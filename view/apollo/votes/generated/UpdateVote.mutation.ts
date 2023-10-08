import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UpdateVoteMutationVariables = Types.Exact<{
  voteData: Types.UpdateVoteInput;
}>;

export type UpdateVoteMutation = {
  __typename?: 'Mutation';
  updateVote: {
    __typename?: 'UpdateVotePayload';
    vote: {
      __typename?: 'Vote';
      id: number;
      voteType: string;
      proposal: {
        __typename?: 'Proposal';
        id: number;
        stage: string;
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
      };
    };
  };
};

export const UpdateVoteDocument = gql`
  mutation UpdateVote($voteData: UpdateVoteInput!) {
    updateVote(voteData: $voteData) {
      vote {
        id
        voteType
        proposal {
          id
          stage
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
      }
    }
  }
`;
export type UpdateVoteMutationFn = Apollo.MutationFunction<
  UpdateVoteMutation,
  UpdateVoteMutationVariables
>;

/**
 * __useUpdateVoteMutation__
 *
 * To run a mutation, you first call `useUpdateVoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVoteMutation, { data, loading, error }] = useUpdateVoteMutation({
 *   variables: {
 *      voteData: // value for 'voteData'
 *   },
 * });
 */
export function useUpdateVoteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateVoteMutation,
    UpdateVoteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateVoteMutation, UpdateVoteMutationVariables>(
    UpdateVoteDocument,
    options,
  );
}
export type UpdateVoteMutationHookResult = ReturnType<
  typeof useUpdateVoteMutation
>;
export type UpdateVoteMutationResult =
  Apollo.MutationResult<UpdateVoteMutation>;
export type UpdateVoteMutationOptions = Apollo.BaseMutationOptions<
  UpdateVoteMutation,
  UpdateVoteMutationVariables
>;
