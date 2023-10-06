import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Dataloaders } from '../dataloader/dataloader.types';
import { User } from '../users/models/user.model';
import { CreateServerRoleInput } from './models/create-server-role.input';
import { CreateServerRolePayload } from './models/create-server-role.payload';
import { DeleteServerRoleMemberInput } from './models/delete-server-role-member.input';
import { DeleteServerRoleMemberPayload } from './models/delete-server-role-member.payload';
import { ServerRolePermission } from './models/server-role-permission.model';
import { ServerRole } from './models/server-role.model';
import { UpdateServerRoleInput } from './models/update-server-role.input';
import { UpdateServerRolePayload } from './models/update-server-role.payload';
import { ServerRolesService } from './server-roles.service';

@Resolver(() => ServerRole)
export class ServerRolesResolver {
  constructor(private serverRolesService: ServerRolesService) {}

  @Query(() => ServerRole)
  async serverRole(@Args('id', { type: () => Int }) id: number) {
    return this.serverRolesService.getServerRole({ id });
  }

  @Query(() => [ServerRole])
  async serverRoles() {
    return this.serverRolesService.getServerRoles();
  }

  @ResolveField(() => ServerRolePermission)
  async permissions(@Parent() { id }: ServerRole) {
    return this.serverRolesService.getServerRolePermission(id);
  }

  @ResolveField(() => [User])
  async members(@Parent() { id }: ServerRole) {
    return this.serverRolesService.getServerRoleMembers(id);
  }

  @ResolveField(() => Int)
  async memberCount(
    @Parent() { id }: ServerRole,
    @Context() { loaders }: { loaders: Dataloaders },
  ) {
    return loaders.serverRoleMemberCountLoader.load(id);
  }

  @ResolveField(() => [User])
  async availableUsersToAdd(@Parent() { id }: ServerRole) {
    return this.serverRolesService.getAvailableUsersToAdd(id);
  }

  @Mutation(() => CreateServerRolePayload)
  async createServerRole(
    @Args('serverRoleData') serverRoleData: CreateServerRoleInput,
  ) {
    return this.serverRolesService.createServerRole(serverRoleData);
  }

  @Mutation(() => UpdateServerRolePayload)
  async updateServerRole(
    @Args('serverRoleData') serverRoleData: UpdateServerRoleInput,
    @CurrentUser() user: User,
  ) {
    return this.serverRolesService.updateServerRole(serverRoleData, user);
  }

  @Mutation(() => Boolean)
  async deleteServerRole(@Args('id', { type: () => Int }) id: number) {
    return this.serverRolesService.deleteServerRole(id);
  }

  @Mutation(() => DeleteServerRoleMemberPayload)
  async deleteServerRoleMember(
    @Args('serverRoleMemberData')
    { serverRoleId, userId }: DeleteServerRoleMemberInput,
    @CurrentUser() user: User,
  ) {
    return this.serverRolesService.deleteServerRoleMember(
      serverRoleId,
      userId,
      user,
    );
  }
}
