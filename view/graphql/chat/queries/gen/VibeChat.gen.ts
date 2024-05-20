import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { MessageFragmentDoc } from '../../fragments/gen/Message.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type VibeChatQueryVariables = Types.Exact<{
  offset?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  limit?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;

export type VibeChatQuery = {
  __typename?: 'Query';
  vibeChat: {
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

export const VibeChatDocument = gql`
  query VibeChat($offset: Int = 0, $limit: Int = 20) {
    vibeChat {
      id
      name
      messages(offset: $offset, limit: $limit) {
        ...Message
      }
    }
  }
  ${MessageFragmentDoc}
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
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
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
