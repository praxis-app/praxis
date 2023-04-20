import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProposalActionPermission } from "./models/proposal-action-permission.model";
import { ProposalActionRoleInput } from "./models/proposal-action-role-input";
import { ProposalActionRole } from "./models/proposal-action-role.model";

export enum RoleMemberChangeType {
  Add = "add",
  Remove = "remove",
}

@Injectable()
export class ProposalActionRolesService {
  constructor(
    @InjectRepository(ProposalActionRole)
    private proposalActionRoleRepository: Repository<ProposalActionRole>,

    @InjectRepository(ProposalActionPermission)
    private proposalActionPermissionRepository: Repository<ProposalActionPermission>
  ) {}

  async getProposalActionRole(proposalActionId: number) {
    return this.proposalActionRoleRepository.findOne({
      where: { proposalActionId },
    });
  }

  async getProposalActionPermissions(proposalActionRoleId: number) {
    return this.proposalActionPermissionRepository.find({
      where: { proposalActionRoleId },
    });
  }

  // TODO: Add logic to account for proposals to *change* group roles
  async saveProposalActionRole(
    proposalActionId: number,
    { id, selectedUserIds, ...role }: ProposalActionRoleInput
  ) {
    const members = selectedUserIds
      ? selectedUserIds.map((userId) => ({
          changeType: RoleMemberChangeType.Add,
          userId,
        }))
      : [];

    await this.proposalActionRoleRepository.save({
      ...role,
      roleId: id,
      proposalActionId,
      members,
    });
  }
}
