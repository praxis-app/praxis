import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { IsNull } from "typeorm";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Dataloaders } from "../dataloader/dataloader.types";
import { Group } from "../groups/models/group.model";
import { User } from "../users/models/user.model";
import { CreateRolePayload } from "./models/create-role.payload";
import { CreateServerRoleInput } from "./models/create-server-role.input";
import { DeleteRoleMemberInput } from "./models/delete-role-member.input";
import { DeleteRoleMemberPayload } from "./models/delete-role-member.payload";
import { Role } from "./models/role.model";
import { UpdateRoleInput } from "./models/update-role.input";
import { UpdateServerRolePayload } from "./models/update-server-role.payload";
import { Permission } from "./permissions/models/permission.model";
import { PermissionsService } from "./permissions/permissions.service";
import { RolesService } from "./roles.service";

@Resolver(() => Role)
export class RolesResolver {
  constructor(
    private permissionsService: PermissionsService,
    private rolesService: RolesService
  ) {}

  @Query(() => Role)
  async serverRole(@Args("id", { type: () => Int }) id: number) {
    return this.rolesService.getRole({ id, groupId: IsNull() });
  }

  @Query(() => [Role])
  async serverRoles() {
    return this.rolesService.getServerRoles();
  }

  @ResolveField(() => Group)
  async group(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { groupId }: Role
  ) {
    return groupId ? loaders.groupsLoader.load(groupId) : null;
  }

  @ResolveField(() => [Permission])
  async permissions(@Parent() { id }: Role) {
    return this.permissionsService.getPermissions({ roleId: id });
  }

  @ResolveField(() => [User])
  async members(@Parent() { id }: Role) {
    return this.rolesService.getRoleMembers(id);
  }

  @ResolveField(() => Int)
  async memberCount(
    @Parent() { id }: Role,
    @Context() { loaders }: { loaders: Dataloaders }
  ) {
    return loaders.roleMemberCountLoader.load(id);
  }

  @ResolveField(() => [User])
  async availableUsersToAdd(@Parent() { id }: Role) {
    return this.rolesService.getAvailableUsersToAdd(id);
  }

  @Mutation(() => CreateRolePayload)
  async createServerRole(@Args("roleData") roleData: CreateServerRoleInput) {
    return this.rolesService.createRole(roleData);
  }

  @Mutation(() => UpdateServerRolePayload)
  async updateServerRole(
    @Args("roleData") roleData: UpdateRoleInput,
    @CurrentUser() user: User
  ) {
    return this.rolesService.updateRole(roleData, user);
  }

  @Mutation(() => Boolean)
  async deleteServerRole(@Args("id", { type: () => Int }) id: number) {
    return this.rolesService.deleteRole(id);
  }

  @Mutation(() => DeleteRoleMemberPayload)
  async deleteServerRoleMember(
    @Args("roleMemberData") { roleId, userId }: DeleteRoleMemberInput,
    @CurrentUser() user: User
  ) {
    return this.rolesService.deleteRoleMember(roleId, userId, user);
  }
}
