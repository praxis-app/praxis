import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { ChatFragmentDoc } from '../../fragments/gen/Chat.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type ChatsQueryVariables = Types.Exact<{
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;

export type ChatsQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'User';
    id: number;
    chatCount: number;
    chats: Array<{
      __typename?: 'Conversation';
      id: number;
      name: string;
      unreadMessageCount: number;
      createdAt: any;
      lastMessageSent?: {
        __typename?: 'Message';
        id: number;
        body?: string | null;
        createdAt: any;
        user: {
          __typename?: 'User';
          id: number;
          name: string;
          displayName?: string | null;
        };
      } | null;
      group?: {
        __typename?: 'Group';
        description: string;
        id: number;
        name: string;
        coverPhoto?: { __typename?: 'Image'; id: number } | null;
      } | null;
    }>;
  };
};

export const ChatsDocument = gql`
  query Chats($offset: Int = 0, $limit: Int = 20) {
    me {
      id
      chats(offset: $offset, limit: $limit) {
        ...Chat
      }
      chatCount
    }
  }
  ${ChatFragmentDoc}
`;

/**
 * __useChatsQuery__
 *
 * To run a query within a React component, call `useChatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChatsQuery({
 *   variables: {
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useChatsQuery(
  baseOptions?: Apollo.QueryHookOptions<ChatsQuery, ChatsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ChatsQuery, ChatsQueryVariables>(
    ChatsDocument,
    options,
  );
}
export function useChatsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ChatsQuery, ChatsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ChatsQuery, ChatsQueryVariables>(
    ChatsDocument,
    options,
  );
}
export type ChatsQueryHookResult = ReturnType<typeof useChatsQuery>;
export type ChatsLazyQueryHookResult = ReturnType<typeof useChatsLazyQuery>;
export type ChatsQueryResult = Apollo.QueryResult<
  ChatsQuery,
  ChatsQueryVariables
>;
