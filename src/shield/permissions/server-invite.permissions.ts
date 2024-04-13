import { allow, or } from 'graphql-shield';
import {
  canCreateServerInvites,
  canManageServerInvites,
} from '../rules/server-invite.rules';

export const serverInvitePermissions = {
  Query: {
    serverInvite: allow,
    serverInvites: or(canCreateServerInvites, canManageServerInvites),
  },
  Mutation: {
    createServerInvite: or(canCreateServerInvites, canManageServerInvites),
    deleteServerInvite: canManageServerInvites,
  },
  ObjectTypes: {
    ServerInvite: {
      id: allow,
      token: allow,
    },
  },
};
