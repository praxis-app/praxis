import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { AnsweredQuestionCardFragmentDoc } from '../../fragments/gen/AnsweredQuestionCard.gen';
import { CommentFragmentDoc } from '../../../comments/fragments/gen/Comment.gen';
import { AnswerQuestionsFormFragmentDoc } from '../../fragments/gen/AnswerQuestionsForm.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type VibeCheckQueryVariables = Types.Exact<{
  isLoggedIn: Types.Scalars['Boolean']['input'];
}>;

export type VibeCheckQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'User';
    id: number;
    questionnaireTicket?: {
      __typename?: 'QuestionnaireTicket';
      status: string;
      prompt?: string | null;
      id: number;
      questions: Array<{
        __typename?: 'Question';
        id: number;
        text: string;
        priority: number;
        likeCount: number;
        commentCount: number;
        isLikedByMe: boolean;
        answer?: {
          __typename?: 'Answer';
          id: number;
          text: string;
          updatedAt: any;
          user: {
            __typename?: 'User';
            id: number;
            name: string;
            displayName?: string | null;
          };
        } | null;
      }>;
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
          displayName?: string | null;
          profilePicture: { __typename?: 'Image'; id: number };
        };
      }>;
    } | null;
  };
};

export const VibeCheckDocument = gql`
  query VibeCheck($isLoggedIn: Boolean!) {
    me {
      id
      questionnaireTicket {
        questions {
          ...AnsweredQuestionCard
        }
        comments {
          ...Comment
        }
        ...AnswerQuestionsForm
        status
        prompt
      }
    }
  }
  ${AnsweredQuestionCardFragmentDoc}
  ${CommentFragmentDoc}
  ${AnswerQuestionsFormFragmentDoc}
`;

/**
 * __useVibeCheckQuery__
 *
 * To run a query within a React component, call `useVibeCheckQuery` and pass it any options that fit your needs.
 * When your component renders, `useVibeCheckQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVibeCheckQuery({
 *   variables: {
 *      isLoggedIn: // value for 'isLoggedIn'
 *   },
 * });
 */
export function useVibeCheckQuery(
  baseOptions: Apollo.QueryHookOptions<VibeCheckQuery, VibeCheckQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<VibeCheckQuery, VibeCheckQueryVariables>(
    VibeCheckDocument,
    options,
  );
}
export function useVibeCheckLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    VibeCheckQuery,
    VibeCheckQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<VibeCheckQuery, VibeCheckQueryVariables>(
    VibeCheckDocument,
    options,
  );
}
export type VibeCheckQueryHookResult = ReturnType<typeof useVibeCheckQuery>;
export type VibeCheckLazyQueryHookResult = ReturnType<
  typeof useVibeCheckLazyQuery
>;
export type VibeCheckQueryResult = Apollo.QueryResult<
  VibeCheckQuery,
  VibeCheckQueryVariables
>;
