import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type LikesPopoverQueryVariables = Types.Exact<{
  likesData: Types.LikesInput;
}>;

export type LikesPopoverQuery = {
  __typename?: 'Query';
  likes: Array<{
    __typename?: 'Like';
    id: number;
    user: {
      __typename?: 'User';
      id: number;
      name: string;
      displayName?: string | null;
    };
  }>;
};

export const LikesPopoverDocument = gql`
  query LikesPopover($likesData: LikesInput!) {
    likes(likesData: $likesData) {
      id
      user {
        id
        name
        displayName
      }
    }
  }
`;

/**
 * __useLikesPopoverQuery__
 *
 * To run a query within a React component, call `useLikesPopoverQuery` and pass it any options that fit your needs.
 * When your component renders, `useLikesPopoverQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLikesPopoverQuery({
 *   variables: {
 *      likesData: // value for 'likesData'
 *   },
 * });
 */
export function useLikesPopoverQuery(
  baseOptions: Apollo.QueryHookOptions<
    LikesPopoverQuery,
    LikesPopoverQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<LikesPopoverQuery, LikesPopoverQueryVariables>(
    LikesPopoverDocument,
    options,
  );
}
export function useLikesPopoverLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    LikesPopoverQuery,
    LikesPopoverQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<LikesPopoverQuery, LikesPopoverQueryVariables>(
    LikesPopoverDocument,
    options,
  );
}
export type LikesPopoverQueryHookResult = ReturnType<
  typeof useLikesPopoverQuery
>;
export type LikesPopoverLazyQueryHookResult = ReturnType<
  typeof useLikesPopoverLazyQuery
>;
export type LikesPopoverQueryResult = Apollo.QueryResult<
  LikesPopoverQuery,
  LikesPopoverQueryVariables
>;
