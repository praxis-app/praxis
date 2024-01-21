import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type DeleteQuestionMutationVariables = Types.Exact<{
  id: Types.Scalars['Int']['input'];
}>;

export type DeleteQuestionMutation = {
  __typename?: 'Mutation';
  deleteQuestion: boolean;
};

export const DeleteQuestionDocument = gql`
  mutation DeleteQuestion($id: Int!) {
    deleteQuestion(id: $id)
  }
`;
export type DeleteQuestionMutationFn = Apollo.MutationFunction<
  DeleteQuestionMutation,
  DeleteQuestionMutationVariables
>;

/**
 * __useDeleteQuestionMutation__
 *
 * To run a mutation, you first call `useDeleteQuestionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteQuestionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteQuestionMutation, { data, loading, error }] = useDeleteQuestionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteQuestionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteQuestionMutation,
    DeleteQuestionMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteQuestionMutation,
    DeleteQuestionMutationVariables
  >(DeleteQuestionDocument, options);
}
export type DeleteQuestionMutationHookResult = ReturnType<
  typeof useDeleteQuestionMutation
>;
export type DeleteQuestionMutationResult =
  Apollo.MutationResult<DeleteQuestionMutation>;
export type DeleteQuestionMutationOptions = Apollo.BaseMutationOptions<
  DeleteQuestionMutation,
  DeleteQuestionMutationVariables
>;
