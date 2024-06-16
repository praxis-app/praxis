import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { ServerRoleViewFragmentDoc } from '../../fragments/gen/ServerRoleView.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ViewServerRolesQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type ViewServerRolesQuery = {
  __typename?: 'Query';
  serverRoles: Array<{
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
  }>;
  me: {
    __typename?: 'User';
    id: number;
    serverPermissions: {
      __typename?: 'ServerPermissions';
      manageRoles: boolean;
    };
  };
};

export const ViewServerRolesDocument = gql`
  query ViewServerRoles {
    serverRoles {
      ...ServerRoleView
    }
    me {
      id
      serverPermissions {
        manageRoles
      }
    }
  }
  ${ServerRoleViewFragmentDoc}
`;

/**
 * __useViewServerRolesQuery__
 *
 * To run a query within a React component, call `useViewServerRolesQuery` and pass it any options that fit your needs.
 * When your component renders, `useViewServerRolesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useViewServerRolesQuery({
 *   variables: {
 *   },
 * });
 */
export function useViewServerRolesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ViewServerRolesQuery,
    ViewServerRolesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ViewServerRolesQuery, ViewServerRolesQueryVariables>(
    ViewServerRolesDocument,
    options,
  );
}
export function useViewServerRolesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ViewServerRolesQuery,
    ViewServerRolesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ViewServerRolesQuery,
    ViewServerRolesQueryVariables
  >(ViewServerRolesDocument, options);
}
export type ViewServerRolesQueryHookResult = ReturnType<
  typeof useViewServerRolesQuery
>;
export type ViewServerRolesLazyQueryHookResult = ReturnType<
  typeof useViewServerRolesLazyQuery
>;
export type ViewServerRolesQueryResult = Apollo.QueryResult<
  ViewServerRolesQuery,
  ViewServerRolesQueryVariables
>;
