import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { GroupRolesService } from '../../../groups/group-roles/group-roles.service';
import { GroupRole } from '../../../groups/group-roles/models/group-role.model';
import { ServerRole } from '../../../server-roles/models/server-role.model';
import { ServerRolesService } from '../../../server-roles/server-roles.service';
import { ProposalActionPermission } from '../models/proposal-action-permission.model';
import { ProposalActionRoleMember } from '../models/proposal-action-role-member.model';
import { ProposalActionRole } from '../models/proposal-action-role.model';
import { ProposalActionsService } from '../proposal-actions.service';

@Resolver(() => ProposalActionRole)
export class ProposalActionRolesResolver {
  constructor(
    private groupRolesService: GroupRolesService,
    private serverRolesService: ServerRolesService,
    private proposalActionsService: ProposalActionsService,
  ) {}

  @ResolveField(() => ProposalActionPermission)
  async permissions(@Parent() { id }: ProposalActionRole) {
    return this.proposalActionsService.getProposalActionPermission(id);
  }

  @ResolveField(() => [ProposalActionRoleMember])
  async members(@Parent() { id }: ProposalActionRole) {
    return this.proposalActionsService.getProposalActionRoleMembers(id);
  }

  @ResolveField(() => GroupRole, { nullable: true })
  async groupRole(@Parent() { groupRoleId }: ProposalActionRole) {
    if (!groupRoleId) {
      return null;
    }
    return this.groupRolesService.getGroupRole({ id: groupRoleId });
  }

  @ResolveField(() => ServerRole, { nullable: true })
  async serverRole(@Parent() { serverRoleId }: ProposalActionRole) {
    if (!serverRoleId) {
      return null;
    }
    return this.serverRolesService.getServerRole({ id: serverRoleId });
  }
}
