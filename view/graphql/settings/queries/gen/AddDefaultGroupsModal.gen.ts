import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import { AddDefaultGroupsOptionFragmentDoc } from '../../fragments/gen/AddDefaultGroupsOption.gen';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type AddDefaultGroupsModalQueryVariables = Types.Exact<{
  input: Types.GroupsInput;
}>;

export type AddDefaultGroupsModalQuery = {
  __typename?: 'Query';
  groups: Array<{
    __typename?: 'Group';
    id: number;
    isDefault: boolean;
    name: string;
    coverPhoto?: { __typename?: 'Image'; id: number } | null;
  }>;
};

export const AddDefaultGroupsModalDocument = gql`
  query AddDefaultGroupsModal($input: GroupsInput!) {
    groups(input: $input) {
      ...AddDefaultGroupsOption
    }
  }
  ${AddDefaultGroupsOptionFragmentDoc}
`;

/**
 * __useAddDefaultGroupsModalQuery__
 *
 * To run a query within a React component, call `useAddDefaultGroupsModalQuery` and pass it any options that fit your needs.
 * When your component renders, `useAddDefaultGroupsModalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAddDefaultGroupsModalQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddDefaultGroupsModalQuery(
  baseOptions: Apollo.QueryHookOptions<
    AddDefaultGroupsModalQuery,
    AddDefaultGroupsModalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    AddDefaultGroupsModalQuery,
    AddDefaultGroupsModalQueryVariables
  >(AddDefaultGroupsModalDocument, options);
}
export function useAddDefaultGroupsModalLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    AddDefaultGroupsModalQuery,
    AddDefaultGroupsModalQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    AddDefaultGroupsModalQuery,
    AddDefaultGroupsModalQueryVariables
  >(AddDefaultGroupsModalDocument, options);
}
export type AddDefaultGroupsModalQueryHookResult = ReturnType<
  typeof useAddDefaultGroupsModalQuery
>;
export type AddDefaultGroupsModalLazyQueryHookResult = ReturnType<
  typeof useAddDefaultGroupsModalLazyQuery
>;
export type AddDefaultGroupsModalQueryResult = Apollo.QueryResult<
  AddDefaultGroupsModalQuery,
  AddDefaultGroupsModalQueryVariables
>;
