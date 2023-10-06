import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { CommentFragmentDoc } from '../../comments/generated/Comment.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ProposalCommentsQueryVariables = Types.Exact<{
  id: Types.Scalars['Int'];
  isLoggedIn: Types.Scalars['Boolean'];
}>;

export type ProposalCommentsQuery = {
  __typename?: 'Query';
  proposal: {
    __typename?: 'Proposal';
    id: number;
    comments: Array<{
      __typename?: 'Comment';
      id: number;
      body?: string | null;
      images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
      user: {
        __typename?: 'User';
        id: number;
        name: string;
        profilePicture: { __typename?: 'Image'; id: number };
      };
    }>;
  };
  me?: {
    __typename?: 'User';
    id: number;
    serverPermissions: {
      __typename?: 'ServerPermissions';
      manageComments: boolean;
    };
  };
};

export const ProposalCommentsDocument = gql`
  query ProposalComments($id: Int!, $isLoggedIn: Boolean!) {
    proposal(id: $id) {
      id
      comments {
        ...Comment
      }
    }
    me @include(if: $isLoggedIn) {
      id
      serverPermissions {
        manageComments
      }
    }
  }
  ${CommentFragmentDoc}
`;

/**
 * __useProposalCommentsQuery__
 *
 * To run a query within a React component, call `useProposalCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalCommentsQuery({
 *   variables: {
 *      id: // value for 'id'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useProposalCommentsQuery(
  baseOptions: Apollo.QueryHookOptions<
    ProposalCommentsQuery,
    ProposalCommentsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ProposalCommentsQuery, ProposalCommentsQueryVariables>(
    ProposalCommentsDocument,
    options,
  );
}
export function useProposalCommentsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ProposalCommentsQuery,
    ProposalCommentsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ProposalCommentsQuery,
    ProposalCommentsQueryVariables
  >(ProposalCommentsDocument, options);
}
export type ProposalCommentsQueryHookResult = ReturnType<
  typeof useProposalCommentsQuery
>;
export type ProposalCommentsLazyQueryHookResult = ReturnType<
  typeof useProposalCommentsLazyQuery
>;
export type ProposalCommentsQueryResult = Apollo.QueryResult<
  ProposalCommentsQuery,
  ProposalCommentsQueryVariables
>;
