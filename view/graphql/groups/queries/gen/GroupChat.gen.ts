import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { ChatPanelFragmentDoc } from '../../../chat/fragments/gen/ChatPanel.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type GroupChatQueryVariables = Types.Exact<{
  name: Types.Scalars['String']['input'];
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;

export type GroupChatQuery = {
  __typename?: 'Query';
  group: {
    __typename?: 'Group';
    id: number;
    chat: {
      __typename?: 'Conversation';
      id: number;
      name: string;
      messages: Array<{
        __typename?: 'Message';
        id: number;
        body?: string | null;
        createdAt: any;
        user: {
          __typename?: 'User';
          id: number;
          name: string;
          displayName?: string | null;
          profilePicture: { __typename?: 'Image'; id: number };
        };
        images: Array<{ __typename?: 'Image'; id: number; filename: string }>;
      }>;
    };
  };
};

export const GroupChatDocument = gql`
  query GroupChat($name: String!, $offset: Int = 0, $limit: Int = 20) {
    group(name: $name) {
      id
      chat {
        ...ChatPanel
      }
    }
  }
  ${ChatPanelFragmentDoc}
`;

/**
 * __useGroupChatQuery__
 *
 * To run a query within a React component, call `useGroupChatQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupChatQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupChatQuery({
 *   variables: {
 *      name: // value for 'name'
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGroupChatQuery(
  baseOptions: Apollo.QueryHookOptions<GroupChatQuery, GroupChatQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GroupChatQuery, GroupChatQueryVariables>(
    GroupChatDocument,
    options,
  );
}
export function useGroupChatLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GroupChatQuery,
    GroupChatQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GroupChatQuery, GroupChatQueryVariables>(
    GroupChatDocument,
    options,
  );
}
export type GroupChatQueryHookResult = ReturnType<typeof useGroupChatQuery>;
export type GroupChatLazyQueryHookResult = ReturnType<
  typeof useGroupChatLazyQuery
>;
export type GroupChatQueryResult = Apollo.QueryResult<
  GroupChatQuery,
  GroupChatQueryVariables
>;
