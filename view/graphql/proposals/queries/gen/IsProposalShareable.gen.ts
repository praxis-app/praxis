import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { GroupAvatarFragmentDoc } from '../../../groups/fragments/gen/GroupAvatar.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type IsProposalShareableQueryVariables = Types.Exact<{
  proposalId: Types.Scalars['Int']['input'];
}>;

export type IsProposalShareableQuery = {
  __typename?: 'Query';
  proposal: {
    __typename?: 'Proposal';
    id: number;
    group?: {
      __typename?: 'Group';
      id: number;
      name: string;
      description: string;
      isJoinedByMe: boolean;
      coverPhoto?: { __typename?: 'Image'; id: number } | null;
    } | null;
  };
};

export const IsProposalShareableDocument = gql`
  query IsProposalShareable($proposalId: Int!) {
    proposal(id: $proposalId) {
      id
      group {
        id
        name
        description
        isJoinedByMe
        ...GroupAvatar
      }
    }
  }
  ${GroupAvatarFragmentDoc}
`;

/**
 * __useIsProposalShareableQuery__
 *
 * To run a query within a React component, call `useIsProposalShareableQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsProposalShareableQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsProposalShareableQuery({
 *   variables: {
 *      proposalId: // value for 'proposalId'
 *   },
 * });
 */
export function useIsProposalShareableQuery(
  baseOptions: Apollo.QueryHookOptions<
    IsProposalShareableQuery,
    IsProposalShareableQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    IsProposalShareableQuery,
    IsProposalShareableQueryVariables
  >(IsProposalShareableDocument, options);
}
export function useIsProposalShareableLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    IsProposalShareableQuery,
    IsProposalShareableQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    IsProposalShareableQuery,
    IsProposalShareableQueryVariables
  >(IsProposalShareableDocument, options);
}
export type IsProposalShareableQueryHookResult = ReturnType<
  typeof useIsProposalShareableQuery
>;
export type IsProposalShareableLazyQueryHookResult = ReturnType<
  typeof useIsProposalShareableLazyQuery
>;
export type IsProposalShareableQueryResult = Apollo.QueryResult<
  IsProposalShareableQuery,
  IsProposalShareableQueryVariables
>;
