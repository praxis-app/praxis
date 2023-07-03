// TODO: Remove async keyword from resolver functions

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
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { Dataloaders } from "../../dataloader/dataloader.types";
import { User } from "../../users/models/user.model";
import { Group } from "../models/group.model";
import { GroupMemberRequestsService } from "./group-member-requests.service";
import { ApproveMemberRequestPayload } from "./models/approve-group-member-request.payload";
import { CreateMemberRequestPayload } from "./models/create-group-member-request.payload";
import { MemberRequest } from "./models/group-member-request.model";

@Resolver(() => MemberRequest)
export class GroupMemberRequestsResolver {
  constructor(private groupMemberRequestsService: GroupMemberRequestsService) {}

  @Query(() => MemberRequest, { nullable: true })
  async memberRequest(
    @Args("groupId", { type: () => Int }) groupId: number,
    @CurrentUser() { id }: User
  ) {
    return this.groupMemberRequestsService.getMemberRequest({
      user: { id },
      groupId,
    });
  }

  @ResolveField(() => Group)
  async group(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { groupId }: MemberRequest
  ) {
    return loaders.groupsLoader.load(groupId);
  }

  @ResolveField(() => User)
  async user(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { userId }: MemberRequest
  ) {
    return loaders.usersLoader.load(userId);
  }

  @Mutation(() => CreateMemberRequestPayload)
  async createMemberRequest(
    @Args("groupId", { type: () => Int }) groupId: number,
    @CurrentUser() { id }: User
  ) {
    return this.groupMemberRequestsService.createMemberRequest(groupId, id);
  }

  @Mutation(() => ApproveMemberRequestPayload)
  async approveMemberRequest(@Args("id", { type: () => Int }) id: number) {
    return this.groupMemberRequestsService.approveMemberRequest(id);
  }

  @Mutation(() => Boolean)
  async cancelMemberRequest(@Args("id", { type: () => Int }) id: number) {
    return this.groupMemberRequestsService.cancelMemberRequest(id);
  }

  @Mutation(() => Boolean)
  async denyMemberRequest(@Args("id", { type: () => Int }) id: number) {
    return this.groupMemberRequestsService.denyMemberRequest(id);
  }
}
