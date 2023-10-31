import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { ServerSettingsFormFragmentDoc } from '../../fragments/gen/ServerSettingsForm.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ServerSettingsQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type ServerSettingsQuery = {
  __typename?: 'Query';
  serverConfig: {
    __typename?: 'ServerConfig';
    id: number;
    showCanary: boolean;
  };
  canaryStatement: { __typename?: 'Canary'; id: number; statement: string };
};

export const ServerSettingsDocument = gql`
  query ServerSettings {
    serverConfig {
      ...ServerSettingsForm
    }
    canaryStatement {
      id
      statement
    }
  }
  ${ServerSettingsFormFragmentDoc}
`;

/**
 * __useServerSettingsQuery__
 *
 * To run a query within a React component, call `useServerSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useServerSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServerSettingsQuery({
 *   variables: {
 *   },
 * });
 */
export function useServerSettingsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ServerSettingsQuery,
    ServerSettingsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ServerSettingsQuery, ServerSettingsQueryVariables>(
    ServerSettingsDocument,
    options,
  );
}
export function useServerSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ServerSettingsQuery,
    ServerSettingsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ServerSettingsQuery, ServerSettingsQueryVariables>(
    ServerSettingsDocument,
    options,
  );
}
export type ServerSettingsQueryHookResult = ReturnType<
  typeof useServerSettingsQuery
>;
export type ServerSettingsLazyQueryHookResult = ReturnType<
  typeof useServerSettingsLazyQuery
>;
export type ServerSettingsQueryResult = Apollo.QueryResult<
  ServerSettingsQuery,
  ServerSettingsQueryVariables
>;
