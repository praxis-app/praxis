import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, In, Not, Repository } from 'typeorm';
import {
  ADMIN_ROLE_NAME,
  DEFAULT_ROLE_COLOR,
} from '../../server-roles/server-roles.constants';
import { User } from '../../users/models/user.model';
import {
  cleanGroupPermissions,
  initGroupRolePermissions,
} from './group-role.utils';
import { GroupRolePermission } from './models/group-role-permission.model';
import { GroupRole } from './models/group-role.model';
import { UpdateGroupRoleInput } from './models/update-group-role.input';

@Injectable()
export class GroupRolesService {
  constructor(
    @InjectRepository(GroupRole)
    private groupRoleRepository: Repository<GroupRole>,

    @InjectRepository(GroupRolePermission)
    private groupRolePermissionRepository: Repository<GroupRolePermission>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getGroupRole(
    where?: FindOptionsWhere<GroupRole>,
    relations?: string[],
  ) {
    return this.groupRoleRepository.findOneOrFail({ where, relations });
  }

  async getGroupRoles(where?: FindOptionsWhere<GroupRole>) {
    return this.groupRoleRepository.find({
      order: { updatedAt: 'DESC' },
      where,
    });
  }

  async getGroupRoleMembers(id: number) {
    const { members } = await this.getGroupRole({ id }, ['members']);
    return members;
  }

  async getAvailableUsersToAdd(id: number) {
    const role = await this.getGroupRole({ id }, ['members', 'group.members']);
    const userIds = role.members.map(({ id }) => id);

    if (role.group) {
      return role.group.members.filter(
        (member) => !userIds.some((userId) => userId === member.id),
      );
    }
    return this.userRepository.find({
      where: { id: Not(In(userIds)) },
    });
  }

  // TODO: Rename as `createGroupAdminRole`
  async initGroupAdminRole(userId: number, groupId: number) {
    const permission = initGroupRolePermissions(true);
    await this.groupRoleRepository.save({
      name: ADMIN_ROLE_NAME,
      color: DEFAULT_ROLE_COLOR,
      members: [{ id: userId }],
      permission,
      groupId,
    });
  }

  async createGroupRole(
    roleData: DeepPartial<GroupRole>,
    fromProposalAction = false,
  ) {
    if (fromProposalAction) {
      const permission = cleanGroupPermissions(roleData.permission);
      return this.groupRoleRepository.save({ ...roleData, permission });
    }
    const permission = initGroupRolePermissions();
    const groupRole = await this.groupRoleRepository.save({
      ...roleData,
      permission,
    });
    return { groupRole };
  }

  async updateGroupRole({
    id,
    selectedUserIds = [],
    permissions,
    ...roleData
  }: UpdateGroupRoleInput) {
    const roleWithRelations = await this.getGroupRole({ id }, [
      'members',
      'permission',
    ]);
    const newMembers = await this.userRepository.find({
      where: { id: In(selectedUserIds) },
    });
    const cleanedPermissions = cleanGroupPermissions(permissions);

    const groupRole = await this.groupRoleRepository.save({
      ...roleWithRelations,
      ...roleData,
      members: [...roleWithRelations.members, ...newMembers],
      permission: { ...roleWithRelations.permission, ...cleanedPermissions },
    });
    return { groupRole };
  }

  async deleteGroupRole(id: number) {
    await this.groupRoleRepository.delete(id);
    return true;
  }

  async deleteGroupRoleMember(id: number, userId: number) {
    const groupRole = await this.getGroupRole({ id }, ['members']);
    groupRole.members = groupRole.members.filter(
      (member) => member.id !== userId,
    );
    await this.groupRoleRepository.save(groupRole);

    return { groupRole };
  }

  async deleteGroupRoleMembers(id: number, userIds: number[]) {
    const role = await this.getGroupRole({ id }, ['members']);

    role.members = role.members.filter(
      (member) => !userIds.some((id) => member.id === id),
    );
    await this.groupRoleRepository.save(role);
  }

  async getGroupRolePermission(groupRoleId: number) {
    return this.groupRolePermissionRepository.findOne({
      where: { groupRoleId },
    });
  }
}
