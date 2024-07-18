import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type GroupAboutTabQueryVariables = Types.Exact<{
  groupId: Types.Scalars['Int']['input'];
}>;

export type GroupAboutTabQuery = {
  __typename?: 'Query';
  group: {
    __typename?: 'Group';
    id: number;
    description: string;
    settings: {
      __typename?: 'GroupConfig';
      id: number;
      adminModel: string;
      decisionMakingModel: Types.DecisionMakingModel;
      ratificationThreshold: number;
      reservationsLimit: number;
      standAsidesLimit: number;
      votingTimeLimit: number;
      privacy: string;
    };
  };
};

export const GroupAboutTabDocument = gql`
  query GroupAboutTab($groupId: Int!) {
    group(id: $groupId) {
      id
      description
      settings {
        id
        adminModel
        decisionMakingModel
        ratificationThreshold
        reservationsLimit
        standAsidesLimit
        votingTimeLimit
        privacy
      }
    }
  }
`;

/**
 * __useGroupAboutTabQuery__
 *
 * To run a query within a React component, call `useGroupAboutTabQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupAboutTabQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupAboutTabQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGroupAboutTabQuery(
  baseOptions: Apollo.QueryHookOptions<
    GroupAboutTabQuery,
    GroupAboutTabQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GroupAboutTabQuery, GroupAboutTabQueryVariables>(
    GroupAboutTabDocument,
    options,
  );
}
export function useGroupAboutTabLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GroupAboutTabQuery,
    GroupAboutTabQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GroupAboutTabQuery, GroupAboutTabQueryVariables>(
    GroupAboutTabDocument,
    options,
  );
}
export type GroupAboutTabQueryHookResult = ReturnType<
  typeof useGroupAboutTabQuery
>;
export type GroupAboutTabLazyQueryHookResult = ReturnType<
  typeof useGroupAboutTabLazyQuery
>;
export type GroupAboutTabQueryResult = Apollo.QueryResult<
  GroupAboutTabQuery,
  GroupAboutTabQueryVariables
>;
