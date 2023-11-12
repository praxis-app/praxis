import { ApolloClient, Observable, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { createUploadLink } from 'apollo-upload-client';
import { Environments } from '../constants/shared.constants';
import { formatGqlError } from '../utils/error.utils';
import cache from './cache';

const terminatingLink = createUploadLink({
  headers: { 'Apollo-Require-Preflight': 'true' },
  uri: '/api/graphql',
});

const errorLink = onError(
  ({ graphQLErrors, networkError, response }) =>
    new Observable((observer) => {
      if (graphQLErrors) {
        graphQLErrors.map(
          async ({ message, locations, path, extensions }, index) => {
            console.error(
              formatGqlError(message, { extensions, locations, path }),
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

const client = new ApolloClient({
  link: from([errorLink, terminatingLink]),
  connectToDevTools: process.env.NODE_ENV !== Environments.Production,
  cache,
});

export default client;
