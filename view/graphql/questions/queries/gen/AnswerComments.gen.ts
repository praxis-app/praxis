import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { CommentFragmentDoc } from '../../../comments/fragments/gen/Comment.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type AnswerCommentsQueryVariables = Types.Exact<{
  id: Types.Scalars['Int']['input'];
  isLoggedIn: Types.Scalars['Boolean']['input'];
}>;

export type AnswerCommentsQuery = {
  __typename?: 'Query';
  answer: {
    __typename?: 'Answer';
    id: number;
    comments: Array<{
      __typename?: 'Comment';
      id: number;
      body?: string | null;
      likeCount: number;
      createdAt: any;
      isLikedByMe?: boolean;
      images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
      user: {
        __typename?: 'User';
        id: number;
        name: string;
        profilePicture: { __typename?: 'Image'; id: number };
      };
    }>;
  };
  me: { __typename?: 'User'; id: number };
};

export const AnswerCommentsDocument = gql`
  query AnswerComments($id: Int!, $isLoggedIn: Boolean!) {
    answer(id: $id) {
      id
      comments {
        ...Comment
      }
    }
    me {
      id
    }
  }
  ${CommentFragmentDoc}
`;

/**
 * __useAnswerCommentsQuery__
 *
 * To run a query within a React component, call `useAnswerCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAnswerCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAnswerCommentsQuery({
 *   variables: {
 *      id: // value for 'id'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useAnswerCommentsQuery(
  baseOptions: Apollo.QueryHookOptions<
    AnswerCommentsQuery,
    AnswerCommentsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<AnswerCommentsQuery, AnswerCommentsQueryVariables>(
    AnswerCommentsDocument,
    options,
  );
}
export function useAnswerCommentsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    AnswerCommentsQuery,
    AnswerCommentsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<AnswerCommentsQuery, AnswerCommentsQueryVariables>(
    AnswerCommentsDocument,
    options,
  );
}
export type AnswerCommentsQueryHookResult = ReturnType<
  typeof useAnswerCommentsQuery
>;
export type AnswerCommentsLazyQueryHookResult = ReturnType<
  typeof useAnswerCommentsLazyQuery
>;
export type AnswerCommentsQueryResult = Apollo.QueryResult<
  AnswerCommentsQuery,
  AnswerCommentsQueryVariables
>;
