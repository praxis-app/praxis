import { rule } from 'graphql-shield';
import { Context } from '../../context/context.types';
import { GroupPrivacy } from '../../groups/group-configs/group-configs.constants';
import { Image } from '../../images/models/image.model';
import { ProposalConfig } from '../../proposals/models/proposal-config.model';
import { Proposal } from '../../proposals/models/proposal.model';
import { ProposalAction } from '../../proposals/proposal-actions/models/proposal-action.model';
import { ProposalActionEventHost } from '../../proposals/proposal-actions/proposal-action-events/models/proposal-action-event-host.model';
import { ProposalActionEvent } from '../../proposals/proposal-actions/proposal-action-events/models/proposal-action-event.model';
import { ProposalActionGroupConfig } from '../../proposals/proposal-actions/proposal-action-group-configs/models/proposal-action-group-config.model';
import { ProposalActionPermission } from '../../proposals/proposal-actions/proposal-action-roles/models/proposal-action-permission.model';
import { ProposalActionRoleMember } from '../../proposals/proposal-actions/proposal-action-roles/models/proposal-action-role-member.model';
import { ProposalActionRole } from '../../proposals/proposal-actions/proposal-action-roles/models/proposal-action-role.model';
import { Vote } from '../../votes/models/vote.model';

export const isPublicProposal = rule({ cache: 'strict' })(async (
  parent: Proposal | ProposalConfig | null,
  args: { id: number },
  { services: { proposalsService }, logger }: Context,
) => {
  if (parent instanceof ProposalConfig) {
    const proposal = await proposalsService.getProposal(parent.proposalId, [
      'group.config',
    ]);
    const isPublic = proposal.group.config.privacy === GroupPrivacy.Public;
    if (!isPublic) {
      logger.log(
        `Proposal ${proposal.id} is not public: ${JSON.stringify(parent)}`,
      );
    }
    return isPublic;
  }

  const proposalId = parent ? parent.id : args.id;
  const proposal = await proposalsService.getProposal(proposalId, [
    'group.config',
  ]);

  const isPublic = proposal.group.config.privacy === GroupPrivacy.Public;
  if (!isPublic) {
    logger.log(
      `Proposal ${proposalId} is not public: ${JSON.stringify(parent || args)}`,
    );
  }
  return isPublic;
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
  {
    services: {
      proposalActionEventsService,
      proposalActionRolesService,
      proposalActionsService,
      proposalsService,
    },
  }: Context,
) => {
  if (parent instanceof ProposalActionGroupConfig) {
    const proposalAction = await proposalActionsService.getProposalAction(
      { id: parent.proposalActionId },
      ['proposal.group.config'],
    );
    return (
      proposalAction?.proposal.group.config.privacy === GroupPrivacy.Public
    );
  }
  if (
    parent instanceof ProposalActionRole ||
    parent instanceof ProposalActionEvent
  ) {
    const proposalAction = await proposalActionsService.getProposalAction(
      { id: parent.proposalActionId },
      ['proposal.group.config'],
    );
    return (
      proposalAction?.proposal.group.config.privacy === GroupPrivacy.Public
    );
  }
  if (
    parent instanceof ProposalActionRoleMember ||
    parent instanceof ProposalActionPermission
  ) {
    const proposalActionRole =
      await proposalActionRolesService.getProposalActionRole(
        { id: parent.proposalActionRoleId },
        ['proposalAction.proposal.group.config'],
      );
    return (
      proposalActionRole?.proposalAction.proposal.group.config.privacy ===
      GroupPrivacy.Public
    );
  }
  if (parent instanceof ProposalActionEventHost) {
    const proposalActionEvent =
      await proposalActionEventsService.getProposalActionEvent(
        { id: parent.proposalActionEventId },
        ['proposalAction.proposal.group.config'],
      );
    return (
      proposalActionEvent?.proposalAction.proposal.group.config.privacy ===
      GroupPrivacy.Public
    );
  }
  const proposal = await proposalsService.getProposal(parent.proposalId, [
    'group.config',
  ]);
  return proposal.group.config.privacy === GroupPrivacy.Public;
});

export const isPublicVote = rule({ cache: 'strict' })(async (
  parent: Vote,
  _args,
  { services: { proposalsService } }: Context,
) => {
  const { group } = await proposalsService.getProposal(parent.proposalId, [
    'group.config',
  ]);
  return group.config.privacy === GroupPrivacy.Public;
});
