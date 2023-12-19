import { ApolloClient, Observable, from, split } from '@apollo/client';
import { loadDevMessages, loadErrorMessages } from '@apollo/client/dev';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createUploadLink } from 'apollo-upload-client';
import { createClient } from 'graphql-ws';
import { ACCESS_TOKEN, Environments } from '../constants/shared.constants';
import { formatGQLError } from '../utils/error.utils';
import cache from './cache';

if (process.env.NODE_ENV === Environments.Development) {
  loadDevMessages();
  loadErrorMessages();
}

export const getAuthHeader = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN);
  return { authorization: accessToken ? `Bearer ${accessToken}` : '' };
};

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    ...getAuthHeader(),
    'Apollo-Require-Preflight': 'true',
  },
}));

const errorLink = onError(
  ({ graphQLErrors, networkError, response }) =>
    new Observable((observer) => {
      if (graphQLErrors) {
        graphQLErrors.map(
          async ({ message, locations, path, extensions }, index) => {
            console.error(
              formatGQLError(message, { extensions, locations, path }),
            );
            if (!response) {
              return observer.error(graphQLErrors[index]);
            }
            return observer.next(response);
          },
        );
      }
      if (networkError) {
        console.error(`[Network error]: ${networkError}`);
        return observer.error(networkError);
      }
    }),
);

// TODO: Uncomment after testing
const webSocketProtocol = 'ws';
// process.env.NODE_ENV === Environments.Development ? 'ws' : 'wss';

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${webSocketProtocol}://${window.location.host}/subscriptions`,
    connectionParams: getAuthHeader(),
  }),
);

const httpUploadLink = createUploadLink({
  uri: '/api/graphql',
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpUploadLink,
);

const client = new ApolloClient({
  link: from([authLink, errorLink, splitLink]),
  connectToDevTools: process.env.NODE_ENV !== Environments.Production,
  cache,
});

export default client;
