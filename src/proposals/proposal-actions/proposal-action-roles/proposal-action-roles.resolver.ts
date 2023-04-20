import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { Proposal } from "../../models/proposal.model";
import { ProposalActionRole } from "./models/proposal-action-role.model";
import { ProposalActionRolesService } from "./proposal-action-roles.service";

@Resolver(() => ProposalActionRole)
export class ProposalActionRolesResolver {
  constructor(private proposalActionRolesService: ProposalActionRolesService) {}

  @ResolveField(() => Proposal)
  async permissions(@Parent() { id }: ProposalActionRole) {
    return this.proposalActionRolesService.getProposalActionPermissions(id);
  }
}
