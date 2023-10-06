import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { ProposalFormFragmentDoc } from './ProposalForm.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type EditProposalQueryVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type EditProposalQuery = {
  __typename?: 'Query';
  proposal: {
    __typename?: 'Proposal';
    id: number;
    body?: string | null;
    action: {
      __typename?: 'ProposalAction';
      id: number;
      actionType: string;
      groupDescription?: string | null;
      groupName?: string | null;
      groupCoverPhoto?: {
        __typename?: 'Image';
        id: number;
        filename: string;
      } | null;
      role?: { __typename?: 'ProposalActionRole'; id: number } | null;
    };
    images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
  };
};

export const EditProposalDocument = gql`
  query EditProposal($id: Int!) {
    proposal(id: $id) {
      ...ProposalForm
    }
  }
  ${ProposalFormFragmentDoc}
`;

/**
 * __useEditProposalQuery__
 *
 * To run a query within a React component, call `useEditProposalQuery` and pass it any options that fit your needs.
 * When your component renders, `useEditProposalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEditProposalQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useEditProposalQuery(
  baseOptions: Apollo.QueryHookOptions<
    EditProposalQuery,
    EditProposalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<EditProposalQuery, EditProposalQueryVariables>(
    EditProposalDocument,
    options,
  );
}
export function useEditProposalLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    EditProposalQuery,
    EditProposalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<EditProposalQuery, EditProposalQueryVariables>(
    EditProposalDocument,
    options,
  );
}
export type EditProposalQueryHookResult = ReturnType<
  typeof useEditProposalQuery
>;
export type EditProposalLazyQueryHookResult = ReturnType<
  typeof useEditProposalLazyQuery
>;
export type EditProposalQueryResult = Apollo.QueryResult<
  EditProposalQuery,
  EditProposalQueryVariables
>;
