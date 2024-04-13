import { or, shield } from 'graphql-shield';
import * as hash from 'object-hash';
import { FORBIDDEN } from '../../common/common.constants';
import { isAuthenticated } from '../rules/auth.rules';
import {
  canManageComments,
  isOwnComment,
  isPublicComment,
} from '../rules/comment.rules';
import {
  canManageGroupComments,
  isProposalGroupJoinedByMe,
} from '../rules/group.rules';
import { isPublicProposalVote } from '../rules/proposal.rules';
import {
  canManageQuestionnaireTickets,
  isOwnQuestion,
  isOwnQuestionComment,
  isOwnQuestionnaireTicket,
  isOwnQuestionnaireTicketComment,
} from '../rules/question.rules';
import { canManageServerRoles } from '../rules/role.rules';
import { isVerified } from '../rules/user.rules';
import { authPermissions } from './auth.permissions';
import { canaryPermissions } from './canary.permissions';
import { eventPermissions } from './event.permissions';
import { groupPermissions } from './group.permissions';
import { imagePermissions } from './image.permissions';
import { likePermissions } from './like.permissions';
import { notificationPermissions } from './notification.permissions';
import { postPermissions } from './post.permissions';
import { proposalPermissions } from './proposal.permissions';
import { rulePermissions } from './rule.permissions';
import { serverConfigPermissions } from './server-config.permissions';
import { serverInvitePermissions } from './server-invite.permissions';
import { userPermissions } from './user.permissions';
import { vibeCheckPermissions } from './vibe-check.permissions';

export const shieldPermissions = shield(
  {
    Query: {
      ...authPermissions.Query,
      ...canaryPermissions.Query,
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
    },
    Mutation: {
      ...authPermissions.Mutation,
      ...eventPermissions.Mutation,
      ...groupPermissions.Mutation,
      ...likePermissions.Mutation,
      ...notificationPermissions.Mutation,
      ...postPermissions.Mutation,
      ...proposalPermissions.Mutation,
      ...rulePermissions.Mutation,
      ...serverConfigPermissions.Mutation,
      ...serverInvitePermissions.Mutation,
      ...userPermissions.Mutation,
      ...vibeCheckPermissions.Mutation,
      createVote: or(isProposalGroupJoinedByMe, canManageQuestionnaireTickets),
      createServerRole: canManageServerRoles,
      updateServerRole: canManageServerRoles,
      deleteServerRole: canManageServerRoles,
      deleteServerRoleMember: canManageServerRoles,
      createComment: or(isVerified, isOwnQuestion, isOwnQuestionnaireTicket),
      updateComment: isOwnComment,
      deleteComment: or(
        isOwnComment,
        canManageComments,
        canManageGroupComments,
      ),
    },
    ...authPermissions.ObjectTypes,
    ...canaryPermissions.ObjectTypes,
    ...eventPermissions.ObjectTypes,
    ...groupPermissions.ObjectTypes,
    ...imagePermissions.ObjectTypes,
    ...likePermissions.ObjectTypes,
    ...notificationPermissions.ObjectTypes,
    ...postPermissions.ObjectTypes,
    ...proposalPermissions.ObjectTypes,
    ...rulePermissions.ObjectTypes,
    ...serverInvitePermissions.ObjectTypes,
    ...userPermissions.ObjectTypes,
    ...vibeCheckPermissions.ObjectTypes,
    ServerPermissions: isAuthenticated,
    Comment: or(
      isOwnQuestionComment,
      isOwnQuestionnaireTicketComment,
      isPublicComment,
      isVerified,
    ),
    CreateCommentPayload: isAuthenticated,
    UpdateCommentPayload: isAuthenticated,
    Vote: or(isVerified, isPublicProposalVote),
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
