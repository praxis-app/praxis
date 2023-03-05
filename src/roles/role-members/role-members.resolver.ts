import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Dataloaders } from "../../dataloader/dataloader.service";
import { User } from "../../users/models/user.model";
import { Role } from "../models/role.model";
import { RolesService } from "../roles.service";
import { DeleteRoleMemberPayload } from "./models/delete-role-member.payload";
import { RoleMember } from "./models/role-member.model";
import { RoleMembersService } from "./role-members.service";

@Resolver(() => RoleMember)
export class RoleMembersResolver {
  constructor(
    private roleMembersService: RoleMembersService,
    private rolesService: RolesService
  ) {}

  @ResolveField(() => Role)
  async role(@Parent() { roleId }: RoleMember) {
    return this.rolesService.getRole(roleId);
  }

  @ResolveField(() => User)
  async user(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { userId }: RoleMember
  ) {
    return loaders.usersLoader.load(userId);
  }

  @Mutation(() => DeleteRoleMemberPayload)
  async deleteRoleMember(@Args("id", { type: () => Int }) id: number) {
    return this.roleMembersService.deleteRoleMember(id);
  }
}
