import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { Dataloaders } from "../../dataloader/dataloader.types";
import { User } from "../models/user.model";
import { FollowsService } from "./follows.service";
import { CreateFollowPayload } from "./models/create-follow.payload";
import { Follow } from "./models/follow.model";

@Resolver(() => Follow)
export class FollowsResolver {
  constructor(private followsService: FollowsService) {}

  @ResolveField(() => User)
  async user(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { userId }: Follow
  ) {
    return loaders.usersLoader.load(userId);
  }

  @ResolveField(() => User)
  async followedUser(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { followedUserId }: Follow
  ) {
    return loaders.usersLoader.load(followedUserId);
  }

  @Mutation(() => CreateFollowPayload)
  async createFollow(
    @Args("followedUserId", { type: () => Int }) followedUserId: number,
    @CurrentUser() user: User
  ) {
    return this.followsService.createFollow(followedUserId, user);
  }

  @Mutation(() => Boolean)
  async deleteFollow(
    @Args("followedUserId", { type: () => Int }) followedUserId: number,
    @CurrentUser() user: User
  ) {
    return this.followsService.deleteFollow(followedUserId, user);
  }
}
