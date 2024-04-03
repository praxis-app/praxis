import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type IsValidResetPasswordTokenQueryVariables = Types.Exact<{
  token: Types.Scalars['String']['input'];
}>;

export type IsValidResetPasswordTokenQuery = {
  __typename?: 'Query';
  isValidResetPasswordToken: boolean;
};

export const IsValidResetPasswordTokenDocument = gql`
  query IsValidResetPasswordToken($token: String!) {
    isValidResetPasswordToken(token: $token)
  }
`;

/**
 * __useIsValidResetPasswordTokenQuery__
 *
 * To run a query within a React component, call `useIsValidResetPasswordTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsValidResetPasswordTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsValidResetPasswordTokenQuery({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useIsValidResetPasswordTokenQuery(
  baseOptions: Apollo.QueryHookOptions<
    IsValidResetPasswordTokenQuery,
    IsValidResetPasswordTokenQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    IsValidResetPasswordTokenQuery,
    IsValidResetPasswordTokenQueryVariables
  >(IsValidResetPasswordTokenDocument, options);
}
export function useIsValidResetPasswordTokenLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    IsValidResetPasswordTokenQuery,
    IsValidResetPasswordTokenQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    IsValidResetPasswordTokenQuery,
    IsValidResetPasswordTokenQueryVariables
  >(IsValidResetPasswordTokenDocument, options);
}
export type IsValidResetPasswordTokenQueryHookResult = ReturnType<
  typeof useIsValidResetPasswordTokenQuery
>;
export type IsValidResetPasswordTokenLazyQueryHookResult = ReturnType<
  typeof useIsValidResetPasswordTokenLazyQuery
>;
export type IsValidResetPasswordTokenQueryResult = Apollo.QueryResult<
  IsValidResetPasswordTokenQuery,
  IsValidResetPasswordTokenQueryVariables
>;
