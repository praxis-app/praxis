import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { CommentFragmentDoc } from '../../../comments/fragments/gen/Comment.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type QuestionnaireTicketCommentsQueryVariables = Types.Exact<{
  id: Types.Scalars['Int']['input'];
  isLoggedIn: Types.Scalars['Boolean']['input'];
}>;

export type QuestionnaireTicketCommentsQuery = {
  __typename?: 'Query';
  questionnaireTicket: {
    __typename?: 'QuestionnaireTicket';
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

export const QuestionnaireTicketCommentsDocument = gql`
  query QuestionnaireTicketComments($id: Int!, $isLoggedIn: Boolean!) {
    questionnaireTicket(id: $id) {
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
 * __useQuestionnaireTicketCommentsQuery__
 *
 * To run a query within a React component, call `useQuestionnaireTicketCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useQuestionnaireTicketCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQuestionnaireTicketCommentsQuery({
 *   variables: {
 *      id: // value for 'id'
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useQuestionnaireTicketCommentsQuery(
  baseOptions: Apollo.QueryHookOptions<
    QuestionnaireTicketCommentsQuery,
    QuestionnaireTicketCommentsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    QuestionnaireTicketCommentsQuery,
    QuestionnaireTicketCommentsQueryVariables
  >(QuestionnaireTicketCommentsDocument, options);
}
export function useQuestionnaireTicketCommentsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    QuestionnaireTicketCommentsQuery,
    QuestionnaireTicketCommentsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    QuestionnaireTicketCommentsQuery,
    QuestionnaireTicketCommentsQueryVariables
  >(QuestionnaireTicketCommentsDocument, options);
}
export type QuestionnaireTicketCommentsQueryHookResult = ReturnType<
  typeof useQuestionnaireTicketCommentsQuery
>;
export type QuestionnaireTicketCommentsLazyQueryHookResult = ReturnType<
  typeof useQuestionnaireTicketCommentsLazyQuery
>;
export type QuestionnaireTicketCommentsQueryResult = Apollo.QueryResult<
  QuestionnaireTicketCommentsQuery,
  QuestionnaireTicketCommentsQueryVariables
>;
