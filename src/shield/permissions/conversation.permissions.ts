import { canManageQuestionnaireTickets } from '../rules/question.rules';

export const conversationPermissions = {
  Query: {
    vibeChat: canManageQuestionnaireTickets,
  },
  // Mutation: {},
  // ObjectTypes: {},
};
