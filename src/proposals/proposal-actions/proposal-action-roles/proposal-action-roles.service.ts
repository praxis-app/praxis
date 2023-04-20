import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
    private proposalActionRoleRepository: Repository<ProposalActionRole>
  ) {}

  async getProposalActionRole(proposalActionId: number) {
    return this.proposalActionRoleRepository.findOne({
      where: { proposalActionId },
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
