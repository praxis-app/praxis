import { or } from 'graphql-shield';
import { isAuthenticated } from '../rules/auth.rules';
import { isPublicComment } from '../rules/comment.rules';
import { isPublicEventPost } from '../rules/event.rules';
import { isPublicLike } from '../rules/like.rules';
import { isPublicPost } from '../rules/post.rules';
import {
  isOwnQuestion,
  isOwnQuestionComment,
  isOwnQuestionnaireTicketComment,
} from '../rules/question.rules';
import { isVerified } from '../rules/user.rules';

export const likePermissions = {
  Query: {
    likes: or(
      isAuthenticated,
      isPublicComment,
      isPublicEventPost,
      isPublicPost,
    ),
  },
  Mutation: {
    createLike: or(
      isOwnQuestion,
      isOwnQuestionComment,
      isOwnQuestionnaireTicketComment,
      isVerified,
    ),
    deleteLike: or(
      isOwnQuestion,
      isOwnQuestionComment,
      isOwnQuestionnaireTicketComment,
      isVerified,
    ),
  },
  ObjectTypes: {
    Like: or(isAuthenticated, isPublicLike),
    CreateLikePayload: isAuthenticated,
  },
};
