import * as Types from '../../gen';

import { gql } from '@apollo/client';
import { EventFormFragmentDoc } from './EventForm.fragment';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type EditEventQueryVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;

export type EditEventQuery = {
  __typename?: 'Query';
  event: {
    __typename?: 'Event';
    id: number;
    name: string;
    startsAt: any;
    endsAt?: any | null;
    description: string;
    location?: string | null;
    online: boolean;
    externalLink?: string | null;
    group?: {
      __typename?: 'Group';
      id: number;
      name: string;
      myPermissions: { __typename?: 'GroupPermissions'; manageEvents: boolean };
    } | null;
    host: { __typename?: 'User'; id: number };
  };
};

export const EditEventDocument = gql`
  query EditEvent($id: Int!) {
    event(id: $id) {
      ...EventForm
      group {
        id
        name
        myPermissions {
          manageEvents
        }
      }
    }
  }
  ${EventFormFragmentDoc}
`;

/**
 * __useEditEventQuery__
 *
 * To run a query within a React component, call `useEditEventQuery` and pass it any options that fit your needs.
 * When your component renders, `useEditEventQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEditEventQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useEditEventQuery(
  baseOptions: Apollo.QueryHookOptions<EditEventQuery, EditEventQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<EditEventQuery, EditEventQueryVariables>(
    EditEventDocument,
    options,
  );
}
export function useEditEventLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    EditEventQuery,
    EditEventQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<EditEventQuery, EditEventQueryVariables>(
    EditEventDocument,
    options,
  );
}
export type EditEventQueryHookResult = ReturnType<typeof useEditEventQuery>;
export type EditEventLazyQueryHookResult = ReturnType<
  typeof useEditEventLazyQuery
>;
export type EditEventQueryResult = Apollo.QueryResult<
  EditEventQuery,
  EditEventQueryVariables
>;
