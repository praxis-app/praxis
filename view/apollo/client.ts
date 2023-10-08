import { ApolloClient, from } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { Environments } from '../constants/shared.constants';
import refreshTokenLink from './auth/links/refresh-token.link';
import cache from './cache';

const terminatingLink = createUploadLink({
  headers: { 'Apollo-Require-Preflight': 'true' },
  uri: '/graphql',
});

const client = new ApolloClient({
  link: from([refreshTokenLink, terminatingLink]),
  connectToDevTools: process.env.NODE_ENV !== Environments.Production,
  cache,
});

export default client;
