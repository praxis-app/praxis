import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { PostFormFragmentDoc } from './PostForm.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type EditPostQueryVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type EditPostQuery = {
  __typename?: 'Query';
  post: {
    __typename?: 'Post';
    id: number;
    body?: string | null;
    images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
  };
};

export const EditPostDocument = gql`
  query EditPost($id: Int!) {
    post(id: $id) {
      ...PostForm
    }
  }
  ${PostFormFragmentDoc}
`;

/**
 * __useEditPostQuery__
 *
 * To run a query within a React component, call `useEditPostQuery` and pass it any options that fit your needs.
 * When your component renders, `useEditPostQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEditPostQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useEditPostQuery(
  baseOptions: Apollo.QueryHookOptions<EditPostQuery, EditPostQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<EditPostQuery, EditPostQueryVariables>(
    EditPostDocument,
    options,
  );
}
export function useEditPostLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    EditPostQuery,
    EditPostQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<EditPostQuery, EditPostQueryVariables>(
    EditPostDocument,
    options,
  );
}
export type EditPostQueryHookResult = ReturnType<typeof useEditPostQuery>;
export type EditPostLazyQueryHookResult = ReturnType<
  typeof useEditPostLazyQuery
>;
export type EditPostQueryResult = Apollo.QueryResult<
  EditPostQuery,
  EditPostQueryVariables
>;
