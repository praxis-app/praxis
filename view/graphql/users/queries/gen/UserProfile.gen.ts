import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { UserProfileCardFragmentDoc } from '../../fragments/gen/UserProfileCard.gen';
import { ToggleFormsFragmentDoc } from '../../fragments/gen/ToggleForms.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type UserProfileQueryVariables = Types.Exact<{
  name?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;

export type UserProfileQuery = {
  __typename?: 'Query';
  user: {
    __typename?: 'User';
    id: number;
    bio?: string | null;
    createdAt: any;
    followerCount: number;
    followingCount: number;
    name: string;
    isFollowedByMe: boolean;
    coverPhoto?: { __typename?: 'Image'; id: number } | null;
    profilePicture: { __typename?: 'Image'; id: number };
  };
  me: {
    __typename?: 'User';
    id: number;
    serverPermissions: {
      __typename?: 'ServerPermissions';
      removeMembers: boolean;
    };
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

export const UserProfileDocument = gql`
  query UserProfile($name: String) {
    user(name: $name) {
      ...UserProfileCard
    }
    me {
      id
      serverPermissions {
        removeMembers
      }
      ...ToggleForms
    }
  }
  ${UserProfileCardFragmentDoc}
  ${ToggleFormsFragmentDoc}
`;

/**
 * __useUserProfileQuery__
 *
 * To run a query within a React component, call `useUserProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserProfileQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUserProfileQuery(
  baseOptions?: Apollo.QueryHookOptions<
    UserProfileQuery,
    UserProfileQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<UserProfileQuery, UserProfileQueryVariables>(
    UserProfileDocument,
    options,
  );
}
export function useUserProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    UserProfileQuery,
    UserProfileQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<UserProfileQuery, UserProfileQueryVariables>(
    UserProfileDocument,
    options,
  );
}
export type UserProfileQueryHookResult = ReturnType<typeof useUserProfileQuery>;
export type UserProfileLazyQueryHookResult = ReturnType<
  typeof useUserProfileLazyQuery
>;
export type UserProfileQueryResult = Apollo.QueryResult<
  UserProfileQuery,
  UserProfileQueryVariables
>;
