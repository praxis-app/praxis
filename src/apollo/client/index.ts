import { useMemo } from "react";
import { ApolloClient } from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import baseUrl from "../../utils/baseUrl";
import { defaults, resolvers } from "./localState";

let apolloClient: any;

const cache: any = new InMemoryCache();
const uri = `${baseUrl}/api/graphql`;

const createIsomorphLink = () => {
  if (typeof window === "undefined") {
    const { SchemaLink } = require("@apollo/client/link/schema");
    const { schema } = require("../schema");
    return new SchemaLink({ schema });
  } else {
    return createUploadLink({
      uri,
    });
  }
};

const createApolloClient = () => {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: createIsomorphLink(),
    resolvers,
    cache,
  });
};

cache.writeData({
  data: defaults,
});

export const initializeApollo = (initialState = null) => {
  const _apolloClient = apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // get hydrated here
  if (initialState) {
    _apolloClient.cache.restore(initialState);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return _apolloClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
};

export const useApollo = (initialState) => {
  const store = useMemo(() => initializeApollo(initialState), [initialState]);
  return store;
};
