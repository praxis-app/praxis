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
import { FeedItemsConnection } from '../common/models/feed-items.connection';
import { Dataloaders } from '../dataloader/dataloader.types';
import { Group } from '../groups/models/group.model';
import { Image } from '../images/models/image.model';
import { ServerPermissions } from '../server-roles/models/server-permissions.type';
import { FollowUserPayload } from './models/follow-user.payload';
import { UpdateUserInput } from './models/update-user.input';
import { UpdateUserPayload } from './models/update-user.payload';
import { User } from './models/user.model';
import { UsersConnection } from './models/users.connection';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

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

  @Query(() => UsersConnection)
  async users(
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.usersService.getPagedUsers(offset, limit);
  }

  @Query(() => [User])
  async usersByIds(@Args('ids', { type: () => [Int] }) ids: number[]) {
    return this.usersService.getUsers({ id: In(ids) });
  }

  @Query(() => Boolean)
  async isFirstUser() {
    return this.usersService.isFirstUser();
  }

  @ResolveField(() => FeedItemsConnection)
  async homeFeed(
    @Parent() { id }: User,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.usersService.getUserFeed(id, offset, limit);
  }

  @ResolveField(() => FeedItemsConnection)
  async profileFeed(
    @Parent() { id }: User,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.usersService.getUserProfileFeed(id, offset, limit);
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

  @ResolveField(() => UsersConnection)
  async followers(
    @Parent() { id }: User,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.usersService.getFollowers(id, offset, limit);
  }

  @ResolveField(() => UsersConnection)
  async following(
    @Parent() { id }: User,
    @Args('offset', { type: () => Int, nullable: true }) offset?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return this.usersService.getFollowing(id, offset, limit);
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
