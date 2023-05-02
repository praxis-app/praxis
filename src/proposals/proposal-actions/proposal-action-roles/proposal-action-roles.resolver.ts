import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { Role } from "../../../roles/models/role.model";
import { RolesService } from "../../../roles/roles.service";
import { ProposalActionPermission } from "./models/proposal-action-permission.model";
import { ProposalActionRoleMember } from "./models/proposal-action-role-member.model";
import { ProposalActionRole } from "./models/proposal-action-role.model";
import { ProposalActionRolesService } from "./proposal-action-roles.service";

@Resolver(() => ProposalActionRole)
export class ProposalActionRolesResolver {
  constructor(
    private proposalActionRolesService: ProposalActionRolesService,
    private rolesService: RolesService
  ) {}

  @ResolveField(() => [ProposalActionPermission])
  async permissions(@Parent() { id }: ProposalActionRole) {
    return this.proposalActionRolesService.getProposalActionPermissions(id);
  }

  @ResolveField(() => [ProposalActionRoleMember])
  async members(@Parent() { id }: ProposalActionRole) {
    return this.proposalActionRolesService.getProposalActionRoleMembers(id);
  }

  @ResolveField(() => Role, { nullable: true })
  async role(@Parent() { roleId }: ProposalActionRole) {
    return roleId ? this.rolesService.getRole(roleId) : null;
  }
}
