import { ApolloClient, Observable, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createUploadLink } from 'apollo-upload-client';
import { ACCESS_TOKEN, Environments } from '../constants/shared.constants';
import { formatGQLError } from '../utils/error.utils';
import cache from './cache';

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

const uploadLink = createUploadLink({
  uri: '/api/graphql',
});

const client = new ApolloClient({
  link: from([authLink, errorLink, uploadLink]),
  connectToDevTools: process.env.NODE_ENV !== Environments.Production,
  cache,
});

export default client;
