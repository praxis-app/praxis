import * as Types from '../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UserByUserIdQueryVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type UserByUserIdQuery = {
  __typename?: 'Query';
  user: { __typename?: 'User'; id: number; name: string };
};

export const UserByUserIdDocument = gql`
  query UserByUserId($id: Int!) {
    user(id: $id) {
      id
      name
    }
  }
`;

/**
 * __useUserByUserIdQuery__
 *
 * To run a query within a React component, call `useUserByUserIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserByUserIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserByUserIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUserByUserIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    UserByUserIdQuery,
    UserByUserIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<UserByUserIdQuery, UserByUserIdQueryVariables>(
    UserByUserIdDocument,
    options,
  );
}
export function useUserByUserIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    UserByUserIdQuery,
    UserByUserIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<UserByUserIdQuery, UserByUserIdQueryVariables>(
    UserByUserIdDocument,
    options,
  );
}
export type UserByUserIdQueryHookResult = ReturnType<
  typeof useUserByUserIdQuery
>;
export type UserByUserIdLazyQueryHookResult = ReturnType<
  typeof useUserByUserIdLazyQuery
>;
export type UserByUserIdQueryResult = Apollo.QueryResult<
  UserByUserIdQuery,
  UserByUserIdQueryVariables
>;
