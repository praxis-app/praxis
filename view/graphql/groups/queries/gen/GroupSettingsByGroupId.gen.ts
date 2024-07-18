import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type GroupSettingsByGroupIdQueryVariables = Types.Exact<{
  groupId: Types.Scalars['Int']['input'];
}>;

export type GroupSettingsByGroupIdQuery = {
  __typename?: 'Query';
  group: {
    __typename?: 'Group';
    id: number;
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

export const GroupSettingsByGroupIdDocument = gql`
  query GroupSettingsByGroupId($groupId: Int!) {
    group(id: $groupId) {
      id
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
 * __useGroupSettingsByGroupIdQuery__
 *
 * To run a query within a React component, call `useGroupSettingsByGroupIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupSettingsByGroupIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupSettingsByGroupIdQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGroupSettingsByGroupIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GroupSettingsByGroupIdQuery,
    GroupSettingsByGroupIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GroupSettingsByGroupIdQuery,
    GroupSettingsByGroupIdQueryVariables
  >(GroupSettingsByGroupIdDocument, options);
}
export function useGroupSettingsByGroupIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GroupSettingsByGroupIdQuery,
    GroupSettingsByGroupIdQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GroupSettingsByGroupIdQuery,
    GroupSettingsByGroupIdQueryVariables
  >(GroupSettingsByGroupIdDocument, options);
}
export type GroupSettingsByGroupIdQueryHookResult = ReturnType<
  typeof useGroupSettingsByGroupIdQuery
>;
export type GroupSettingsByGroupIdLazyQueryHookResult = ReturnType<
  typeof useGroupSettingsByGroupIdLazyQuery
>;
export type GroupSettingsByGroupIdQueryResult = Apollo.QueryResult<
  GroupSettingsByGroupIdQuery,
  GroupSettingsByGroupIdQueryVariables
>;
