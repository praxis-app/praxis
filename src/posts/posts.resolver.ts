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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Comment } from '../comments/models/comment.model';
import { Dataloaders } from '../dataloader/dataloader.types';
import { Event } from '../events/models/event.model';
import { Group } from '../groups/models/group.model';
import { Image } from '../images/models/image.model';
import { Like } from '../likes/models/like.model';
import { User } from '../users/models/user.model';
import { CreatePostInput } from './models/create-post.input';
import { CreatePostPayload } from './models/create-post.payload';
import { Post } from './models/post.model';
import { UpdatePostInput } from './models/update-post.input';
import { UpdatePostPayload } from './models/update-post.payload';
import { PostsService } from './posts.service';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private postsService: PostsService) {}

  @Query(() => Post)
  async post(@Args('id', { type: () => Int }) id: number) {
    return this.postsService.getPost(id);
  }

  @ResolveField(() => [Comment])
  async comments(@Parent() { id }: Post) {
    return this.postsService.getPostComments(id);
  }

  @ResolveField(() => Int)
  async commentCount(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Post,
  ) {
    return loaders.postCommentCountLoader.load(id);
  }

  @ResolveField(() => [Like])
  async likes(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Post,
  ) {
    return loaders.postLikesLoader.load(id);
  }

  @ResolveField(() => Int)
  async likeCount(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Post,
  ) {
    return loaders.postLikeCountLoader.load(id);
  }

  @ResolveField(() => Boolean)
  async isLikedByMe(
    @Context() { loaders }: { loaders: Dataloaders },
    @CurrentUser() user: User,
    @Parent() { id }: Post,
  ) {
    return loaders.isPostLikedByMeLoader.load({
      currentUserId: user.id,
      postId: id,
    });
  }

  @ResolveField(() => [Image])
  async images(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Post,
  ) {
    return loaders.postImagesLoader.load(id);
  }

  @ResolveField(() => User)
  async user(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { userId }: Post,
  ) {
    return loaders.usersLoader.load(userId);
  }

  @ResolveField(() => Group, { nullable: true })
  async group(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { groupId }: Post,
  ) {
    return groupId ? loaders.groupsLoader.load(groupId) : null;
  }

  @ResolveField(() => Event, { nullable: true })
  async event(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { eventId }: Post,
  ) {
    return eventId ? loaders.eventsLoader.load(eventId) : null;
  }

  @Mutation(() => CreatePostPayload)
  async createPost(
    @Args('postData') postData: CreatePostInput,
    @CurrentUser() user: User,
  ) {
    return this.postsService.createPost(postData, user);
  }

  @Mutation(() => UpdatePostPayload)
  async updatePost(@Args('postData') postData: UpdatePostInput) {
    return this.postsService.updatePost(postData);
  }

  @Mutation(() => Boolean)
  async deletePost(@Args('id', { type: () => Int }) id: number) {
    return this.postsService.deletePost(id);
  }
}
