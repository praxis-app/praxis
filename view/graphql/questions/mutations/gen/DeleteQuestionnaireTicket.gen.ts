import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type DeleteQuestionnaireTicketMutationVariables = Types.Exact<{
  id: Types.Scalars['Int']['input'];
}>;

export type DeleteQuestionnaireTicketMutation = {
  __typename?: 'Mutation';
  deleteQuestionnnaireTicket: boolean;
};

export const DeleteQuestionnaireTicketDocument = gql`
  mutation DeleteQuestionnaireTicket($id: Int!) {
    deleteQuestionnnaireTicket(id: $id)
  }
`;
export type DeleteQuestionnaireTicketMutationFn = Apollo.MutationFunction<
  DeleteQuestionnaireTicketMutation,
  DeleteQuestionnaireTicketMutationVariables
>;

/**
 * __useDeleteQuestionnaireTicketMutation__
 *
 * To run a mutation, you first call `useDeleteQuestionnaireTicketMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteQuestionnaireTicketMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteQuestionnaireTicketMutation, { data, loading, error }] = useDeleteQuestionnaireTicketMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteQuestionnaireTicketMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteQuestionnaireTicketMutation,
    DeleteQuestionnaireTicketMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteQuestionnaireTicketMutation,
    DeleteQuestionnaireTicketMutationVariables
  >(DeleteQuestionnaireTicketDocument, options);
}
export type DeleteQuestionnaireTicketMutationHookResult = ReturnType<
  typeof useDeleteQuestionnaireTicketMutation
>;
export type DeleteQuestionnaireTicketMutationResult =
  Apollo.MutationResult<DeleteQuestionnaireTicketMutation>;
export type DeleteQuestionnaireTicketMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteQuestionnaireTicketMutation,
    DeleteQuestionnaireTicketMutationVariables
  >;
