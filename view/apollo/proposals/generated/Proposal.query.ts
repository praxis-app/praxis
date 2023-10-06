import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { ProposalCardFragmentDoc } from './ProposalCard.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ProposalQueryVariables = Types.Exact<{
  id: Types.Scalars['Int'];
  isLoggedIn: Types.Scalars['Boolean'];
}>;

export type ProposalQuery = {
  __typename?: 'Query';
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

export const ProposalDocument = gql`
  query Proposal($id: Int!, $isLoggedIn: Boolean!) {
    proposal(id: $id) {
      ...ProposalCard
    }
  }
  ${ProposalCardFragmentDoc}
`;

/**
 * __useProposalQuery__
 *
 * To run a query within a React component, call `useProposalQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalQuery({
 *   variables: {
 *      id: // value for 'id'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useProposalQuery(
  baseOptions: Apollo.QueryHookOptions<ProposalQuery, ProposalQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ProposalQuery, ProposalQueryVariables>(
    ProposalDocument,
    options,
  );
}
export function useProposalLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ProposalQuery,
    ProposalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ProposalQuery, ProposalQueryVariables>(
    ProposalDocument,
    options,
  );
}
export type ProposalQueryHookResult = ReturnType<typeof useProposalQuery>;
export type ProposalLazyQueryHookResult = ReturnType<
  typeof useProposalLazyQuery
>;
export type ProposalQueryResult = Apollo.QueryResult<
  ProposalQuery,
  ProposalQueryVariables
>;
