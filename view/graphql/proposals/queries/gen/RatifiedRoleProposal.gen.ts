import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { ProposalActionRoleFragmentDoc } from '../../fragments/gen/ProposalActionRole.gen';
import { ServerRoleViewFragmentDoc } from '../../../roles/fragments/gen/ServerRoleView.gen';
import { EditGroupRoleTabsFragmentDoc } from '../../../groups/fragments/gen/EditGroupRoleTabs.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type RatifiedRoleProposalQueryVariables = Types.Exact<{
  proposalId: Types.Scalars['Int']['input'];
}>;

export type RatifiedRoleProposalQuery = {
  __typename?: 'Query';
  proposal: {
    __typename?: 'Proposal';
    id: number;
    action: {
      __typename?: 'ProposalAction';
      id: number;
      role?: {
        __typename?: 'ProposalActionRole';
        id: number;
        name?: string | null;
        color?: string | null;
        oldName?: string | null;
        oldColor?: string | null;
        serverRole?: {
          __typename?: 'ServerRole';
          id: number;
          name: string;
          color: string;
          permissions: {
            __typename?: 'ServerRolePermission';
            id: number;
            createInvites: boolean;
            manageComments: boolean;
            manageEvents: boolean;
            manageInvites: boolean;
            managePosts: boolean;
            manageQuestionnaireTickets: boolean;
            manageQuestions: boolean;
            manageRoles: boolean;
            manageRules: boolean;
            manageSettings: boolean;
            removeGroups: boolean;
            removeMembers: boolean;
            removeProposals: boolean;
          };
          members: Array<{
            __typename?: 'User';
            id: number;
            name: string;
            displayName?: string | null;
            profilePicture: { __typename?: 'Image'; id: number };
          }>;
        } | null;
        groupRole?: {
          __typename?: 'GroupRole';
          id: number;
          name: string;
          color: string;
          memberCount: number;
          permissions: {
            __typename?: 'GroupRolePermission';
            id: number;
            approveMemberRequests: boolean;
            createEvents: boolean;
            deleteGroup: boolean;
            manageComments: boolean;
            manageEvents: boolean;
            managePosts: boolean;
            manageRoles: boolean;
            manageSettings: boolean;
            removeMembers: boolean;
            updateGroup: boolean;
          };
          availableUsersToAdd: Array<{
            __typename?: 'User';
            id: number;
            name: string;
            displayName?: string | null;
            profilePicture: { __typename?: 'Image'; id: number };
          }>;
          group: { __typename?: 'Group'; id: number; name: string };
          members: Array<{
            __typename?: 'User';
            id: number;
            name: string;
            displayName?: string | null;
            profilePicture: { __typename?: 'Image'; id: number };
          }>;
        } | null;
        permissions: {
          __typename?: 'ProposalActionPermission';
          id: number;
          approveMemberRequests?: boolean | null;
          createEvents?: boolean | null;
          createInvites?: boolean | null;
          deleteGroup?: boolean | null;
          manageComments?: boolean | null;
          manageEvents?: boolean | null;
          manageInvites?: boolean | null;
          managePosts?: boolean | null;
          manageQuestionnaireTickets?: boolean | null;
          manageQuestions?: boolean | null;
          manageRoles?: boolean | null;
          manageRules?: boolean | null;
          manageSettings?: boolean | null;
          removeGroups?: boolean | null;
          removeMembers?: boolean | null;
          removeProposals?: boolean | null;
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
            displayName?: string | null;
            profilePicture: { __typename?: 'Image'; id: number };
          };
        }> | null;
      } | null;
    };
  };
};

export const RatifiedRoleProposalDocument = gql`
  query RatifiedRoleProposal($proposalId: Int!) {
    proposal(id: $proposalId) {
      id
      action {
        id
        role {
          ...ProposalActionRole
          serverRole {
            ...ServerRoleView
          }
          groupRole {
            ...EditGroupRoleTabs
          }
        }
      }
    }
  }
  ${ProposalActionRoleFragmentDoc}
  ${ServerRoleViewFragmentDoc}
  ${EditGroupRoleTabsFragmentDoc}
`;

/**
 * __useRatifiedRoleProposalQuery__
 *
 * To run a query within a React component, call `useRatifiedRoleProposalQuery` and pass it any options that fit your needs.
 * When your component renders, `useRatifiedRoleProposalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRatifiedRoleProposalQuery({
 *   variables: {
 *      proposalId: // value for 'proposalId'
 *   },
 * });
 */
export function useRatifiedRoleProposalQuery(
  baseOptions: Apollo.QueryHookOptions<
    RatifiedRoleProposalQuery,
    RatifiedRoleProposalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    RatifiedRoleProposalQuery,
    RatifiedRoleProposalQueryVariables
  >(RatifiedRoleProposalDocument, options);
}
export function useRatifiedRoleProposalLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    RatifiedRoleProposalQuery,
    RatifiedRoleProposalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    RatifiedRoleProposalQuery,
    RatifiedRoleProposalQueryVariables
  >(RatifiedRoleProposalDocument, options);
}
export type RatifiedRoleProposalQueryHookResult = ReturnType<
  typeof useRatifiedRoleProposalQuery
>;
export type RatifiedRoleProposalLazyQueryHookResult = ReturnType<
  typeof useRatifiedRoleProposalLazyQuery
>;
export type RatifiedRoleProposalQueryResult = Apollo.QueryResult<
  RatifiedRoleProposalQuery,
  RatifiedRoleProposalQueryVariables
>;
