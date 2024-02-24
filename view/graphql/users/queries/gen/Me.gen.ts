import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserAvatarFragmentDoc } from '../../fragments/gen/UserAvatar.gen';
import { ServerPermissionsFragmentDoc } from '../../../roles/fragments/gen/ServerPermissions.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type MeQueryVariables = Types.Exact<{ [key: string]: never }>;

export type MeQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'User';
    id: number;
    name: string;
    serverPermissions: {
      __typename?: 'ServerPermissions';
      createInvites: boolean;
      manageComments: boolean;
      manageEvents: boolean;
      manageInvites: boolean;
      managePosts: boolean;
      manageQuestionnaireTickets: boolean;
      manageQuestions: boolean;
      manageRoles: boolean;
      manageRules: boolean;
      manageSettings: boolean;
      removeGroups: boolean;
      removeMembers: boolean;
      removeProposals: boolean;
    };
    profilePicture: { __typename?: 'Image'; id: number };
  };
};

export const MeDocument = gql`
  query Me {
    me {
      id
      ...UserAvatar
      serverPermissions {
        ...ServerPermissions
      }
    }
  }
  ${UserAvatarFragmentDoc}
  ${ServerPermissionsFragmentDoc}
`;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(
  baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
}
export function useMeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
}
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
