import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { GroupRolesService } from '../../../groups/group-roles/group-roles.service';
import { GroupRole } from '../../../groups/group-roles/models/group-role.model';
import { ProposalActionPermission } from './models/proposal-action-permission.model';
import { ProposalActionRoleMember } from './models/proposal-action-role-member.model';
import { ProposalActionRole } from './models/proposal-action-role.model';
import { ProposalActionRolesService } from './proposal-action-roles.service';

@Resolver(() => ProposalActionRole)
export class ProposalActionRolesResolver {
  constructor(
    private proposalActionRolesService: ProposalActionRolesService,
    private groupRolesService: GroupRolesService,
  ) {}

  @ResolveField(() => ProposalActionPermission)
  async permissions(@Parent() { id }: ProposalActionRole) {
    return this.proposalActionRolesService.getProposalActionPermission(id);
  }

  @ResolveField(() => [ProposalActionRoleMember])
  async members(@Parent() { id }: ProposalActionRole) {
    return this.proposalActionRolesService.getProposalActionRoleMembers(id);
  }

  @ResolveField(() => GroupRole, { nullable: true })
  async groupRole(@Parent() { groupRoleId }: ProposalActionRole) {
    if (!groupRoleId) {
      return null;
    }
    return this.groupRolesService.getGroupRole({ id: groupRoleId });
  }
}
