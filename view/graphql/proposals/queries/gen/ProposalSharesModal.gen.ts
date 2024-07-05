import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { PostShareCompactFragmentDoc } from '../../../posts/fragments/gen/PostShareCompact.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ProposalSharesModalQueryVariables = Types.Exact<{
  proposalId: Types.Scalars['Int']['input'];
  isVerified: Types.Scalars['Boolean']['input'];
}>;

export type ProposalSharesModalQuery = {
  __typename?: 'Query';
  proposal: {
    __typename?: 'Proposal';
    id: number;
    shares: Array<{
      __typename?: 'Post';
      id: number;
      likeCount: number;
      shareCount: number;
      isLikedByMe?: boolean;
      createdAt: any;
      user: {
        __typename?: 'User';
        id: number;
        name: string;
        displayName?: string | null;
        profilePicture: { __typename?: 'Image'; id: number };
      };
      group?: {
        __typename?: 'Group';
        id: number;
        name: string;
        coverPhoto?: { __typename?: 'Image'; id: number } | null;
      } | null;
      event?: {
        __typename?: 'Event';
        id: number;
        name: string;
        coverPhoto: { __typename?: 'Image'; id: number };
      } | null;
    }>;
  };
  me: {
    __typename?: 'User';
    id: number;
    serverPermissions: {
      __typename?: 'ServerPermissions';
      managePosts: boolean;
    };
  };
};

export const ProposalSharesModalDocument = gql`
  query ProposalSharesModal($proposalId: Int!, $isVerified: Boolean!) {
    proposal(id: $proposalId) {
      id
      shares {
        ...PostShareCompact
      }
    }
    me {
      id
      serverPermissions {
        managePosts
      }
    }
  }
  ${PostShareCompactFragmentDoc}
`;

/**
 * __useProposalSharesModalQuery__
 *
 * To run a query within a React component, call `useProposalSharesModalQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalSharesModalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalSharesModalQuery({
 *   variables: {
 *      proposalId: // value for 'proposalId'
 *      isVerified: // value for 'isVerified'
 *   },
 * });
 */
export function useProposalSharesModalQuery(
  baseOptions: Apollo.QueryHookOptions<
    ProposalSharesModalQuery,
    ProposalSharesModalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    ProposalSharesModalQuery,
    ProposalSharesModalQueryVariables
  >(ProposalSharesModalDocument, options);
}
export function useProposalSharesModalLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ProposalSharesModalQuery,
    ProposalSharesModalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ProposalSharesModalQuery,
    ProposalSharesModalQueryVariables
  >(ProposalSharesModalDocument, options);
}
export type ProposalSharesModalQueryHookResult = ReturnType<
  typeof useProposalSharesModalQuery
>;
export type ProposalSharesModalLazyQueryHookResult = ReturnType<
  typeof useProposalSharesModalLazyQuery
>;
export type ProposalSharesModalQueryResult = Apollo.QueryResult<
  ProposalSharesModalQuery,
  ProposalSharesModalQueryVariables
>;
