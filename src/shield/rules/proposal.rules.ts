import { rule } from "graphql-shield";
import { Context } from "../../context/context.service";
import { GroupPrivacy } from "../../groups/group-configs/models/group-config.model";
import { Image } from "../../images/models/image.model";
import { ProposalAction } from "../../proposals/proposal-actions/models/proposal-action.model";
import { ProposalActionPermission } from "../../proposals/proposal-actions/proposal-action-roles/models/proposal-action-permission.model";
import { ProposalActionRoleMember } from "../../proposals/proposal-actions/proposal-action-roles/models/proposal-action-role-member.model";
import { ProposalActionRole } from "../../proposals/proposal-actions/proposal-action-roles/models/proposal-action-role.model";

export const isPublicProposal = rule()(
  async (parent, args, { services: { proposalsService } }: Context) => {
    const proposalId = parent ? parent.id : args.id;
    const proposal = await proposalsService.getProposal(proposalId, [
      "group.config",
    ]);
    return proposal.group.config.privacy === GroupPrivacy.Public;
  }
);

export const isPublicProposalImage = rule()(
  async (
    parent: Image,
    _args,
    { services: { proposalsService, proposalActionsService } }: Context
  ) => {
    if (parent?.proposalActionId) {
      const proposalAction = await proposalActionsService.getProposalAction(
        { id: parent.proposalActionId },
        ["proposal.group.config"]
      );
      return (
        proposalAction?.proposal.group.config.privacy === GroupPrivacy.Public
      );
    }
    const { group } = await proposalsService.getProposal(parent.proposalId, [
      "group.config",
    ]);
    return group.config.privacy === GroupPrivacy.Public;
  }
);

export const isPublicProposalAction = rule()(
  async (
    parent:
      | ProposalAction
      | ProposalActionRole
      | ProposalActionPermission
      | ProposalActionRoleMember,
    _args,
    {
      services: {
        proposalsService,
        proposalActionsService,
        proposalActionRolesService,
      },
    }: Context
  ) => {
    if ("proposalActionId" in parent) {
      const proposalAction = await proposalActionsService.getProposalAction(
        { id: parent.proposalActionId },
        ["proposal.group.config"]
      );
      return (
        proposalAction?.proposal.group.config.privacy === GroupPrivacy.Public
      );
    }
    if ("proposalActionRoleId" in parent) {
      const proposalActionRole =
        await proposalActionRolesService.getProposalActionRole(
          { id: parent.proposalActionRoleId },
          ["proposalAction.proposal.group.config"]
        );
      return (
        proposalActionRole?.proposalAction.proposal.group.config.privacy ===
        GroupPrivacy.Public
      );
    }
    const proposal = await proposalsService.getProposal(parent.proposalId, [
      "group.config",
    ]);
    return proposal.group.config.privacy === GroupPrivacy.Public;
  }
);
