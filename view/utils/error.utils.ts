import { ApolloError } from '@apollo/client';
import { GraphQLErrorExtensions, SourceLocation } from 'graphql';
import { FORBIDDEN, UNAUTHORIZED } from '../constants/shared.constants';

interface FormatGQLErrorOptions {
  extensions?: GraphQLErrorExtensions;
  locations?: readonly SourceLocation[];
  path?: readonly (string | number)[];
  withStacktrace?: boolean;
}

export const formatGqlError = (
  message: string,
  { extensions, locations, path, withStacktrace }: FormatGQLErrorOptions = {},
) => {
  const locationsStr = JSON.stringify(locations);
  const details = `[GraphQL error]: Message: ${message}, Locations: ${locationsStr}, Path: ${path}`;

  if (withStacktrace && extensions) {
    const stacktrace = `Stacktrace: ${extensions.stacktrace}`;
    return `${details}\n\n${stacktrace}`;
  }
  return details;
};

export const isDeniedAccess = (error: ApolloError | undefined) => {
  if (!error?.message) {
    return false;
  }
  return [UNAUTHORIZED, FORBIDDEN].includes(error.message);
};

export const isEntityTooLarge = ({ networkError }: ApolloError) => {
  const statusCode =
    networkError && 'statusCode' in networkError && networkError.statusCode;

  return statusCode === 413;
};
