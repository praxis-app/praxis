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
import { Group } from '../models/group.model';
import { GroupMemberRequestsService } from './group-member-requests.service';
import { ApproveGroupMemberRequestPayload } from './models/approve-group-member-request.payload';
import { CreateGroupMemberRequestPayload } from './models/create-group-member-request.payload';
import { GroupMemberRequest } from './models/group-member-request.model';

@Resolver(() => GroupMemberRequest)
export class GroupMemberRequestsResolver {
  constructor(private groupMemberRequestsService: GroupMemberRequestsService) {}

  @Query(() => GroupMemberRequest, { nullable: true })
  async groupMemberRequest(
    @Args('groupId', { type: () => Int }) groupId: number,
    @CurrentUser() { id }: User,
  ) {
    return this.groupMemberRequestsService.getGroupMemberRequest({
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
    return this.groupMemberRequestsService.createGroupMemberRequest(
      groupId,
      id,
    );
  }

  @Mutation(() => ApproveGroupMemberRequestPayload)
  async approveGroupMemberRequest(@Args('id', { type: () => Int }) id: number) {
    return this.groupMemberRequestsService.approveGroupMemberRequest(id);
  }

  @Mutation(() => Boolean)
  async cancelGroupMemberRequest(@Args('id', { type: () => Int }) id: number) {
    return this.groupMemberRequestsService.cancelGroupMemberRequest(id);
  }

  @Mutation(() => Boolean)
  async denyGroupMemberRequest(@Args('id', { type: () => Int }) id: number) {
    return this.groupMemberRequestsService.denyGroupMemberRequest(id);
  }
}
