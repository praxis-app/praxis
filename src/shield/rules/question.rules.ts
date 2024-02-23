import { rule } from 'graphql-shield';
import { Comment } from '../../comments/models/comment.model';
import { UNAUTHORIZED } from '../../common/common.constants';
import { Context } from '../../context/context.types';
import { Image } from '../../images/models/image.model';
import { Answer } from '../../questions/models/answer.model';
import { Question } from '../../questions/models/question.model';
import { QuestionnaireTicket } from '../../questions/models/questionnaire-ticket.model';
import { User } from '../../users/models/user.model';
import { hasServerPermission } from '../shield.utils';

export const canManageQuestionnaireTickets = rule({ cache: 'strict' })(
  async (_parent, _args, { permissions }: Context) =>
    hasServerPermission(permissions, 'manageQuestionnaireTickets'),
);

export const isOwnQuestionnaireTicket = rule({ cache: 'strict' })(async (
  parent: QuestionnaireTicket,
  _args,
  { services: { questionsService }, user }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  return questionsService.isOwnQuestionnaireTicket(parent.id, user.id);
});

export const isOwnQuestionnaireTicketComment = rule({ cache: 'strict' })(async (
  parent: Comment,
  _args,
  { services: { questionsService }, user }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  return questionsService.isOwnQuestionnaireTicketComment(parent.id, user.id);
});

export const isOwnQuestionnaireTicketReviewer = rule({ cache: 'strict' })(
  async (
    parent: User,
    _args,
    { services: { questionsService }, user }: Context,
  ) => {
    if (!user) {
      return UNAUTHORIZED;
    }
    return questionsService.isOwnQuestionnaireTicketReviewer(
      user.id,
      parent.id,
    );
  },
);

export const isOwnQuestionnaireTicketReviewerAvatar = rule({ cache: 'strict' })(
  async (
    parent: Image,
    _args,
    { services: { questionsService }, user }: Context,
  ) => {
    if (!user) {
      return UNAUTHORIZED;
    }
    return questionsService.isOwnQuestionnaireTicketReviewerAvatar(
      user.id,
      parent.id,
    );
  },
);

export const isOwnQuestion = rule({ cache: 'strict' })(async (
  parent: Question,
  _args,
  { services: { questionsService }, user }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  return questionsService.isOwnQuestion(parent.id, user.id);
});

export const isOwnAnswer = rule({ cache: 'strict' })(async (
  parent: Answer,
  _args,
  { services: { questionsService }, user }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  return questionsService.isOwnAnswer(parent.id, user.id);
});
