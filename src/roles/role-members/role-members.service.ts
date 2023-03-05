import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserInputError } from "apollo-server-express";
import { FindManyOptions, Repository } from "typeorm";
import { Role } from "../models/role.model";
import { DeleteRoleMemberPayload } from "./models/delete-role-member.payload";
import { RoleMember } from "./models/role-member.model";

type RoleWithMemberCount = Role & { memberCount: number };

@Injectable()
export class RoleMembersService {
  constructor(
    @InjectRepository(RoleMember)
    private repository: Repository<RoleMember>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>
  ) {}

  async getRoleMember(id: number, relations?: string[]) {
    return this.repository.findOne({ where: { id }, relations });
  }

  async getRoleMembers(options?: FindManyOptions<RoleMember>) {
    return this.repository.find(options);
  }

  async getRoleMemberCountByBatch(roleIds: number[]) {
    const roles = (await this.roleRepository
      .createQueryBuilder("role")
      .leftJoinAndSelect("role.members", "roleMember")
      .loadRelationCountAndMap("role.memberCount", "role.members")
      .select(["role.id"])
      .whereInIds(roleIds)
      .getMany()) as RoleWithMemberCount[];

    return roleIds.map((id) => {
      const role = roles.find((role: Role) => role.id === id);
      if (!role) {
        return new Error(`Could not load role member count: ${id}`);
      }
      return role.memberCount;
    });
  }

  async createRoleMember(roleId: number, userId: number) {
    return this.repository.save({ roleId, userId });
  }

  async deleteRoleMember(id: number): Promise<DeleteRoleMemberPayload> {
    const roleMember = await this.getRoleMember(id, ["role"]);
    if (!roleMember?.role) {
      throw new UserInputError("Role not found for role member");
    }
    await this.repository.delete(id);
    return { role: roleMember.role };
  }
}
