import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Dataloaders } from "../dataloader/dataloader.types";
import { Post } from "../posts/models/post.model";
import { PostsService } from "../posts/posts.service";
import { User } from "../users/models/user.model";
import { CommentsService } from "./comments.service";
import { Comment } from "./models/comment.model";
import { CreateCommentInput } from "./models/create-comment.input";
import { CreateCommentPayload } from "./models/create-comment.payload";
import { UpdateCommentInput } from "./models/update-comment.input";
import { UpdateCommentPayload } from "./models/update-comment.payload";

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(
    private commentsService: CommentsService,
    private postsService: PostsService
  ) {}

  @ResolveField(() => User)
  async user(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { userId }: Comment
  ) {
    return loaders.usersLoader.load(userId);
  }

  @ResolveField(() => Post, { nullable: true })
  async post(@Parent() { postId }: Comment) {
    return postId ? this.postsService.getPost(postId) : null;
  }

  @ResolveField(() => [Image])
  async images(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Comment
  ) {
    return loaders.commentImagesLoader.load(id);
  }

  @Mutation(() => CreateCommentPayload)
  async createComment(
    @Args("commentData") commentData: CreateCommentInput,
    @CurrentUser() user: User
  ) {
    return this.commentsService.createComment(commentData, user);
  }

  @Mutation(() => UpdateCommentPayload)
  async updateComment(@Args("commentData") commentData: UpdateCommentInput) {
    return this.commentsService.updateComment(commentData);
  }

  @Mutation(() => Boolean)
  async deleteComment(@Args("id", { type: () => Int }) id: number) {
    return this.commentsService.deleteComment(id);
  }
}