import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { Image } from "../../images/models/image.model";
import { Proposal } from "../models/proposal.model";
import { ProposalsService } from "../proposals.service";
import { ProposalAction } from "./models/proposal-action.model";
import { ProposalActionRole } from "./proposal-action-roles/models/proposal-action-role.model";
import { ProposalActionRolesService } from "./proposal-action-roles/proposal-action-roles.service";
import { ProposalActionsService } from "./proposal-actions.service";

@Resolver(() => ProposalAction)
export class ProposalActionsResolver {
  constructor(
    private proposalActionsService: ProposalActionsService,
    private proposalActionRolesService: ProposalActionRolesService,
    private proposalsService: ProposalsService
  ) {}

  @ResolveField(() => Proposal)
  async proposal(@Parent() { proposalId }: ProposalAction) {
    return this.proposalsService.getProposal(proposalId);
  }

  @ResolveField(() => Image)
  async groupCoverPhoto(@Parent() { id }: ProposalAction) {
    return this.proposalActionsService.getProposedGroupCoverPhoto(id);
  }

  @ResolveField(() => ProposalActionRole)
  async role(@Parent() { id }: ProposalAction) {
    return this.proposalActionRolesService.getProposalActionRole(id);
  }
}
