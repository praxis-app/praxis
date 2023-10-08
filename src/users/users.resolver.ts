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
import { In } from 'typeorm';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FeedItem } from '../shared/models/feed-item.union';
import { Dataloaders } from '../dataloader/dataloader.types';
import { Group } from '../groups/models/group.model';
import { Image } from '../images/models/image.model';
import { Post } from '../posts/models/post.model';
import { PostsService } from '../posts/posts.service';
import { FollowUserPayload } from './models/follow-user.payload';
import { UpdateUserInput } from './models/update-user.input';
import { UpdateUserPayload } from './models/update-user.payload';
import { ServerPermissions } from '../server-roles/models/server-permissions.type';
import { User } from './models/user.model';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private postsService: PostsService,
    private usersService: UsersService,
  ) {}

  @Query(() => User)
  me(@CurrentUser() { id }: User) {
    return this.usersService.getUser({ id });
  }

  @Query(() => User)
  async user(
    @Args('id', { type: () => Int, nullable: true }) id?: number,
    @Args('name', { type: () => String, nullable: true }) name?: string,
  ) {
    return this.usersService.getUser({ id, name });
  }

  @Query(() => [User])
  async users() {
    return this.usersService.getUsers();
  }

  @Query(() => [User])
  async usersByIds(@Args('ids', { type: () => [Int] }) ids: number[]) {
    return this.usersService.getUsers({ id: In(ids) });
  }

  @Query(() => Boolean)
  async isFirstUser() {
    return this.usersService.isFirstUser();
  }

  @ResolveField(() => [FeedItem])
  async homeFeed(@Parent() { id }: User) {
    return this.usersService.getUserHomeFeed(id);
  }

  @ResolveField(() => [FeedItem])
  async profileFeed(@Parent() { id }: User) {
    return this.usersService.getUserProfileFeed(id);
  }

  @ResolveField(() => [Post])
  async posts(@Parent() { id }: User) {
    return this.postsService.getPosts({ userId: id });
  }

  @ResolveField(() => Image)
  async profilePicture(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: User,
  ) {
    return loaders.profilePicturesLoader.load(id);
  }

  @ResolveField(() => Image)
  async coverPhoto(@Parent() { id }: User) {
    return this.usersService.getCoverPhoto(id);
  }

  @ResolveField(() => [User])
  async followers(@Parent() { id }: User) {
    return this.usersService.getFollowers(id);
  }

  @ResolveField(() => [User])
  async following(@Parent() { id }: User) {
    return this.usersService.getFollowing(id);
  }

  @ResolveField(() => Int)
  async followerCount(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: User,
  ) {
    return loaders.followerCountLoader.load(id);
  }

  @ResolveField(() => Int)
  async followingCount(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: User,
  ) {
    return loaders.followingCountLoader.load(id);
  }

  @ResolveField(() => Boolean)
  async isFollowedByMe(
    @Context() { loaders }: { loaders: Dataloaders },
    @CurrentUser() currentUser: User,
    @Parent() user: User,
  ) {
    return loaders.isFollowedByMeLoader.load({
      currentUserId: currentUser.id,
      followedUserId: user.id,
    });
  }

  @ResolveField(() => [Group])
  async joinedGroups(@Parent() { id }: User) {
    return this.usersService.getJoinedGroups(id);
  }

  @ResolveField(() => ServerPermissions)
  async serverPermissions(@Parent() { id }: User) {
    const { serverPermissions } =
      await this.usersService.getUserPermissions(id);
    return serverPermissions;
  }

  @Mutation(() => UpdateUserPayload)
  async updateUser(@Args('userData') userData: UpdateUserInput) {
    return this.usersService.updateUser(userData);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.deleteUser(id);
  }

  @Mutation(() => FollowUserPayload)
  async followUser(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ) {
    return this.usersService.followUser(id, user.id);
  }

  @Mutation(() => Boolean)
  async unfollowUser(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ) {
    return this.usersService.unfollowUser(id, user.id);
  }
}
