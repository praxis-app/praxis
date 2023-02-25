import { Context, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { Dataloaders } from "../../dataloader/dataloader.service";
import { User } from "../../users/models/user.model";
import { Group } from "../models/group.model";
import { GroupMember } from "./models/group-member.model";

@Resolver(() => GroupMember)
export class GroupMembersResolver {
  @ResolveField(() => User)
  async user(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { userId }: GroupMember
  ) {
    return loaders.usersLoader.load(userId);
  }

  @ResolveField(() => Group)
  async group(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { groupId }: GroupMember
  ) {
    return loaders.groupsLoader.load(groupId);
  }
}
