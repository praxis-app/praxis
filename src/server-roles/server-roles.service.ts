import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, In, Not, Repository } from 'typeorm';
import { User } from '../users/models/user.model';
import { ServerRolePermission } from './models/server-role-permission.model';
import { ServerRole } from './models/server-role.model';
import { UpdateServerRoleInput } from './models/update-server-role.input';
import { ADMIN_ROLE_NAME, DEFAULT_ROLE_COLOR } from './server-roles.constants';
import { initServerRolePermissions } from './server-roles.utils';

type ServerRoleWithMemberCount = ServerRole & { memberCount: number };

@Injectable()
export class ServerRolesService {
  constructor(
    @InjectRepository(ServerRole)
    private serverRoleRepository: Repository<ServerRole>,

    @InjectRepository(ServerRolePermission)
    private serverRolePermissionRepository: Repository<ServerRolePermission>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getServerRole(
    where?: FindOptionsWhere<ServerRole>,
    relations?: string[],
  ) {
    return this.serverRoleRepository.findOneOrFail({ where, relations });
  }

  async getServerRoles(where?: FindOptionsWhere<ServerRole>) {
    return this.serverRoleRepository.find({
      order: { updatedAt: 'DESC' },
      where,
    });
  }

  async getServerRoleMembers(id: number) {
    const { members } = await this.getServerRole({ id }, ['members']);
    return members;
  }

  async getAvailableUsersToAdd(id: number) {
    const role = await this.getServerRole({ id }, ['members']);
    const userIds = role.members.map(({ id }) => id);

    return this.userRepository.find({
      where: { id: Not(In(userIds)) },
    });
  }

  async getServerRoleMemberCountBatch(roleIds: number[]) {
    const roles = (await this.serverRoleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.members', 'roleMember')
      .loadRelationCountAndMap('role.memberCount', 'role.members')
      .select(['role.id'])
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

  async initAdminServerRole(userId: number) {
    const permission = initServerRolePermissions(true);
    await this.serverRoleRepository.save({
      name: ADMIN_ROLE_NAME,
      color: DEFAULT_ROLE_COLOR,
      members: [{ id: userId }],
      permission,
    });
  }

  async createServerRole(
    roleData: DeepPartial<ServerRole>,
    fromProposalAction = false,
  ) {
    if (fromProposalAction) {
      return this.serverRoleRepository.save(roleData);
    }
    const permission = initServerRolePermissions();
    const serverRole = await this.serverRoleRepository.save({
      ...roleData,
      permission,
    });
    return { serverRole };
  }

  async updateServerRole(
    {
      id,
      selectedUserIds = [],
      permissions,
      ...roleData
    }: UpdateServerRoleInput,
    me: User,
  ) {
    const roleWithRelations = await this.getServerRole({ id }, [
      'members',
      'permission',
    ]);
    const newMembers = await this.userRepository.find({
      where: { id: In(selectedUserIds) },
    });
    const serverRole = await this.serverRoleRepository.save({
      ...roleWithRelations,
      ...roleData,
      members: [...roleWithRelations.members, ...newMembers],
      permission: { ...roleWithRelations.permission, ...permissions },
    });
    return { serverRole, me };
  }

  async deleteServerRole(id: number) {
    await this.serverRoleRepository.delete(id);
    return true;
  }

  async deleteServerRoleMember(id: number, userId: number, me: User) {
    const serverRole = await this.getServerRole({ id }, ['members']);
    serverRole.members = serverRole.members.filter(
      (member) => member.id !== userId,
    );
    await this.serverRoleRepository.save(serverRole);

    return { serverRole, me };
  }

  async getServerRolePermission(serverRoleId: number) {
    return this.serverRolePermissionRepository.findOne({
      where: { serverRoleId },
    });
  }
}
