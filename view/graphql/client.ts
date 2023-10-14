import { ApolloClient, from } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { Environments } from '../constants/shared.constants';
import cache from './cache';

const terminatingLink = createUploadLink({
  headers: { 'Apollo-Require-Preflight': 'true' },
  uri: '/api/graphql',
});

const client = new ApolloClient({
  link: from([terminatingLink]),
  connectToDevTools: process.env.NODE_ENV !== Environments.Production,
  cache,
});

export default client;
