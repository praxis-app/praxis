import { and, or } from 'graphql-shield';
import {
  canRemoveProposals,
  hasNoVotes,
  isOwnProposal,
  isPublicProposal,
  isPublicProposalAction,
} from '../rules/proposal.rules';
import { isVerified } from '../rules/user.rules';

export const proposalPermissions = {
  Query: {
    proposal: or(isVerified, isPublicProposal),
  },
  Mutation: {
    deleteProposal: or(and(isOwnProposal, hasNoVotes), canRemoveProposals),
  },
  ObjectTypes: {
    Proposal: or(isVerified, isPublicProposal),
    ProposalAction: or(isVerified, isPublicProposalAction),
    ProposalActionEvent: or(isVerified, isPublicProposalAction),
    ProposalActionEventHost: or(isVerified, isPublicProposalAction),
    ProposalActionGroupConfig: or(isVerified, isPublicProposalAction),
    ProposalActionPermission: or(isVerified, isPublicProposalAction),
    ProposalActionRole: or(isVerified, isPublicProposalAction),
    ProposalActionRoleMember: or(isVerified, isPublicProposalAction),
    ProposalConfig: or(isVerified, isPublicProposal),
  },
};
