import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, In, Not, Repository } from 'typeorm';
import { ChatService } from '../chat/chat.service';
import { sanitizeText } from '../common/common.utils';
import { User } from '../users/models/user.model';
import { ServerRolePermission } from './models/server-role-permission.model';
import { ServerRole } from './models/server-role.model';
import { UpdateServerRoleInput } from './models/update-server-role.input';
import { ADMIN_ROLE_NAME, DEFAULT_ROLE_COLOR } from './server-roles.constants';
import { initServerRolePermissions } from './server-roles.utils';

@Injectable()
export class ServerRolesService {
  constructor(
    @InjectRepository(ServerRole)
    private serverRoleRepository: Repository<ServerRole>,

    @InjectRepository(ServerRolePermission)
    private serverRolePermissionRepository: Repository<ServerRolePermission>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private chatService: ChatService,
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

  async getServerRoleMembers(roleId?: number, permissionName?: string) {
    return this.userRepository.find({
      where: {
        serverRoles: {
          id: roleId,
          permission: permissionName ? { [permissionName]: true } : undefined,
        },
      },
    });
  }

  async getAvailableUsersToAdd(id: number) {
    const role = await this.getServerRole({ id }, ['members']);
    const userIds = role.members.map(({ id }) => id);

    return this.userRepository.find({
      where: { id: Not(In(userIds)), verified: true },
    });
  }

  async createAdminServerRole(userId: number) {
    const permission = initServerRolePermissions(true);
    await this.serverRoleRepository.save({
      name: ADMIN_ROLE_NAME,
      color: DEFAULT_ROLE_COLOR,
      members: [{ id: userId }],
      permission,
    });
  }

  async createServerRole(
    { name, ...roleData }: DeepPartial<ServerRole>,
    fromProposalAction = false,
  ) {
    const sanitizedName = sanitizeText(name);
    if (!sanitizedName) {
      throw new Error('Role name is required');
    }
    if (sanitizedName.length > 25) {
      throw new Error('Role name cannot be longer than 25 characters');
    }
    if (fromProposalAction) {
      return this.serverRoleRepository.save(roleData);
    }
    const permission = initServerRolePermissions();
    const serverRole = await this.serverRoleRepository.save({
      name: sanitizedName,
      permission,
      ...roleData,
    });
    return { serverRole };
  }

  async updateServerRole(
    {
      id,
      name,
      selectedUserIds = [],
      permissions,
      ...roleData
    }: UpdateServerRoleInput,
    me: User,
  ) {
    const sanitizedName = sanitizeText(name);
    if (typeof name === 'string' && !sanitizedName) {
      throw new Error('Role name is required');
    }
    if (name && sanitizedName.length > 25) {
      throw new Error('Role name cannot be longer than 25 characters');
    }
    const roleWithRelations = await this.getServerRole({ id }, [
      'members',
      'permission',
    ]);
    const newMembers = await this.userRepository.find({
      where: { id: In(selectedUserIds), verified: true },
    });

    await this.serverRoleRepository.save({
      ...roleWithRelations,
      ...roleData,
      name: sanitizedName || undefined,
      members: [...roleWithRelations.members, ...newMembers],
      permission: { ...roleWithRelations.permission, ...permissions },
    });
    await this.chatService.syncVibeChatMembersWithRoles();

    const serverRole = await this.getServerRole({ id });
    return { serverRole, me };
  }

  async deleteServerRole(id: number) {
    await this.serverRoleRepository.delete(id);
    await this.chatService.syncVibeChatMembersWithRoles();
    return true;
  }

  async deleteServerRoleMember(id: number, userId: number, me: User) {
    const serverRole = await this.getServerRole({ id }, ['members']);
    serverRole.members = serverRole.members.filter(
      (member) => member.id !== userId,
    );
    await this.serverRoleRepository.save(serverRole);
    await this.chatService.syncVibeChatMembersWithRoles();

    return { serverRole, me };
  }

  async getServerRolePermission(serverRoleId: number) {
    return this.serverRolePermissionRepository.findOne({
      where: { serverRoleId },
    });
  }
}
