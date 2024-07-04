import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { GroupAvatarFragmentDoc } from '../../../groups/fragments/gen/GroupAvatar.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type IsPostShareableQueryVariables = Types.Exact<{
  postId: Types.Scalars['Int']['input'];
}>;

export type IsPostShareableQuery = {
  __typename?: 'Query';
  post: {
    __typename?: 'Post';
    id: number;
    group?: {
      __typename?: 'Group';
      id: number;
      name: string;
      description: string;
      isJoinedByMe: boolean;
      coverPhoto?: { __typename?: 'Image'; id: number } | null;
    } | null;
  };
};

export const IsPostShareableDocument = gql`
  query IsPostShareable($postId: Int!) {
    post(id: $postId) {
      id
      group {
        id
        name
        description
        isJoinedByMe
        ...GroupAvatar
      }
    }
  }
  ${GroupAvatarFragmentDoc}
`;

/**
 * __useIsPostShareableQuery__
 *
 * To run a query within a React component, call `useIsPostShareableQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsPostShareableQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsPostShareableQuery({
 *   variables: {
 *      postId: // value for 'postId'
 *   },
 * });
 */
export function useIsPostShareableQuery(
  baseOptions: Apollo.QueryHookOptions<
    IsPostShareableQuery,
    IsPostShareableQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<IsPostShareableQuery, IsPostShareableQueryVariables>(
    IsPostShareableDocument,
    options,
  );
}
export function useIsPostShareableLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    IsPostShareableQuery,
    IsPostShareableQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    IsPostShareableQuery,
    IsPostShareableQueryVariables
  >(IsPostShareableDocument, options);
}
export type IsPostShareableQueryHookResult = ReturnType<
  typeof useIsPostShareableQuery
>;
export type IsPostShareableLazyQueryHookResult = ReturnType<
  typeof useIsPostShareableLazyQuery
>;
export type IsPostShareableQueryResult = Apollo.QueryResult<
  IsPostShareableQuery,
  IsPostShareableQueryVariables
>;
