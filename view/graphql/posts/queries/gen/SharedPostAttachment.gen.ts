import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { SharedPostFragmentDoc } from '../../fragments/gen/SharedPost.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type SharedPostAttachmentQueryVariables = Types.Exact<{
  postId: Types.Scalars['Int']['input'];
}>;

export type SharedPostAttachmentQuery = {
  __typename?: 'Query';
  post: {
    __typename?: 'Post';
    id: number;
    sharedPost?: {
      __typename?: 'Post';
      id: number;
      body?: string | null;
      createdAt: any;
      images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
      user: {
        __typename?: 'User';
        id: number;
        name: string;
        displayName?: string | null;
        profilePicture: { __typename?: 'Image'; id: number };
      };
    } | null;
  };
};

export const SharedPostAttachmentDocument = gql`
  query SharedPostAttachment($postId: Int!) {
    post(id: $postId) {
      id
      sharedPost {
        ...SharedPost
      }
    }
  }
  ${SharedPostFragmentDoc}
`;

/**
 * __useSharedPostAttachmentQuery__
 *
 * To run a query within a React component, call `useSharedPostAttachmentQuery` and pass it any options that fit your needs.
 * When your component renders, `useSharedPostAttachmentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSharedPostAttachmentQuery({
 *   variables: {
 *      postId: // value for 'postId'
 *   },
 * });
 */
export function useSharedPostAttachmentQuery(
  baseOptions: Apollo.QueryHookOptions<
    SharedPostAttachmentQuery,
    SharedPostAttachmentQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SharedPostAttachmentQuery,
    SharedPostAttachmentQueryVariables
  >(SharedPostAttachmentDocument, options);
}
export function useSharedPostAttachmentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SharedPostAttachmentQuery,
    SharedPostAttachmentQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SharedPostAttachmentQuery,
    SharedPostAttachmentQueryVariables
  >(SharedPostAttachmentDocument, options);
}
export type SharedPostAttachmentQueryHookResult = ReturnType<
  typeof useSharedPostAttachmentQuery
>;
export type SharedPostAttachmentLazyQueryHookResult = ReturnType<
  typeof useSharedPostAttachmentLazyQuery
>;
export type SharedPostAttachmentQueryResult = Apollo.QueryResult<
  SharedPostAttachmentQuery,
  SharedPostAttachmentQueryVariables
>;
