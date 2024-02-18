import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { CommentFragmentDoc } from '../../../comments/fragments/gen/Comment.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type QuestionCommentsQueryVariables = Types.Exact<{
  id: Types.Scalars['Int']['input'];
  isLoggedIn: Types.Scalars['Boolean']['input'];
}>;

export type QuestionCommentsQuery = {
  __typename?: 'Query';
  question: {
    __typename?: 'Question';
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

export const QuestionCommentsDocument = gql`
  query QuestionComments($id: Int!, $isLoggedIn: Boolean!) {
    question(id: $id) {
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
 * __useQuestionCommentsQuery__
 *
 * To run a query within a React component, call `useQuestionCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useQuestionCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQuestionCommentsQuery({
 *   variables: {
 *      id: // value for 'id'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useQuestionCommentsQuery(
  baseOptions: Apollo.QueryHookOptions<
    QuestionCommentsQuery,
    QuestionCommentsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<QuestionCommentsQuery, QuestionCommentsQueryVariables>(
    QuestionCommentsDocument,
    options,
  );
}
export function useQuestionCommentsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    QuestionCommentsQuery,
    QuestionCommentsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    QuestionCommentsQuery,
    QuestionCommentsQueryVariables
  >(QuestionCommentsDocument, options);
}
export type QuestionCommentsQueryHookResult = ReturnType<
  typeof useQuestionCommentsQuery
>;
export type QuestionCommentsLazyQueryHookResult = ReturnType<
  typeof useQuestionCommentsLazyQuery
>;
export type QuestionCommentsQueryResult = Apollo.QueryResult<
  QuestionCommentsQuery,
  QuestionCommentsQueryVariables
>;
