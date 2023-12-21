import * as Types from '../../../gen';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';

// THIS FILE IS GENERATED, DO NOT EDIT
/* eslint-disable */

const defaultOptions = {} as const;
export type IsProposalRatifiedSubscriptionVariables = Types.Exact<{
  proposalId: Types.Scalars['Int']['input'];
}>;

export type IsProposalRatifiedSubscription = {
  __typename?: 'Subscription';
  isProposalRatified: boolean;
};

export const IsProposalRatifiedDocument = gql`
  subscription IsProposalRatified($proposalId: Int!) {
    isProposalRatified(id: $proposalId)
  }
`;

/**
 * __useIsProposalRatifiedSubscription__
 *
 * To run a query within a React component, call `useIsProposalRatifiedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useIsProposalRatifiedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsProposalRatifiedSubscription({
 *   variables: {
 *      proposalId: // value for 'proposalId'
 *   },
 * });
 */
export function useIsProposalRatifiedSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    IsProposalRatifiedSubscription,
    IsProposalRatifiedSubscriptionVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    IsProposalRatifiedSubscription,
    IsProposalRatifiedSubscriptionVariables
  >(IsProposalRatifiedDocument, options);
}
export type IsProposalRatifiedSubscriptionHookResult = ReturnType<
  typeof useIsProposalRatifiedSubscription
>;
export type IsProposalRatifiedSubscriptionResult =
  Apollo.SubscriptionResult<IsProposalRatifiedSubscription>;
