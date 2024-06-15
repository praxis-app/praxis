import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { RuleFragmentDoc } from '../../../rules/fragments/gen/Rule.gen';
import { ServerRoleViewFragmentDoc } from '../../../roles/fragments/gen/ServerRoleView.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type AboutQueryVariables = Types.Exact<{ [key: string]: never }>;

export type AboutQuery = {
  __typename?: 'Query';
  serverConfig: {
    __typename?: 'ServerConfig';
    id: number;
    about?: string | null;
    websiteURL: string;
  };
  serverRules: Array<{
    __typename?: 'Rule';
    id: number;
    title: string;
    description: string;
    priority: number;
    updatedAt: any;
  }>;
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
};

export const AboutDocument = gql`
  query About {
    serverConfig {
      id
      about
      websiteURL
    }
    serverRules {
      ...Rule
    }
    serverRoles {
      ...ServerRoleView
    }
  }
  ${RuleFragmentDoc}
  ${ServerRoleViewFragmentDoc}
`;

/**
 * __useAboutQuery__
 *
 * To run a query within a React component, call `useAboutQuery` and pass it any options that fit your needs.
 * When your component renders, `useAboutQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAboutQuery({
 *   variables: {
 *   },
 * });
 */
export function useAboutQuery(
  baseOptions?: Apollo.QueryHookOptions<AboutQuery, AboutQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<AboutQuery, AboutQueryVariables>(
    AboutDocument,
    options,
  );
}
export function useAboutLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<AboutQuery, AboutQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<AboutQuery, AboutQueryVariables>(
    AboutDocument,
    options,
  );
}
export type AboutQueryHookResult = ReturnType<typeof useAboutQuery>;
export type AboutLazyQueryHookResult = ReturnType<typeof useAboutLazyQuery>;
export type AboutQueryResult = Apollo.QueryResult<
  AboutQuery,
  AboutQueryVariables
>;
