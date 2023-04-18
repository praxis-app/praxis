import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserInputError } from "apollo-server-express";
import { FindOptionsWhere, In, IsNull, Not, Repository } from "typeorm";
import { User } from "../users/models/user.model";
import { UsersService } from "../users/users.service";
import { CreateRoleInput } from "./models/create-role.input";
import { Role } from "./models/role.model";
import { UpdateRoleInput } from "./models/update-role.input";
import {
  GroupPermission,
  ServerPermission,
} from "./permissions/permissions.constants";
import { initPermissions } from "./permissions/permissions.utils";
import { ADMIN_ROLE_NAME, DEFAULT_ROLE_COLOR } from "./roles.constants";

type RoleWithMemberCount = Role & { memberCount: number };

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService
  ) {}

  async getRole(id: number, relations?: string[]) {
    return this.roleRepository.findOne({ where: { id }, relations });
  }

  async getRoles(where?: FindOptionsWhere<Role>) {
    return this.roleRepository.find({ where, order: { updatedAt: "DESC" } });
  }

  async getServerRoles() {
    return this.getRoles({ groupId: IsNull() });
  }

  async getRoleMembers(roleId: number) {
    const role = await this.getRole(roleId, ["members"]);
    if (!role) {
      throw new UserInputError("Role not found");
    }
    return role.members;
  }

  async getAvailableUsersToAdd(id: number) {
    const role = await this.getRole(id, ["members", "group.members"]);
    if (!role?.members) {
      return [];
    }

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

  async initAdminRole(userId: number, groupId?: number) {
    const permissions = initPermissions(
      groupId ? GroupPermission : ServerPermission,
      true
    );
    await this.roleRepository.save({
      name: ADMIN_ROLE_NAME,
      color: DEFAULT_ROLE_COLOR,
      members: [{ id: userId }],
      permissions,
      groupId,
    });
  }

  async createRole(roleData: CreateRoleInput) {
    const permissions = initPermissions(
      roleData.groupId ? GroupPermission : ServerPermission
    );
    const role = await this.roleRepository.save({ ...roleData, permissions });
    return { role };
  }

  async updateRole(
    {
      id,
      selectedUserIds = [],
      permissions = [],
      ...roleData
    }: UpdateRoleInput,
    me: User
  ) {
    const roleWithRelations = await this.getRole(id, [
      "permissions",
      "members",
    ]);
    if (!roleWithRelations?.permissions || !roleWithRelations.members) {
      throw new UserInputError("Could not update role");
    }

    const permissionsInputMap = permissions.reduce<Record<string, boolean>>(
      (result, { name, enabled }) => {
        result[name] = enabled;
        return result;
      },
      {}
    );
    const newPermissions = roleWithRelations.permissions.map((permission) => {
      const enabled = permissionsInputMap[permission.name];
      if (enabled === undefined) {
        return permission;
      }
      return {
        ...permission,
        enabled,
      };
    });
    const newMembers = await this.usersService.getUsers({
      id: In(selectedUserIds),
    });

    const role = await this.roleRepository.save({
      ...roleWithRelations,
      ...roleData,
      members: [...roleWithRelations.members, ...newMembers],
      permissions: newPermissions,
    });
    return { role, me };
  }

  async deleteRole(id: number) {
    await this.roleRepository.delete(id);
    return true;
  }

  async createRoleMember(roleId: number, userId: number) {
    const user = await this.usersService.getUser({ id: userId });
    const role = await this.getRole(roleId, ["members"]);
    if (!user || !role) {
      throw new UserInputError("User or role not found");
    }
    await this.roleRepository.save({
      ...role,
      members: [...role.members, user],
    });
    return user;
  }

  async deleteRoleMember(id: number, userId: number, me: User) {
    const user = await this.usersService.getUser({ id: userId });
    const role = await this.getRole(id, ["members"]);
    if (!user || !role) {
      throw new UserInputError("User or role not found");
    }
    role.members = role.members.filter((member) => member.id !== userId);
    await this.roleRepository.save(role);

    return { role, me };
  }
}
