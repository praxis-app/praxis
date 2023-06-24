import {
  Args,
  Context,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { IsNull, Not } from "typeorm";
import { Dataloaders } from "../../dataloader/dataloader.types";
import { Permission } from "../../roles/permissions/models/permission.model";
import { User } from "../../users/models/user.model";
import { Group } from "../models/group.model";
import { GroupRolesService } from "./group-roles.service";
import { GroupRole } from "./models/group-role.model";

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

  @ResolveField(() => [Permission])
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
    return loaders.roleMemberCountLoader.load(id);
  }

  @ResolveField(() => [User])
  async availableUsersToAdd(@Parent() { id }: GroupRole) {
    return this.groupRolesService.getAvailableUsersToAdd(id);
  }
}
