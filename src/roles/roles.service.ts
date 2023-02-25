import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserInputError } from "apollo-server-express";
import { FindOptionsWhere, In, IsNull, Not, Repository } from "typeorm";
import { User } from "../users/models/user.model";
import { UsersService } from "../users/users.service";
import { CreateRoleInput } from "./models/create-role.input";
import { Role } from "./models/role.model";
import { UpdateRoleInput } from "./models/update-role.input";
import { initServerPermissions } from "./permissions/permissions.utils";
import { RoleMember } from "./role-members/models/role-member.model";
import { ADMIN_ROLE_NAME, DEFAULT_ROLE_COLOR } from "./roles.constants";

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @InjectRepository(RoleMember)
    private roleMemberRepository: Repository<RoleMember>,

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

  async getAvailableUsersToAdd(id: number) {
    const role = await this.getRole(id, ["members"]);
    if (!role?.members) {
      return [];
    }

    const userIds = role.members.reduce<number[]>((result, { userId }) => {
      result.push(userId);
      return result;
    }, []);

    return this.usersService.getUsers({
      id: Not(In(userIds)),
    });
  }

  async initializeServerAdminRole(userId: number) {
    const permissions = initServerPermissions(true);
    const members = [{ userId }];

    await this.roleRepository.save({
      name: ADMIN_ROLE_NAME,
      color: DEFAULT_ROLE_COLOR,
      permissions,
      members,
    });
  }

  async createRole(roleData: CreateRoleInput) {
    const permissions = initServerPermissions();
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
    user: User
  ) {
    const roleWithRelations = await this.getRole(id, [
      "permissions",
      "members",
    ]);
    if (!roleWithRelations?.permissions || !roleWithRelations.members) {
      throw new UserInputError("Could not update role");
    }

    const permissionsInputMap = permissions.reduce<Record<number, boolean>>(
      (result, { id, enabled }) => {
        result[id] = enabled;
        return result;
      },
      {}
    );
    const newPermissions = roleWithRelations.permissions.map((permission) => {
      const enabled = permissionsInputMap[permission.id];
      if (enabled === undefined) {
        return permission;
      }
      return {
        ...permission,
        enabled,
      };
    });
    const newMembers = this.roleMemberRepository.create(
      selectedUserIds.map((userId) => ({
        roleId: roleWithRelations.id,
        userId,
      }))
    );

    const role = await this.roleRepository.save({
      ...roleWithRelations,
      ...roleData,
      members: [...roleWithRelations.members, ...newMembers],
      permissions: newPermissions,
    });
    return { role, me: user };
  }

  async deleteRole(id: number) {
    await this.roleRepository.delete(id);
    return true;
  }
}
