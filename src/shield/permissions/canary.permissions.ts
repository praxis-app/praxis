import { allow } from 'graphql-shield';

export const canaryPermissions = {
  Query: {
    publicCanary: allow,
  },
  ObjectTypes: {
    Canary: {
      id: allow,
      statement: allow,
      updatedAt: allow,
    },
  },
};
