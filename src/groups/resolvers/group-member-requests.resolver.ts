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
} from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Dataloaders } from '../../dataloader/dataloader.types';
import { User } from '../../users/models/user.model';
import { GroupsService } from '../groups.service';
import { ApproveGroupMemberRequestPayload } from '../models/approve-group-member-request.payload';
import { CreateGroupMemberRequestPayload } from '../models/create-group-member-request.payload';
import { GroupMemberRequest } from '../models/group-member-request.model';
import { Group } from '../models/group.model';

@Resolver(() => GroupMemberRequest)
export class GroupMemberRequestsResolver {
  constructor(private groupsService: GroupsService) {}

  @Query(() => GroupMemberRequest, { nullable: true })
  async groupMemberRequest(
    @Args('groupId', { type: () => Int }) groupId: number,
    @CurrentUser() { id }: User,
  ) {
    return this.groupsService.getGroupMemberRequest({
      user: { id },
      groupId,
    });
  }

  @ResolveField(() => Group)
  async group(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { groupId }: GroupMemberRequest,
  ) {
    return loaders.groupsLoader.load(groupId);
  }

  @ResolveField(() => User)
  async user(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { userId }: GroupMemberRequest,
  ) {
    return loaders.usersLoader.load(userId);
  }

  @Mutation(() => CreateGroupMemberRequestPayload)
  async createGroupMemberRequest(
    @Args('groupId', { type: () => Int }) groupId: number,
    @CurrentUser() { id }: User,
  ) {
    return this.groupsService.createGroupMemberRequest(groupId, id);
  }

  @Mutation(() => ApproveGroupMemberRequestPayload)
  async approveGroupMemberRequest(@Args('id', { type: () => Int }) id: number) {
    return this.groupsService.approveGroupMemberRequest(id);
  }

  @Mutation(() => Boolean)
  async cancelGroupMemberRequest(@Args('id', { type: () => Int }) id: number) {
    return this.groupsService.cancelGroupMemberRequest(id);
  }

  @Mutation(() => Boolean)
  async denyGroupMemberRequest(@Args('id', { type: () => Int }) id: number) {
    return this.groupsService.denyGroupMemberRequest(id);
  }
}
