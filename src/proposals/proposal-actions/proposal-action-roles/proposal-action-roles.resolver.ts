import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { ProposalActionPermission } from "./models/proposal-action-permission.model";
import { ProposalActionRoleMember } from "./models/proposal-action-role-member.model";
import { ProposalActionRole } from "./models/proposal-action-role.model";
import { ProposalActionRolesService } from "./proposal-action-roles.service";

@Resolver(() => ProposalActionRole)
export class ProposalActionRolesResolver {
  constructor(private proposalActionRolesService: ProposalActionRolesService) {}

  @ResolveField(() => [ProposalActionPermission])
  async permissions(@Parent() { id }: ProposalActionRole) {
    return this.proposalActionRolesService.getProposalActionPermissions(id);
  }

  @ResolveField(() => [ProposalActionRoleMember])
  async members(@Parent() { id }: ProposalActionRole) {
    return this.proposalActionRolesService.getProposalActionPermissions(id);
  }
}
