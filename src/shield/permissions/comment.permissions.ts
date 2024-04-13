import { or } from 'graphql-shield';
import { isAuthenticated } from '../rules/auth.rules';
import {
  canManageComments,
  isOwnComment,
  isPublicComment,
} from '../rules/comment.rules';
import { canManageGroupComments } from '../rules/group.rules';
import {
  isOwnQuestion,
  isOwnQuestionComment,
  isOwnQuestionnaireTicket,
  isOwnQuestionnaireTicketComment,
} from '../rules/question.rules';
import { isVerified } from '../rules/user.rules';

export const commentPermissions = {
  Mutation: {
    createComment: or(isVerified, isOwnQuestion, isOwnQuestionnaireTicket),
    deleteComment: or(isOwnComment, canManageComments, canManageGroupComments),
    updateComment: isOwnComment,
  },
  ObjectTypes: {
    Comment: or(
      isOwnQuestionComment,
      isOwnQuestionnaireTicketComment,
      isPublicComment,
      isVerified,
    ),
    CreateCommentPayload: isAuthenticated,
    UpdateCommentPayload: isAuthenticated,
  },
};
