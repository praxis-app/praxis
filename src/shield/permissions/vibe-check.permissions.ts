import { or } from 'graphql-shield';
import { isAuthenticated } from '../rules/auth.rules';
import {
  canManageQuestionnaireTickets,
  isOwnAnswer,
  isOwnQuestion,
  isOwnQuestionnaireTicket,
} from '../rules/question.rules';

export const vibeCheckPermissions = {
  Query: {
    question: or(isOwnQuestion, canManageQuestionnaireTickets),
  },
  Mutation: {
    answerQuestions: isAuthenticated,
  },
  ObjectTypes: {
    Answer: or(isOwnAnswer, canManageQuestionnaireTickets),
    Question: or(isOwnQuestion, canManageQuestionnaireTickets),
    QuestionnaireTicket: {
      id: or(isOwnQuestionnaireTicket, canManageQuestionnaireTickets),
      prompt: or(isOwnQuestionnaireTicket, canManageQuestionnaireTickets),
      questions: or(isOwnQuestionnaireTicket, canManageQuestionnaireTickets),
      comments: or(isOwnQuestionnaireTicket, canManageQuestionnaireTickets),
      status: or(isOwnQuestionnaireTicket, canManageQuestionnaireTickets),
      user: or(isOwnQuestionnaireTicket, canManageQuestionnaireTickets),
    },
    AnswerQuestionsPayload: isAuthenticated,
  },
};
