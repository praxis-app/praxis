import { allow } from 'graphql-shield';
import { isAuthenticated } from '../rules/auth.rules';

export const authPermissions = {
  Query: {
    isValidResetPasswordToken: allow,
    authCheck: isAuthenticated,
  },
  Mutation: {
    login: allow,
    logOut: allow,
    signUp: allow,
    resetPassword: allow,
    sendPasswordReset: allow,
  },
  ObjectTypes: {
    AuthPayload: allow,
  },
};
