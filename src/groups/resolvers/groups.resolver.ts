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
import { Conversation } from '../../chat/models/conversation.model';
import { FeedItem } from '../../common/models/feed-item.union';
import { PublicFeedItemsConnection } from '../../common/models/public-feed-items.connection';
import { Dataloaders } from '../../dataloader/dataloader.types';
import { EventsService } from '../../events/events.service';
import { Event } from '../../events/models/event.model';
import { EventTimeFrame } from '../../events/models/events.input';
import { User } from '../../users/models/user.model';
import { GroupRolesService } from '../group-roles/group-roles.service';
import { GroupPermissions } from '../group-roles/models/group-permissions.type';
import { GroupRole } from '../group-roles/models/group-role.model';
import { GroupPrivacy } from '../groups.constants';
import { GroupsService } from '../groups.service';
import { CreateGroupInput } from '../models/create-group.input';
import { CreateGroupPayload } from '../models/create-group.payload';
import { GroupConfig } from '../models/group-config.model';
import { GroupMemberRequest } from '../models/group-member-request.model';
import { Group } from '../models/group.model';
import { GroupsInput } from '../models/groups.input';
import { UpdateGroupInput } from '../models/update-group.input';
import { UpdateGroupPayload } from '../models/update-group.payload';

@Resolver(() => Group)
export class GroupsResolver {
  constructor(
    private groupRolesService: GroupRolesService,
    private groupsService: GroupsService,
    private eventsService: EventsService,
  ) {}

  @Query(() => Group)
  async group(
    @Args('id', { type: () => Int, nullable: true }) id: number,
    @Args('name', { type: () => String, nullable: true }) name: string,
  ) {
    return this.groupsService.getGroup({ id, name });
  }

  @Query(() => [Group])
  async groups(
    @CurrentUser() currentUser: User,
    @Args('input') { joinedGroups, offset, limit }: GroupsInput,
  ) {
    return this.groupsService.getPagedGroups(
      joinedGroups
        ? {
            members: { id: currentUser.id },
          }
        : undefined,
      offset,
      limit,
    );
  }

  @Query(() => Int)
  async groupsCount() {
    return this.groupsService.getGroupsCount();
  }

  @Query(() => Int)
  async joinedGroupsCount(@CurrentUser() currentUser: User) {
    return this.groupsService.getGroupsCount({
      members: { id: currentUser.id },
    });
  }

  @Query(() => [Group])
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

  @Query(() => Int)
  async publicGroupsCount() {
    return this.groupsService.getGroupsCount({
      config: { privacy: GroupPrivacy.Public },
    });
  }

  @Query(() => PublicFeedItemsConnection)
  async publicGroupsFeed(
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.groupsService.getPublicGroupsFeed(offset, limit);
  }

  @Query(() => [FeedItem])
  async joinedGroupsFeed(
    @CurrentUser() currentUser: User,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.groupsService.getJoinedGroupsFeed(
      currentUser.id,
      offset,
      limit,
    );
  }

  @Query(() => Int)
  async joinedGroupsFeedCount(@CurrentUser() currentUser: User) {
    return this.groupsService.getJoinedGroupsFeedCount(currentUser.id);
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

  @ResolveField(() => [FeedItem])
  async feed(
    @Parent() { id }: Group,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.groupsService.getGroupFeed(id, offset, limit);
  }

  @ResolveField(() => Int)
  async feedCount(@Parent() { id }: Group) {
    return this.groupsService.getGroupFeedItemCount(id);
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
    return this.groupsService.getGroupMemberRequests(id);
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

  @ResolveField(() => Conversation)
  async chat(@Parent() { id }: Group) {
    return this.groupsService.getGroupChat(id);
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
    return this.groupsService.getGroupConfig({ groupId: id });
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
