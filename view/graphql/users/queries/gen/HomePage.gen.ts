import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { ToggleFormsFragmentDoc } from '../../fragments/gen/ToggleForms.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type HomePageQueryVariables = Types.Exact<{ [key: string]: never }>;

export type HomePageQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'User';
    id: number;
    joinedGroups: Array<{
      __typename?: 'Group';
      id: number;
      name: string;
      settings: {
        __typename?: 'GroupConfig';
        id: number;
        votingTimeLimit: number;
      };
    }>;
  };
};

export const HomePageDocument = gql`
  query HomePage {
    me {
      id
      ...ToggleForms
    }
  }
  ${ToggleFormsFragmentDoc}
`;

/**
 * __useHomePageQuery__
 *
 * To run a query within a React component, call `useHomePageQuery` and pass it any options that fit your needs.
 * When your component renders, `useHomePageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHomePageQuery({
 *   variables: {
 *   },
 * });
 */
export function useHomePageQuery(
  baseOptions?: Apollo.QueryHookOptions<HomePageQuery, HomePageQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HomePageQuery, HomePageQueryVariables>(
    HomePageDocument,
    options,
  );
}
export function useHomePageLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HomePageQuery,
    HomePageQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HomePageQuery, HomePageQueryVariables>(
    HomePageDocument,
    options,
  );
}
export type HomePageQueryHookResult = ReturnType<typeof useHomePageQuery>;
export type HomePageLazyQueryHookResult = ReturnType<
  typeof useHomePageLazyQuery
>;
export type HomePageQueryResult = Apollo.QueryResult<
  HomePageQuery,
  HomePageQueryVariables
>;
