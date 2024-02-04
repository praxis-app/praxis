import { rule } from 'graphql-shield';
import { Context } from '../../context/context.types';
import { hasServerPermission } from '../shield.utils';
import { CreateVoteInput } from '../../votes/models/create-vote.input';

export const canManageQuestionnaireTickets = rule({ cache: 'strict' })(async (
  _parent,
  args: { voteData: CreateVoteInput } | null,
  { permissions, services: { questionsService } }: Context,
) => {
  if (!args?.voteData.questionnaireTicketId) {
    return false;
  }
  const isServerQuestionnaireTicket =
    await questionsService.isServerQuestionnaireTicket(
      args.voteData.questionnaireTicketId,
    );
  const hasPermission = hasServerPermission(
    permissions,
    'manageQuestionnaireTickets',
  );
  return isServerQuestionnaireTicket && hasPermission;
});
