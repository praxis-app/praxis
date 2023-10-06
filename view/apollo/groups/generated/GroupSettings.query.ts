import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { GroupSettingsFormFragmentDoc } from './GroupSettingsForm.fragment';
import { GroupPermissionsFragmentDoc } from './GroupPermissions.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type GroupSettingsQueryVariables = Types.Exact<{
  name: Types.Scalars['String'];
}>;

export type GroupSettingsQuery = {
  __typename?: 'Query';
  group: {
    __typename?: 'Group';
    id: number;
    myPermissions: {
      __typename?: 'GroupPermissions';
      approveMemberRequests: boolean;
      createEvents: boolean;
      deleteGroup: boolean;
      manageComments: boolean;
      manageEvents: boolean;
      managePosts: boolean;
      manageRoles: boolean;
      manageSettings: boolean;
      removeMembers: boolean;
      updateGroup: boolean;
    };
    settings: { __typename?: 'GroupConfig'; id: number; isPublic: boolean };
  };
};

export const GroupSettingsDocument = gql`
  query GroupSettings($name: String!) {
    group(name: $name) {
      id
      ...GroupSettingsForm
      myPermissions {
        ...GroupPermissions
      }
    }
  }
  ${GroupSettingsFormFragmentDoc}
  ${GroupPermissionsFragmentDoc}
`;

/**
 * __useGroupSettingsQuery__
 *
 * To run a query within a React component, call `useGroupSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupSettingsQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useGroupSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GroupSettingsQuery,
    GroupSettingsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GroupSettingsQuery, GroupSettingsQueryVariables>(
    GroupSettingsDocument,
    options,
  );
}
export function useGroupSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GroupSettingsQuery,
    GroupSettingsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GroupSettingsQuery, GroupSettingsQueryVariables>(
    GroupSettingsDocument,
    options,
  );
}
export type GroupSettingsQueryHookResult = ReturnType<
  typeof useGroupSettingsQuery
>;
export type GroupSettingsLazyQueryHookResult = ReturnType<
  typeof useGroupSettingsLazyQuery
>;
export type GroupSettingsQueryResult = Apollo.QueryResult<
  GroupSettingsQuery,
  GroupSettingsQueryVariables
>;
