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
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import FeedItem from "../common/models/feed-item.union";
import { Dataloaders } from "../dataloader/dataloader.service";
import { Group } from "../groups/models/group.model";
import { Image } from "../images/models/image.model";
import { Post } from "../posts/models/post.model";
import { PostsService } from "../posts/posts.service";
import { UpdateUserInput } from "./models/update-user.input";
import { UpdateUserPayload } from "./models/update-user.payload";
import { User } from "./models/user.model";
import { UsersService } from "./users.service";

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private postsService: PostsService,
    private usersService: UsersService
  ) {}

  @Query(() => User)
  me(@CurrentUser() { id }: User) {
    return this.usersService.getUser({ id });
  }

  @Query(() => User)
  async user(
    @Args("id", { type: () => Int, nullable: true }) id?: number,
    @Args("name", { type: () => String, nullable: true }) name?: string
  ) {
    return this.usersService.getUser({ id, name });
  }

  @Query(() => [User])
  async users() {
    return this.usersService.getUsers();
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
    @Parent() { id }: User
  ) {
    return loaders.profilePicturesLoader.load(id);
  }

  @ResolveField(() => Image)
  async coverPhoto(@Parent() { id }: User) {
    return this.usersService.getCoverPhoto(id);
  }

  @ResolveField(() => [Group])
  async joinedGroups(@Parent() { id }: User) {
    return this.usersService.getJoinedGroups(id);
  }

  @ResolveField(() => [String])
  async serverPermissions(@Parent() { id }: User) {
    const { serverPermissions } = await this.usersService.getUserPermissions(
      id
    );
    return serverPermissions;
  }

  @Mutation(() => UpdateUserPayload)
  async updateUser(@Args("userData") userData: UpdateUserInput) {
    return this.usersService.updateUser(userData);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args("id", { type: () => Int }) id: number) {
    return this.usersService.deleteUser(id);
  }
}
