import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type IsVerifiedUserQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type IsVerifiedUserQuery = {
  __typename?: 'Query';
  me: { __typename?: 'User'; id: number; isVerified: boolean };
};

export const IsVerifiedUserDocument = gql`
  query IsVerifiedUser {
    me {
      id
      isVerified
    }
  }
`;

/**
 * __useIsVerifiedUserQuery__
 *
 * To run a query within a React component, call `useIsVerifiedUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsVerifiedUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsVerifiedUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useIsVerifiedUserQuery(
  baseOptions?: Apollo.QueryHookOptions<
    IsVerifiedUserQuery,
    IsVerifiedUserQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<IsVerifiedUserQuery, IsVerifiedUserQueryVariables>(
    IsVerifiedUserDocument,
    options,
  );
}
export function useIsVerifiedUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    IsVerifiedUserQuery,
    IsVerifiedUserQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<IsVerifiedUserQuery, IsVerifiedUserQueryVariables>(
    IsVerifiedUserDocument,
    options,
  );
}
export type IsVerifiedUserQueryHookResult = ReturnType<
  typeof useIsVerifiedUserQuery
>;
export type IsVerifiedUserLazyQueryHookResult = ReturnType<
  typeof useIsVerifiedUserLazyQuery
>;
export type IsVerifiedUserQueryResult = Apollo.QueryResult<
  IsVerifiedUserQuery,
  IsVerifiedUserQueryVariables
>;
