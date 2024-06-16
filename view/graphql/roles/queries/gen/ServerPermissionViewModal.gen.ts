import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../../users/fragments/gen/UserAvatar.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ServerPermissionViewModalQueryVariables = Types.Exact<{
  permissionName: Types.Scalars['String']['input'];
}>;

export type ServerPermissionViewModalQuery = {
  __typename?: 'Query';
  serverRoles: Array<{
    __typename?: 'ServerRole';
    id: number;
    name: string;
    color: string;
  }>;
  membersWithPermission: Array<{
    __typename?: 'User';
    id: number;
    name: string;
    displayName?: string | null;
    profilePicture: { __typename?: 'Image'; id: number };
  }>;
};

export const ServerPermissionViewModalDocument = gql`
  query ServerPermissionViewModal($permissionName: String!) {
    serverRoles(permissionName: $permissionName) {
      id
      name
      color
    }
    membersWithPermission(permissionName: $permissionName) {
      ...UserAvatar
    }
  }
  ${UserAvatarFragmentDoc}
`;

/**
 * __useServerPermissionViewModalQuery__
 *
 * To run a query within a React component, call `useServerPermissionViewModalQuery` and pass it any options that fit your needs.
 * When your component renders, `useServerPermissionViewModalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useServerPermissionViewModalQuery({
 *   variables: {
 *      permissionName: // value for 'permissionName'
 *   },
 * });
 */
export function useServerPermissionViewModalQuery(
  baseOptions: Apollo.QueryHookOptions<
    ServerPermissionViewModalQuery,
    ServerPermissionViewModalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    ServerPermissionViewModalQuery,
    ServerPermissionViewModalQueryVariables
  >(ServerPermissionViewModalDocument, options);
}
export function useServerPermissionViewModalLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ServerPermissionViewModalQuery,
    ServerPermissionViewModalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ServerPermissionViewModalQuery,
    ServerPermissionViewModalQueryVariables
  >(ServerPermissionViewModalDocument, options);
}
export type ServerPermissionViewModalQueryHookResult = ReturnType<
  typeof useServerPermissionViewModalQuery
>;
export type ServerPermissionViewModalLazyQueryHookResult = ReturnType<
  typeof useServerPermissionViewModalLazyQuery
>;
export type ServerPermissionViewModalQueryResult = Apollo.QueryResult<
  ServerPermissionViewModalQuery,
  ServerPermissionViewModalQueryVariables
>;
