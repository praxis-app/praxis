import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { GroupFormFragmentDoc } from './GroupForm.fragment';
import { GroupPermissionsFragmentDoc } from './GroupPermissions.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type EditGroupQueryVariables = Types.Exact<{
  name: Types.Scalars['String'];
}>;

export type EditGroupQuery = {
  __typename?: 'Query';
  group: {
    __typename?: 'Group';
    id: number;
    name: string;
    description: string;
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
  };
};

export const EditGroupDocument = gql`
  query EditGroup($name: String!) {
    group(name: $name) {
      ...GroupForm
      myPermissions {
        ...GroupPermissions
      }
    }
  }
  ${GroupFormFragmentDoc}
  ${GroupPermissionsFragmentDoc}
`;

/**
 * __useEditGroupQuery__
 *
 * To run a query within a React component, call `useEditGroupQuery` and pass it any options that fit your needs.
 * When your component renders, `useEditGroupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEditGroupQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useEditGroupQuery(
  baseOptions: Apollo.QueryHookOptions<EditGroupQuery, EditGroupQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<EditGroupQuery, EditGroupQueryVariables>(
    EditGroupDocument,
    options,
  );
}
export function useEditGroupLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    EditGroupQuery,
    EditGroupQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<EditGroupQuery, EditGroupQueryVariables>(
    EditGroupDocument,
    options,
  );
}
export type EditGroupQueryHookResult = ReturnType<typeof useEditGroupQuery>;
export type EditGroupLazyQueryHookResult = ReturnType<
  typeof useEditGroupLazyQuery
>;
export type EditGroupQueryResult = Apollo.QueryResult<
  EditGroupQuery,
  EditGroupQueryVariables
>;
