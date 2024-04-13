import { or } from 'graphql-shield';
import { isProposalGroupJoinedByMe } from '../rules/group.rules';
import { isPublicProposalVote } from '../rules/proposal.rules';
import { canManageQuestionnaireTickets } from '../rules/question.rules';
import { isVerified } from '../rules/user.rules';

export const votePermissions = {
  Mutation: {
    createVote: or(isProposalGroupJoinedByMe, canManageQuestionnaireTickets),
  },
  ObjectTypes: {
    Vote: or(isVerified, isPublicProposalVote),
  },
};
