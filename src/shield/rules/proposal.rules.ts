import { rule } from 'graphql-shield';
import { UNAUTHORIZED } from '../../common/common.constants';
import { Context } from '../../context/context.types';
import { GroupPrivacy } from '../../groups/groups.constants';
import { Image } from '../../images/models/image.model';
import { ProposalConfig } from '../../proposals/models/proposal-config.model';
import { Proposal } from '../../proposals/models/proposal.model';
import { ProposalActionEventHost } from '../../proposals/proposal-actions/models/proposal-action-event-host.model';
import { ProposalActionEvent } from '../../proposals/proposal-actions/models/proposal-action-event.model';
import { ProposalActionGroupConfig } from '../../proposals/proposal-actions/models/proposal-action-group-config.model';
import { ProposalActionPermission } from '../../proposals/proposal-actions/models/proposal-action-permission.model';
import { ProposalActionRoleMember } from '../../proposals/proposal-actions/models/proposal-action-role-member.model';
import { ProposalActionRole } from '../../proposals/proposal-actions/models/proposal-action-role.model';
import { ProposalAction } from '../../proposals/proposal-actions/models/proposal-action.model';
import { Vote } from '../../votes/models/vote.model';
import { hasServerPermission } from '../shield.utils';

export const isOwnProposal = rule({ cache: 'strict' })(async (
  _parent,
  args: { id: number } | null,
  { user, services: { proposalsService } }: Context,
) => {
  if (!user) {
    return UNAUTHORIZED;
  }
  if (!args?.id) {
    return false;
  }
  return proposalsService.isOwnProposal(args.id, user.id);
});

export const hasNoVotes = rule({ cache: 'strict' })(async (
  _parent,
  args: { id: number } | null,
  { services: { proposalsService } }: Context,
) => {
  if (!args?.id) {
    return false;
  }
  return proposalsService.hasNoVotes(args.id);
});

export const isPublicProposal = rule({ cache: 'strict' })(async (
  parent: Proposal | ProposalConfig | null,
  args: { id: number },
  { services: { proposalsService } }: Context,
) => {
  let proposalId: number | undefined;

  if (parent instanceof ProposalConfig) {
    proposalId = parent.proposalId;
  } else if (parent instanceof Proposal) {
    proposalId = parent.id;
  } else if (args) {
    proposalId = args.id;
  }
  if (!proposalId) {
    return false;
  }
  const proposal = await proposalsService.getProposal(proposalId, [
    'group.config',
  ]);
  return proposal.group?.config.privacy === GroupPrivacy.Public;
});

export const isPublicProposalImage = rule({ cache: 'strict' })(
  async (parent: Image, _args, { services: { proposalsService } }: Context) =>
    proposalsService.isPublicProposalImage(parent),
);

export const isPublicProposalAction = rule({ cache: 'strict' })(async (
  parent:
    | ProposalAction
    | ProposalActionEvent
    | ProposalActionGroupConfig
    | ProposalActionPermission
    | ProposalActionRole
    | ProposalActionRoleMember,
  _args,
  { services: { proposalActionsService, proposalsService } }: Context,
) => {
  if (
    parent instanceof ProposalActionRole ||
    parent instanceof ProposalActionEvent ||
    parent instanceof ProposalActionGroupConfig
  ) {
    const proposalAction = await proposalActionsService.getProposalAction(
      { id: parent.proposalActionId },
      ['proposal.group.config'],
    );
    return (
      proposalAction?.proposal.group?.config.privacy === GroupPrivacy.Public
    );
  }
  if (
    parent instanceof ProposalActionRoleMember ||
    parent instanceof ProposalActionPermission
  ) {
    const proposalActionRole =
      await proposalActionsService.getProposalActionRole(
        { id: parent.proposalActionRoleId },
        ['proposalAction.proposal.group.config'],
      );
    return (
      proposalActionRole?.proposalAction.proposal.group?.config.privacy ===
      GroupPrivacy.Public
    );
  }
  if (parent instanceof ProposalActionEventHost) {
    const proposalActionEvent =
      await proposalActionsService.getProposalActionEvent(
        { id: parent.proposalActionEventId },
        ['proposalAction.proposal.group.config'],
      );
    return (
      proposalActionEvent?.proposalAction.proposal.group?.config.privacy ===
      GroupPrivacy.Public
    );
  }
  const proposal = await proposalsService.getProposal(parent.proposalId, [
    'group.config',
  ]);
  return proposal.group?.config.privacy === GroupPrivacy.Public;
});

export const isPublicProposalVote = rule({ cache: 'strict' })(async (
  parent: Vote,
  _args,
  { services: { proposalsService } }: Context,
) => {
  if (!parent.proposalId) {
    return false;
  }
  const { group } = await proposalsService.getProposal(parent.proposalId, [
    'group.config',
  ]);
  return group?.config.privacy === GroupPrivacy.Public;
});

export const canRemoveProposals = rule({ cache: 'contextual' })(
  async (_parent, _args, { permissions }: Context) =>
    hasServerPermission(permissions, 'removeProposals'),
);
