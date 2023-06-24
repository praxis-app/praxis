import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserInputError } from "apollo-server-express";
import { DeepPartial, FindOptionsWhere, In, Not, Repository } from "typeorm";
import { User } from "../users/models/user.model";
import { UsersService } from "../users/users.service";
import { ServerRolePermission } from "./models/server-role-permission.model";
import { ServerRole } from "./models/server-role.model";
import { UpdateServerRoleInput } from "./models/update-server-role.input";
import { ADMIN_ROLE_NAME, DEFAULT_ROLE_COLOR } from "./server-roles.constants";

type ServerRoleWithMemberCount = ServerRole & { memberCount: number };

@Injectable()
export class ServerRolesService {
  constructor(
    @InjectRepository(ServerRole)
    private serverRoleRepository: Repository<ServerRole>,

    @InjectRepository(ServerRolePermission)
    private serverRolePermissionRepository: Repository<ServerRolePermission>,

    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService
  ) {}

  async getServerRole(
    where?: FindOptionsWhere<ServerRole>,
    relations?: string[]
  ) {
    return this.serverRoleRepository.findOneOrFail({ where, relations });
  }

  async getServerRoles(where?: FindOptionsWhere<ServerRole>) {
    return this.serverRoleRepository.find({
      where,
      order: { updatedAt: "DESC" },
    });
  }

  async getServerRoleMembers(id: number) {
    const { members } = await this.getServerRole({ id }, ["members"]);
    return members;
  }

  async getAvailableUsersToAdd(id: number) {
    const role = await this.getServerRole({ id }, ["members"]);
    const userIds = role.members.map(({ id }) => id);
    return this.usersService.getUsers({
      id: Not(In(userIds)),
    });
  }

  async getServerRoleMemberCountByBatch(roleIds: number[]) {
    const roles = (await this.serverRoleRepository
      .createQueryBuilder("role")
      .leftJoinAndSelect("role.members", "roleMember")
      .loadRelationCountAndMap("role.memberCount", "role.members")
      .select(["role.id"])
      .whereInIds(roleIds)
      .getMany()) as ServerRoleWithMemberCount[];

    return roleIds.map((id) => {
      const role = roles.find((role: ServerRole) => role.id === id);
      if (!role) {
        return new Error(`Could not load role member count: ${id}`);
      }
      return role.memberCount;
    });
  }

  async initAdminServerRole(userId: number, groupId?: number) {
    // TODO: Add logic for creating permissions
    await this.serverRoleRepository.save({
      name: ADMIN_ROLE_NAME,
      color: DEFAULT_ROLE_COLOR,
      members: [{ id: userId }],
      permissions: {},
      groupId,
    });
  }

  async createServerRole(
    roleData: DeepPartial<ServerRole>,
    fromProposalAction = false
  ) {
    if (fromProposalAction) {
      return this.serverRoleRepository.save(roleData);
    }

    // TODO: Add logic for creating permissions
    const role = await this.serverRoleRepository.save(roleData);

    return { role };
  }

  async updateServerRole(
    {
      id,
      selectedUserIds = [],
      permissions,
      ...roleData
    }: UpdateServerRoleInput,
    me?: User
  ) {
    const roleWithRelations = await this.getServerRole({ id }, ["members"]);
    const newMembers = await this.usersService.getUsers({
      id: In(selectedUserIds),
    });
    const role = await this.serverRoleRepository.save({
      ...roleWithRelations,
      ...roleData,
      members: [...roleWithRelations.members, ...newMembers],
      permissions,
    });
    return { role, me };
  }

  async deleteServerRole(id: number) {
    await this.serverRoleRepository.delete(id);
    return true;
  }

  async createServerRoleMember(id: number, userId: number) {
    const user = await this.usersService.getUser({ id: userId });
    const role = await this.getServerRole({ id }, ["members"]);
    if (!user) {
      throw new UserInputError("User not found");
    }
    await this.serverRoleRepository.save({
      ...role,
      members: [...role.members, user],
    });
    return user;
  }

  async deleteServerRoleMember(id: number, userId: number, me: User) {
    const role = await this.getServerRole({ id }, ["members"]);
    role.members = role.members.filter((member) => member.id !== userId);
    await this.serverRoleRepository.save(role);

    return { role, me };
  }

  async deleteServerRoleMembers(id: number, userIds: number[]) {
    const role = await this.getServerRole({ id }, ["members"]);

    role.members = role.members.filter(
      (member) => !userIds.some((id) => member.id === id)
    );
    await this.serverRoleRepository.save(role);
  }

  async getServerRolePermission(roleId: number) {
    return this.serverRolePermissionRepository.findOne({
      where: { roleId },
    });
  }
}
