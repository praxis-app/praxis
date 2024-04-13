import { allow, or } from 'graphql-shield';
import { isAuthenticated } from '../rules/auth.rules';
import { isOwnQuestionnaireTicketReviewer } from '../rules/question.rules';
import {
  canRemoveMembers,
  isMe,
  isUserInPublicGroups,
  isVerified,
} from '../rules/user.rules';

export const userPermissions = {
  Query: {
    me: isAuthenticated,
    user: or(isMe, isVerified),
    users: canRemoveMembers,
    isFirstUser: allow,
  },
  Mutation: {
    updateUser: isAuthenticated,
    deleteUser: or(isMe, canRemoveMembers),
  },
  ObjectTypes: {
    User: {
      id: or(
        isMe,
        isVerified,
        isUserInPublicGroups,
        isOwnQuestionnaireTicketReviewer,
      ),
      name: or(
        isMe,
        isVerified,
        isUserInPublicGroups,
        isOwnQuestionnaireTicketReviewer,
      ),
      profilePicture: or(
        isMe,
        isVerified,
        isUserInPublicGroups,
        isOwnQuestionnaireTicketReviewer,
      ),
      bio: or(isMe, isVerified),
      coverPhoto: or(isMe, isVerified),
      createdAt: or(isMe, isVerified),
      isFollowedByMe: or(isMe, isVerified, isOwnQuestionnaireTicketReviewer),
      isVerified: or(isMe, canRemoveMembers),
      questionnaireTicket: isMe,
      serverPermissions: isMe,
    },
    UpdateUserPayload: isAuthenticated,
  },
};
