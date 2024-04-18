import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type PrivacyPolicyQueryVariables = Types.Exact<{ [key: string]: never }>;

export type PrivacyPolicyQuery = {
  __typename?: 'Query';
  serverConfig: {
    __typename?: 'ServerConfig';
    id: number;
    websiteURL: string;
    contactEmail: string;
  };
};

export const PrivacyPolicyDocument = gql`
  query PrivacyPolicy {
    serverConfig {
      id
      websiteURL
      contactEmail
    }
  }
`;

/**
 * __usePrivacyPolicyQuery__
 *
 * To run a query within a React component, call `usePrivacyPolicyQuery` and pass it any options that fit your needs.
 * When your component renders, `usePrivacyPolicyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePrivacyPolicyQuery({
 *   variables: {
 *   },
 * });
 */
export function usePrivacyPolicyQuery(
  baseOptions?: Apollo.QueryHookOptions<
    PrivacyPolicyQuery,
    PrivacyPolicyQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<PrivacyPolicyQuery, PrivacyPolicyQueryVariables>(
    PrivacyPolicyDocument,
    options,
  );
}
export function usePrivacyPolicyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    PrivacyPolicyQuery,
    PrivacyPolicyQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<PrivacyPolicyQuery, PrivacyPolicyQueryVariables>(
    PrivacyPolicyDocument,
    options,
  );
}
export type PrivacyPolicyQueryHookResult = ReturnType<
  typeof usePrivacyPolicyQuery
>;
export type PrivacyPolicyLazyQueryHookResult = ReturnType<
  typeof usePrivacyPolicyLazyQuery
>;
export type PrivacyPolicyQueryResult = Apollo.QueryResult<
  PrivacyPolicyQuery,
  PrivacyPolicyQueryVariables
>;
