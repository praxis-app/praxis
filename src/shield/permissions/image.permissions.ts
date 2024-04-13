import { or } from 'graphql-shield';
import { isPublicCommentImage } from '../rules/comment.rules';
import { isPublicEventImage } from '../rules/event.rules';
import { isPublicGroupImage } from '../rules/group.rules';
import { isPublicPostImage } from '../rules/post.rules';
import { isPublicProposalImage } from '../rules/proposal.rules';
import {
  isOwnQuestionCommentImage,
  isOwnQuestionnaireTicketCommentImage,
  isOwnQuestionnaireTicketReviewerAvatar,
} from '../rules/question.rules';
import {
  isOwnUserAvatar,
  isPublicUserAvatar,
  isVerified,
} from '../rules/user.rules';

export const imagePermissions = {
  ObjectTypes: {
    Image: {
      id: or(
        isOwnQuestionCommentImage,
        isOwnQuestionnaireTicketCommentImage,
        isOwnQuestionnaireTicketReviewerAvatar,
        isOwnUserAvatar,
        isPublicCommentImage,
        isPublicEventImage,
        isPublicGroupImage,
        isPublicPostImage,
        isPublicProposalImage,
        isPublicUserAvatar,
        isVerified,
      ),
      filename: or(
        isOwnQuestionCommentImage,
        isOwnQuestionnaireTicketCommentImage,
        isPublicCommentImage,
        isPublicPostImage,
        isPublicProposalImage,
        isVerified,
      ),
    },
  },
};
