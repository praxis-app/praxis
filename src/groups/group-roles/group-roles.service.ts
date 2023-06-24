import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserInputError } from "apollo-server-express";
import { DeepPartial, FindOptionsWhere, In, Not, Repository } from "typeorm";
import {
  ADMIN_ROLE_NAME,
  DEFAULT_ROLE_COLOR,
} from "../../server-roles/server-roles.constants";
import { User } from "../../users/models/user.model";
import { UsersService } from "../../users/users.service";
import { initGroupRolePermissions } from "./group-role.utils";
import { GroupRolePermission } from "./models/group-role-permission.model";
import { GroupRole } from "./models/group-role.model";
import { UpdateGroupRoleInput } from "./models/update-group-role.input";

type GroupRoleWithMemberCount = GroupRole & { memberCount: number };

@Injectable()
export class GroupRolesService {
  constructor(
    @InjectRepository(GroupRole)
    private groupRoleRepository: Repository<GroupRole>,

    @InjectRepository(GroupRolePermission)
    private groupRolePermissionRepository: Repository<GroupRolePermission>,

    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService
  ) {}

  async getGroupRole(
    where?: FindOptionsWhere<GroupRole>,
    relations?: string[]
  ) {
    return this.groupRoleRepository.findOneOrFail({ where, relations });
  }

  async getGroupRoles(where?: FindOptionsWhere<GroupRole>) {
    return this.groupRoleRepository.find({
      where,
      order: { updatedAt: "DESC" },
    });
  }

  async getGroupRoleMembers(id: number) {
    const { members } = await this.getGroupRole({ id }, ["members"]);
    return members;
  }

  async getAvailableUsersToAdd(id: number) {
    const role = await this.getGroupRole({ id }, ["members", "group.members"]);
    const userIds = role.members.map(({ id }) => id);

    if (role.group) {
      return role.group.members.filter(
        (member) => !userIds.some((userId) => userId === member.id)
      );
    }
    return this.usersService.getUsers({
      id: Not(In(userIds)),
    });
  }

  async getGroupRoleMemberCountByBatch(roleIds: number[]) {
    const roles = (await this.groupRoleRepository
      .createQueryBuilder("role")
      .leftJoinAndSelect("role.members", "roleMember")
      .loadRelationCountAndMap("role.memberCount", "role.members")
      .select(["role.id"])
      .whereInIds(roleIds)
      .getMany()) as GroupRoleWithMemberCount[];

    return roleIds.map((id) => {
      const role = roles.find((role: GroupRole) => role.id === id);
      if (!role) {
        return new Error(`Could not load role member count: ${id}`);
      }
      return role.memberCount;
    });
  }

  async initAdminRole(userId: number, groupId: number) {
    const permissions = initGroupRolePermissions(true);
    await this.groupRoleRepository.save({
      name: ADMIN_ROLE_NAME,
      color: DEFAULT_ROLE_COLOR,
      members: [{ id: userId }],
      permissions,
      groupId,
    });
  }

  async createGroupRole(
    roleData: DeepPartial<GroupRole>,
    fromProposalAction = false
  ) {
    if (fromProposalAction) {
      return this.groupRoleRepository.save(roleData);
    }
    const permissions = initGroupRolePermissions();
    const role = await this.groupRoleRepository.save({
      ...roleData,
      permissions,
    });
    return { role };
  }

  async updateGroupRole(
    {
      id,
      selectedUserIds = [],
      permission: permissions,
      ...roleData
    }: UpdateGroupRoleInput,
    me?: User
  ) {
    const roleWithRelations = await this.getGroupRole({ id }, ["members"]);
    const newMembers = await this.usersService.getUsers({
      id: In(selectedUserIds),
    });
    const role = await this.groupRoleRepository.save({
      ...roleWithRelations,
      ...roleData,
      members: [...roleWithRelations.members, ...newMembers],
      permissions,
    });
    return { role, me };
  }

  async deleteGroupRole(id: number) {
    await this.groupRoleRepository.delete(id);
    return true;
  }

  async createGroupRoleMember(id: number, userId: number) {
    const user = await this.usersService.getUser({ id: userId });
    const role = await this.getGroupRole({ id }, ["members"]);
    if (!user) {
      throw new UserInputError("User not found");
    }
    await this.groupRoleRepository.save({
      ...role,
      members: [...role.members, user],
    });
    return user;
  }

  async deleteGroupRoleMember(id: number, userId: number, me: User) {
    const role = await this.getGroupRole({ id }, ["members"]);
    role.members = role.members.filter((member) => member.id !== userId);
    await this.groupRoleRepository.save(role);

    return { role, me };
  }

  async deleteGroupRoleMembers(id: number, userIds: number[]) {
    const role = await this.getGroupRole({ id }, ["members"]);

    role.members = role.members.filter(
      (member) => !userIds.some((id) => member.id === id)
    );
    await this.groupRoleRepository.save(role);
  }

  async getGroupRolePermission(groupRoleId: number) {
    return this.groupRolePermissionRepository.findOne({
      where: { groupRoleId },
    });
  }
}
