import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ServerInviteQueryVariables = Types.Exact<{
  token: Types.Scalars['String'];
}>;

export type ServerInviteQuery = {
  __typename?: 'Query';
  serverInvite: { __typename?: 'ServerInvite'; id: number; token: string };
};

export const ServerInviteDocument = gql`
  query ServerInvite($token: String!) {
    serverInvite(token: $token) {
      id
      token
    }
  }
`;

/**
 * __useServerInviteQuery__
 *
 * To run a query within a React component, call `useServerInviteQuery` and pass it any options that fit your needs.
 * When your component renders, `useServerInviteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServerInviteQuery({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useServerInviteQuery(
  baseOptions: Apollo.QueryHookOptions<
    ServerInviteQuery,
    ServerInviteQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ServerInviteQuery, ServerInviteQueryVariables>(
    ServerInviteDocument,
    options,
  );
}
export function useServerInviteLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ServerInviteQuery,
    ServerInviteQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ServerInviteQuery, ServerInviteQueryVariables>(
    ServerInviteDocument,
    options,
  );
}
export type ServerInviteQueryHookResult = ReturnType<
  typeof useServerInviteQuery
>;
export type ServerInviteLazyQueryHookResult = ReturnType<
  typeof useServerInviteLazyQuery
>;
export type ServerInviteQueryResult = Apollo.QueryResult<
  ServerInviteQuery,
  ServerInviteQueryVariables
>;
