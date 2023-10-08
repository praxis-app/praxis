import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Dataloaders } from '../dataloader/dataloader.types';
import { Post } from '../posts/models/post.model';
import { PostsService } from '../posts/posts.service';
import { User } from '../users/models/user.model';
import { LikesService } from './likes.service';
import { CreateLikeInput } from './models/create-like.input';
import { CreateLikePayload } from './models/create-like.payload';
import { DeleteLikeInput } from './models/delete-like.input';
import { Like } from './models/like.model';

@Resolver(() => Like)
export class LikesResolver {
  constructor(
    private likesService: LikesService,
    private postsService: PostsService,
  ) {}

  @ResolveField(() => User)
  async user(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { userId }: Like,
  ) {
    return loaders.usersLoader.load(userId);
  }

  @ResolveField(() => Post)
  async post(@Parent() { postId }: Like) {
    return postId ? this.postsService.getPost(postId) : null;
  }

  @Mutation(() => CreateLikePayload)
  async createLike(
    @Args('likeData') likeData: CreateLikeInput,
    @CurrentUser() user: User,
  ) {
    return this.likesService.createLike(likeData, user);
  }

  @Mutation(() => Boolean)
  async deleteLike(
    @Args('likeData') likeData: DeleteLikeInput,
    @CurrentUser() user: User,
  ) {
    return this.likesService.deleteLike(likeData, user);
  }
}
