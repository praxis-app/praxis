import { UseInterceptors } from '@nestjs/common';
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
import { EventsService } from '../events/events.service';
import { Event } from '../events/models/event.model';
import { EventTimeFrame } from '../events/models/events.input';
import { SynchronizeProposalsInterceptor } from '../proposals/interceptors/synchronize-proposals.interceptor';
import { User } from '../users/models/user.model';
import { GroupPrivacy } from './group-configs/group-configs.constants';
import { GroupConfigsService } from './group-configs/group-configs.service';
import { GroupConfig } from './group-configs/models/group-config.model';
import { GroupMemberRequestsService } from './group-member-requests/group-member-requests.service';
import { GroupMemberRequest } from './group-member-requests/models/group-member-request.model';
import { GroupRolesService } from './group-roles/group-roles.service';
import { GroupPermissions } from './group-roles/models/group-permissions.type';
import { GroupRole } from './group-roles/models/group-role.model';
import { GroupsService } from './groups.service';
import { CreateGroupInput } from './models/create-group.input';
import { CreateGroupPayload } from './models/create-group.payload';
import { GroupFeedConnection } from './models/group-feed.connection';
import { Group } from './models/group.model';
import { GroupsConnection } from './models/groups.connection';
import { PublicGroupsFeedConnection } from './models/public-groups-feed.connection';
import { PublicGroupsConnection } from './models/public-groups.connection';
import { UpdateGroupInput } from './models/update-group.input';
import { UpdateGroupPayload } from './models/update-group.payload';

@Resolver(() => Group)
export class GroupsResolver {
  constructor(
    private groupConfigsService: GroupConfigsService,
    private groupRolesService: GroupRolesService,
    private groupsService: GroupsService,
    private memberRequestsService: GroupMemberRequestsService,
    private eventsService: EventsService,
  ) {}

  @Query(() => Group)
  @UseInterceptors(SynchronizeProposalsInterceptor)
  async group(
    @Args('id', { type: () => Int, nullable: true }) id: number,
    @Args('name', { type: () => String, nullable: true }) name: string,
  ) {
    return this.groupsService.getGroup({ id, name });
  }

  @Query(() => GroupsConnection)
  @UseInterceptors(SynchronizeProposalsInterceptor)
  async groups(
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.groupsService.getPagedGroups({}, offset, limit);
  }

  @Query(() => PublicGroupsConnection)
  async publicGroups(
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.groupsService.getPagedGroups(
      { config: { privacy: GroupPrivacy.Public } },
      offset,
      limit,
    );
  }

  @Query(() => PublicGroupsFeedConnection)
  async publicGroupsFeed(
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.groupsService.getPublicGroupsFeed(offset, limit);
  }

  @Query(() => GroupRole)
  async groupRole(@Args('id', { type: () => Int }) id: number) {
    return this.groupRolesService.getGroupRole({ id });
  }

  @ResolveField(() => Image)
  async coverPhoto(
    @Parent() { id }: Group,
    @Context() { loaders }: { loaders: Dataloaders },
  ) {
    return loaders.groupCoverPhotosLoader.load(id);
  }

  @ResolveField(() => GroupFeedConnection)
  async feed(
    @Parent() { id }: Group,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.groupsService.getGroupFeed(id, offset, limit);
  }

  @ResolveField(() => [User])
  async members(
    @Parent() { id }: Group,
    @Context() { loaders }: { loaders: Dataloaders },
  ) {
    return loaders.groupMembersLoader.load(id);
  }

  @ResolveField(() => [GroupMemberRequest], { nullable: true })
  async memberRequests(@Parent() { id }: Group) {
    return this.memberRequestsService.getGroupMemberRequests(id);
  }

  @ResolveField(() => Int)
  async memberCount(
    @Parent() { id }: Group,
    @Context() { loaders }: { loaders: Dataloaders },
  ) {
    return loaders.groupMemberCountLoader.load(id);
  }

  @ResolveField(() => Int, { nullable: true })
  async memberRequestCount(
    @Parent() { id }: Group,
    @Context() { loaders }: { loaders: Dataloaders },
  ) {
    return loaders.memberRequestCountLoader.load(id);
  }

  // TODO: Rename as isMember
  @ResolveField(() => Boolean)
  async isJoinedByMe(
    @Context() { loaders }: { loaders: Dataloaders },
    @CurrentUser() currentUser: User,
    @Parent() group: Group,
  ) {
    return loaders.isJoinedByMeLoader.load({
      currentUserId: currentUser.id,
      groupId: group.id,
    });
  }

  @ResolveField(() => [Event])
  async futureEvents(@Parent() { id }: Group) {
    return this.eventsService.getFilteredEvents(
      { timeFrame: EventTimeFrame.Future },
      { groupId: id },
    );
  }

  @ResolveField(() => [Event])
  async pastEvents(@Parent() { id }: Group) {
    return this.eventsService.getFilteredEvents(
      { timeFrame: EventTimeFrame.Past },
      { groupId: id },
    );
  }

  @ResolveField(() => [GroupRole])
  async roles(@Parent() { id }: Group) {
    return this.groupRolesService.getGroupRoles({ groupId: id });
  }

  @ResolveField(() => GroupPermissions)
  async myPermissions(
    @Context() { loaders }: { loaders: Dataloaders },
    @CurrentUser() currentUser: User,
    @Parent() group: Group,
  ) {
    return loaders.myGroupPermissionsLoader.load({
      currentUserId: currentUser.id,
      groupId: group.id,
    });
  }

  @ResolveField(() => GroupConfig)
  async settings(@Parent() { id }: Group) {
    return this.groupConfigsService.getGroupConfig({ groupId: id });
  }

  @Mutation(() => CreateGroupPayload)
  async createGroup(
    @Args('groupData') groupData: CreateGroupInput,
    @CurrentUser() { id }: User,
  ) {
    return this.groupsService.createGroup(groupData, id);
  }

  @Mutation(() => UpdateGroupPayload)
  async updateGroup(@Args('groupData') groupData: UpdateGroupInput) {
    return this.groupsService.updateGroup(groupData);
  }

  @Mutation(() => Boolean)
  async deleteGroup(@Args('id', { type: () => Int }) id: number) {
    return this.groupsService.deleteGroup(id);
  }

  @Mutation(() => Boolean)
  async leaveGroup(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() { id: userId }: User,
  ) {
    return this.groupsService.leaveGroup(id, userId);
  }
}
