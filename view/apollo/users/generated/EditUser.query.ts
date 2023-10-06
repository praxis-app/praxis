import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { UserProfileCardFragmentDoc } from './UserProfileCard.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type EditUserQueryVariables = Types.Exact<{
  name?: Types.InputMaybe<Types.Scalars['String']>;
}>;

export type EditUserQuery = {
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
};

export const EditUserDocument = gql`
  query EditUser($name: String) {
    user(name: $name) {
      ...UserProfileCard
    }
  }
  ${UserProfileCardFragmentDoc}
`;

/**
 * __useEditUserQuery__
 *
 * To run a query within a React component, call `useEditUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useEditUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEditUserQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useEditUserQuery(
  baseOptions?: Apollo.QueryHookOptions<EditUserQuery, EditUserQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<EditUserQuery, EditUserQueryVariables>(
    EditUserDocument,
    options,
  );
}
export function useEditUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    EditUserQuery,
    EditUserQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<EditUserQuery, EditUserQueryVariables>(
    EditUserDocument,
    options,
  );
}
export type EditUserQueryHookResult = ReturnType<typeof useEditUserQuery>;
export type EditUserLazyQueryHookResult = ReturnType<
  typeof useEditUserLazyQuery
>;
export type EditUserQueryResult = Apollo.QueryResult<
  EditUserQuery,
  EditUserQueryVariables
>;
