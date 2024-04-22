import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type VibeChatQueryVariables = Types.Exact<{ [key: string]: never }>;

export type VibeChatQuery = {
  __typename?: 'Query';
  vibeChat: {
    __typename?: 'Conversation';
    id: number;
    name?: string | null;
    members: Array<{ __typename?: 'User'; id: number; name: string }>;
    messages: Array<{
      __typename?: 'Message';
      id: number;
      body?: string | null;
    }>;
  };
};

export const VibeChatDocument = gql`
  query VibeChat {
    vibeChat {
      id
      name
      members {
        id
        name
      }
      messages {
        id
        body
      }
    }
  }
`;

/**
 * __useVibeChatQuery__
 *
 * To run a query within a React component, call `useVibeChatQuery` and pass it any options that fit your needs.
 * When your component renders, `useVibeChatQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useVibeChatQuery({
 *   variables: {
 *   },
 * });
 */
export function useVibeChatQuery(
  baseOptions?: Apollo.QueryHookOptions<VibeChatQuery, VibeChatQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<VibeChatQuery, VibeChatQueryVariables>(
    VibeChatDocument,
    options,
  );
}
export function useVibeChatLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    VibeChatQuery,
    VibeChatQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<VibeChatQuery, VibeChatQueryVariables>(
    VibeChatDocument,
    options,
  );
}
export type VibeChatQueryHookResult = ReturnType<typeof useVibeChatQuery>;
export type VibeChatLazyQueryHookResult = ReturnType<
  typeof useVibeChatLazyQuery
>;
export type VibeChatQueryResult = Apollo.QueryResult<
  VibeChatQuery,
  VibeChatQueryVariables
>;
