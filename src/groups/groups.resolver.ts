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
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { FeedItem } from "../common/models/feed-item.union";
import { Dataloaders } from "../dataloader/dataloader.types";
import { Post } from "../posts/models/post.model";
import { PostsService } from "../posts/posts.service";
import { Role } from "../roles/models/role.model";
import { RolesService } from "../roles/roles.service";
import { User } from "../users/models/user.model";
import { GroupConfigsService } from "./group-configs/group-configs.service";
import {
  GroupConfig,
  GroupPrivacy,
} from "./group-configs/models/group-config.model";
import { GroupsService } from "./groups.service";
import { MemberRequestsService } from "./member-requests/member-requests.service";
import { MemberRequest } from "./member-requests/models/member-request.model";
import { CreateGroupInput } from "./models/create-group.input";
import { CreateGroupPayload } from "./models/create-group.payload";
import { Group } from "./models/group.model";
import { UpdateGroupInput } from "./models/update-group.input";
import { UpdateGroupPayload } from "./models/update-group.payload";

@Resolver(() => Group)
export class GroupsResolver {
  constructor(
    private groupsService: GroupsService,
    private groupConfigsService: GroupConfigsService,
    private memberRequestsService: MemberRequestsService,
    private postsService: PostsService,
    private rolesService: RolesService
  ) {}

  @Query(() => Group)
  async group(
    @Args("id", { type: () => Int, nullable: true }) id: number,
    @Args("name", { type: () => String, nullable: true }) name: string
  ) {
    return this.groupsService.getGroup({ id, name });
  }

  @Query(() => [Group])
  async groups() {
    return this.groupsService.getGroups();
  }

  @Query(() => [Group])
  async publicGroups() {
    return this.groupsService.getGroups({
      config: { privacy: GroupPrivacy.Public },
    });
  }

  @Query(() => [FeedItem])
  async publicGroupsFeed() {
    return this.groupsService.getPublicGroupsFeed();
  }

  @Query(() => Role)
  async groupRole(@Args("id", { type: () => Int }) id: number) {
    return this.rolesService.getRole({ id, groupId: Not(IsNull()) });
  }

  @ResolveField(() => [Post])
  async posts(@Parent() { id }: Group) {
    return this.postsService.getPosts({ groupId: id });
  }

  @ResolveField(() => Image)
  async coverPhoto(
    @Parent() { id }: Group,
    @Context() { loaders }: { loaders: Dataloaders }
  ) {
    return loaders.groupCoverPhotosLoader.load(id);
  }

  @ResolveField(() => [FeedItem])
  async feed(@Parent() { id }: Group) {
    return this.groupsService.getGroupFeed(id);
  }

  @ResolveField(() => [User])
  async members(
    @Parent() { id }: Group,
    @Context() { loaders }: { loaders: Dataloaders }
  ) {
    return loaders.groupMembersLoader.load(id);
  }

  @ResolveField(() => [MemberRequest], { nullable: true })
  async memberRequests(@Parent() { id }: Group) {
    return this.memberRequestsService.getMemberRequests(id);
  }

  @ResolveField(() => Int)
  async memberCount(
    @Parent() { id }: Group,
    @Context() { loaders }: { loaders: Dataloaders }
  ) {
    return loaders.groupMemberCountLoader.load(id);
  }

  @ResolveField(() => Int, { nullable: true })
  async memberRequestCount(
    @Parent() { id }: Group,
    @Context() { loaders }: { loaders: Dataloaders }
  ) {
    return loaders.memberRequestCountLoader.load(id);
  }

  @ResolveField(() => Boolean)
  async isJoinedByMe(
    @Context() { loaders }: { loaders: Dataloaders },
    @CurrentUser() currentUser: User,
    @Parent() group: Group
  ) {
    return loaders.isJoinedByMeLoader.load({
      currentUserId: currentUser.id,
      groupId: group.id,
    });
  }

  @ResolveField(() => [Role])
  async roles(@Parent() { id }: Group) {
    return this.rolesService.getRoles({ groupId: id });
  }

  @ResolveField(() => [String])
  async myPermissions(
    @Context() { loaders }: { loaders: Dataloaders },
    @CurrentUser() currentUser: User,
    @Parent() group: Group
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
    @Args("groupData") groupData: CreateGroupInput,
    @CurrentUser() { id }: User
  ) {
    return this.groupsService.createGroup(groupData, id);
  }

  @Mutation(() => UpdateGroupPayload)
  async updateGroup(@Args("groupData") groupData: UpdateGroupInput) {
    return this.groupsService.updateGroup(groupData);
  }

  @Mutation(() => Boolean)
  async deleteGroup(@Args("id", { type: () => Int }) id: number) {
    return this.groupsService.deleteGroup(id);
  }

  @Mutation(() => Boolean)
  async leaveGroup(
    @Args("id", { type: () => Int }) id: number,
    @CurrentUser() { id: userId }: User
  ) {
    return this.groupsService.leaveGroup(id, userId);
  }
}
