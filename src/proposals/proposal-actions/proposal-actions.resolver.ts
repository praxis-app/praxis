import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { Proposal } from "../models/proposal.model";
import { ProposalsService } from "../proposals.service";
import { ProposalAction } from "./models/proposal-action.model";
import { ProposalActionsService } from "./proposal-actions.service";

@Resolver(() => ProposalAction)
export class ProposalActionsResolver {
  constructor(
    private proposalActionsService: ProposalActionsService,
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
}
