import { isConversationMember } from '../rules/chat.rules';
import { canManageQuestionnaireTickets } from '../rules/question.rules';

export const conversationPermissions = {
  Query: {
    vibeChat: canManageQuestionnaireTickets,
    conversation: isConversationMember,
  },
  Subscription: {
    newMessage: isConversationMember,
  },
  ObjectTypes: {
    Conversation: isConversationMember,
  },
};
