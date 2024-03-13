import { rule } from 'graphql-shield';
import { Comment } from '../../comments/models/comment.model';
import { CreateCommentInput } from '../../comments/models/create-comment.input';
import { UNAUTHORIZED } from '../../common/common.constants';
import { Context } from '../../context/context.types';
import { Image } from '../../images/models/image.model';
import { CreateLikeInput } from '../../likes/models/create-like.input';
import { DeleteLikeInput } from '../../likes/models/delete-like.input';
import { Answer } from '../../vibe-check/models/answer.model';
import { Question } from '../../vibe-check/models/question.model';
import { QuestionnaireTicket } from '../../vibe-check/models/questionnaire-ticket.model';
import { User } from '../../users/models/user.model';
import { hasServerPermission } from '../shield.utils';

export const canManageQuestionnaireTickets = rule({ cache: 'strict' })(
  async (_parent, _args, { permissions }: Context) =>
    hasServerPermission(permissions, 'manageQuestionnaireTickets'),
);

export const isOwnQuestionnaireTicket = rule({ cache: 'strict' })(async (
  parent: QuestionnaireTicket | undefined,
  args: { commentData: CreateCommentInput } | object,
  { services: { vibeCheckService }, user }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  if ('commentData' in args && args.commentData.questionnaireTicketId) {
    return vibeCheckService.isOwnQuestionnaireTicket(
      args.commentData.questionnaireTicketId,
      user.id,
    );
  }
  if (!parent) {
    return false;
  }
  return vibeCheckService.isOwnQuestionnaireTicket(parent.id, user.id);
});

export const isOwnQuestionnaireTicketComment = rule({ cache: 'strict' })(async (
  parent: Comment | undefined,
  args: { likeData: CreateLikeInput | DeleteLikeInput } | object,
  { services: { vibeCheckService }, user }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  if ('likeData' in args && args.likeData.commentId) {
    return vibeCheckService.isOwnQuestionnaireTicketComment(
      args.likeData.commentId,
      user.id,
    );
  }
  if (!parent) {
    return false;
  }
  return vibeCheckService.isOwnQuestionnaireTicketComment(parent.id, user.id);
});

export const isOwnQuestionnaireTicketReviewer = rule({ cache: 'strict' })(
  async (
    parent: User,
    _args,
    { services: { vibeCheckService }, user }: Context,
  ) => {
    if (!user) {
      return UNAUTHORIZED;
    }
    return vibeCheckService.isOwnQuestionnaireTicketReviewer(
      user.id,
      parent.id,
    );
  },
);

export const isOwnQuestionnaireTicketReviewerAvatar = rule({ cache: 'strict' })(
  async (
    parent: Image,
    _args,
    { services: { vibeCheckService }, user }: Context,
  ) => {
    if (!user) {
      return UNAUTHORIZED;
    }
    return vibeCheckService.isOwnQuestionnaireTicketReviewerAvatar(
      user.id,
      parent.id,
    );
  },
);

export const isOwnQuestionnaireTicketCommentImage = rule({ cache: 'strict' })(
  async (
    parent: Image,
    _args,
    { services: { vibeCheckService }, user }: Context,
  ) => {
    if (!user) {
      return UNAUTHORIZED;
    }
    return vibeCheckService.isOwnQuestionnaireTicketCommentImage(
      user.id,
      parent.id,
    );
  },
);

export const isOwnQuestion = rule({ cache: 'strict' })(async (
  parent: Question | undefined,
  args:
    | { likeData: CreateLikeInput | DeleteLikeInput }
    | { commentData: CreateCommentInput }
    | { id: number }
    | object,
  { services: { vibeCheckService }, user }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  if ('commentData' in args && args.commentData.questionId) {
    return vibeCheckService.isOwnQuestion(args.commentData.questionId, user.id);
  }
  if ('likeData' in args && args.likeData.questionId) {
    return vibeCheckService.isOwnQuestion(args.likeData.questionId, user.id);
  }
  if ('id' in args) {
    return vibeCheckService.isOwnQuestion(args.id, user.id);
  }
  if (!parent) {
    return false;
  }
  return vibeCheckService.isOwnQuestion(parent.id, user.id);
});

export const isOwnQuestionComment = rule({ cache: 'strict' })(async (
  parent: Question | undefined,
  args: { likeData: CreateLikeInput | DeleteLikeInput } | object,
  { services: { vibeCheckService }, user }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  if ('likeData' in args && args.likeData.commentId) {
    return vibeCheckService.isOwnQuestionComment(
      args.likeData.commentId,
      user.id,
    );
  }
  if (!parent) {
    return false;
  }
  return vibeCheckService.isOwnQuestionComment(parent.id, user.id);
});

export const isOwnQuestionCommentImage = rule({ cache: 'strict' })(async (
  parent: Image,
  _args,
  { services: { vibeCheckService }, user }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  return vibeCheckService.isOwnQuestionCommentImage(user.id, parent.id);
});

export const isOwnAnswer = rule({ cache: 'strict' })(async (
  parent: Answer,
  _args,
  { services: { vibeCheckService }, user }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  return vibeCheckService.isOwnAnswer(parent.id, user.id);
});
