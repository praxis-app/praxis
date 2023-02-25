// TODO: Remove async keyword from resolver functions

import { UnauthorizedException } from "@nestjs/common";
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
import { Dataloaders } from "../../dataloader/dataloader.service";
import { User } from "../../users/models/user.model";
import { GroupMembersService } from "../group-members/group-members.service";
import { Group } from "../models/group.model";
import { MemberRequestsService } from "./member-requests.service";
import { ApproveMemberRequestPayload } from "./models/approve-member-request.payload";
import { CreateMemberRequestPayload } from "./models/create-member-request.payload";
import { MemberRequest } from "./models/member-request.model";

@Resolver(() => MemberRequest)
export class MemberRequestsResolver {
  constructor(
    private memberRequestsService: MemberRequestsService,
    private groupMembersService: GroupMembersService
  ) {}

  @Query(() => MemberRequest, { nullable: true })
  async memberRequest(
    @Args("groupId", { type: () => Int }) groupId: number,
    @CurrentUser() { id }: User
  ) {
    return this.memberRequestsService.getMemberRequest({
      user: { id },
      groupId,
    });
  }

  /**
   * TODO: Use RBAC with CASL to protect memberRequests
   * Manually checking for group membership is only intended to be temporary
   */
  @Query(() => [MemberRequest])
  async memberRequests(
    @Args("groupName", { type: () => String }) groupName: string,
    @CurrentUser() { id }: User
  ) {
    const member = await this.groupMembersService.getGroupMember({
      group: { name: groupName },
      user: { id },
    });
    if (!member) {
      throw new UnauthorizedException();
    }
    return this.memberRequestsService.getMemberRequests(groupName);
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
    return this.memberRequestsService.createMemberRequest(groupId, id);
  }

  @Mutation(() => ApproveMemberRequestPayload)
  async approveMemberRequest(@Args("id", { type: () => Int }) id: number) {
    return this.memberRequestsService.approveMemberRequest(id);
  }

  @Mutation(() => Boolean)
  async cancelMemberRequest(@Args("id", { type: () => Int }) id: number) {
    return this.memberRequestsService.cancelMemberRequest(id);
  }

  @Mutation(() => Boolean)
  async denyMemberRequest(@Args("id", { type: () => Int }) id: number) {
    return this.memberRequestsService.denyMemberRequest(id);
  }
}
