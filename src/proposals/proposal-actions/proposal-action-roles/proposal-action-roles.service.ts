import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProposalActionPermission } from "./models/proposal-action-permission.model";
import { ProposalActionRoleInput } from "./models/proposal-action-role-input";
import { ProposalActionRoleMember } from "./models/proposal-action-role-member.model";
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
    private proposalActionPermissionRepository: Repository<ProposalActionPermission>,

    @InjectRepository(ProposalActionRoleMember)
    private proposalActionRoleMemberRepository: Repository<ProposalActionRoleMember>
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

  async getProposalActionRoleMembers(proposalActionRoleId: number) {
    return this.proposalActionRoleMemberRepository.find({
      where: { proposalActionRoleId },
    });
  }

  async createProposalActionRole(
    proposalActionId: number,
    { id, ...role }: ProposalActionRoleInput
  ) {
    await this.proposalActionRoleRepository.save({
      ...role,
      roleId: id,
      proposalActionId,
    });
  }

  async updateProposalActionRole(
    id: number,
    data: Partial<ProposalActionRole>
  ) {
    await this.proposalActionRoleRepository.update(id, data);
  }
}
