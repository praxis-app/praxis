import { shield } from 'graphql-shield';
import * as hash from 'object-hash';
import { FORBIDDEN } from '../common/common.constants';
import { authPermissions } from './permissions/auth.permissions';
import { canaryPermissions } from './permissions/canary.permissions';
import { commentPermissions } from './permissions/comment.permissions';
import { conversationPermissions } from './permissions/conversation.permissions';
import { eventPermissions } from './permissions/event.permissions';
import { groupPermissions } from './permissions/group.permissions';
import { imagePermissions } from './permissions/image.permissions';
import { likePermissions } from './permissions/like.permissions';
import { notificationPermissions } from './permissions/notification.permissions';
import { postPermissions } from './permissions/post.permissions';
import { proposalPermissions } from './permissions/proposal.permissions';
import { rulePermissions } from './permissions/rule.permissions';
import { serverConfigPermissions } from './permissions/server-config.permissions';
import { serverInvitePermissions } from './permissions/server-invite.permissions';
import { serverRolePermissions } from './permissions/server-role.permissions';
import { userPermissions } from './permissions/user.permissions';
import { vibeCheckPermissions } from './permissions/vibe-check.permissions';
import { votePermissions } from './permissions/vote.permissions';
import { isVerified } from './rules/user.rules';

export const shieldConfig = shield(
  {
    Query: {
      ...authPermissions.Query,
      ...canaryPermissions.Query,
      ...conversationPermissions.Query,
      ...eventPermissions.Query,
      ...groupPermissions.Query,
      ...likePermissions.Query,
      ...notificationPermissions.Query,
      ...postPermissions.Query,
      ...proposalPermissions.Query,
      ...rulePermissions.Query,
      ...serverConfigPermissions.Query,
      ...serverInvitePermissions.Query,
      ...userPermissions.Query,
      ...vibeCheckPermissions.Query,
      ...votePermissions.Query,
    },
    Mutation: {
      ...authPermissions.Mutation,
      ...commentPermissions.Mutation,
      ...eventPermissions.Mutation,
      ...groupPermissions.Mutation,
      ...likePermissions.Mutation,
      ...notificationPermissions.Mutation,
      ...postPermissions.Mutation,
      ...proposalPermissions.Mutation,
      ...rulePermissions.Mutation,
      ...serverConfigPermissions.Mutation,
      ...serverInvitePermissions.Mutation,
      ...serverRolePermissions.Mutation,
      ...userPermissions.Mutation,
      ...vibeCheckPermissions.Mutation,
      ...votePermissions.Mutation,
    },
    Subscription: {
      ...conversationPermissions.Subscription,
      ...notificationPermissions.Subscription,
    },
    ...authPermissions.ObjectTypes,
    ...canaryPermissions.ObjectTypes,
    ...commentPermissions.ObjectTypes,
    ...conversationPermissions.ObjectTypes,
    ...eventPermissions.ObjectTypes,
    ...groupPermissions.ObjectTypes,
    ...imagePermissions.ObjectTypes,
    ...likePermissions.ObjectTypes,
    ...notificationPermissions.ObjectTypes,
    ...postPermissions.ObjectTypes,
    ...proposalPermissions.ObjectTypes,
    ...rulePermissions.ObjectTypes,
    ...serverConfigPermissions.ObjectTypes,
    ...serverInvitePermissions.ObjectTypes,
    ...serverRolePermissions.ObjectTypes,
    ...userPermissions.ObjectTypes,
    ...vibeCheckPermissions.ObjectTypes,
    ...votePermissions.ObjectTypes,
  },
  {
    fallbackRule: isVerified,
    fallbackError: FORBIDDEN,
    allowExternalErrors: true,

    /**
     * Convert `args` object to a string to avoid caching errors when
     * some fields are promises. This is required because of how
     * GraphQL Upload sends files as promises.
     */
    hashFunction: ({ parent, args }) => {
      const argsString = JSON.stringify(args);
      return hash({ parent, args: argsString });
    },
  },
);
