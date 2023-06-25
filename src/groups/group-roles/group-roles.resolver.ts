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
import { IsNull, Not } from "typeorm";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { Dataloaders } from "../../dataloader/dataloader.types";
import { DeleteGroupRoleMemberPayload } from "./models/delete-group-role-member.payload";
import { User } from "../../users/models/user.model";
import { Group } from "../models/group.model";
import { GroupRolesService } from "./group-roles.service";
import { CreateGroupRoleInput } from "./models/create-group-role.input";
import { CreateGroupRolePayload } from "./models/create-group-role.payload";
import { DeleteGroupRoleMemberInput } from "./models/delete-group-role-member.input";
import { GroupRolePermission } from "./models/group-role-permission.model";
import { GroupRole } from "./models/group-role.model";
import { UpdateGroupRoleInput } from "./models/update-group-role.input";
import { UpdateGroupRolePayload } from "./models/update-group-role.payload";

@Resolver(() => GroupRole)
export class GroupRolesResolver {
  constructor(private groupRolesService: GroupRolesService) {}

  @Query(() => GroupRole)
  async groupRole(@Args("id", { type: () => Int }) id: number) {
    return this.groupRolesService.getGroupRole({ id, groupId: Not(IsNull()) });
  }

  @Query(() => [GroupRole])
  async groupRoles() {
    return this.groupRolesService.getGroupRoles();
  }

  @ResolveField(() => Group)
  async group(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { groupId }: GroupRole
  ) {
    return groupId ? loaders.groupsLoader.load(groupId) : null;
  }

  @ResolveField(() => GroupRolePermission)
  async permissions(@Parent() { id }: GroupRole) {
    return this.groupRolesService.getGroupRolePermission(id);
  }

  @ResolveField(() => [User])
  async members(@Parent() { id }: GroupRole) {
    return this.groupRolesService.getGroupRoleMembers(id);
  }

  @ResolveField(() => Int)
  async memberCount(
    @Parent() { id }: GroupRole,
    @Context() { loaders }: { loaders: Dataloaders }
  ) {
    return loaders.groupRoleMemberCountLoader.load(id);
  }

  @ResolveField(() => [User])
  async availableUsersToAdd(@Parent() { id }: GroupRole) {
    return this.groupRolesService.getAvailableUsersToAdd(id);
  }

  @Mutation(() => CreateGroupRolePayload)
  async createGroupRole(@Args("roleData") roleData: CreateGroupRoleInput) {
    return this.groupRolesService.createGroupRole(roleData);
  }

  @Mutation(() => UpdateGroupRolePayload)
  async updateGroupRole(
    @Args("roleData") roleData: UpdateGroupRoleInput,
    @CurrentUser() user: User
  ) {
    return this.groupRolesService.updateGroupRole(roleData, user);
  }

  @Mutation(() => Boolean)
  async deleteGroupRole(@Args("id", { type: () => Int }) id: number) {
    return this.groupRolesService.deleteGroupRole(id);
  }

  @Mutation(() => DeleteGroupRoleMemberPayload)
  async deleteGroupRoleMember(
    @Args("roleMemberData") { roleId, userId }: DeleteGroupRoleMemberInput,
    @CurrentUser() user: User
  ) {
    return this.groupRolesService.deleteGroupRoleMember(roleId, userId, user);
  }
}
