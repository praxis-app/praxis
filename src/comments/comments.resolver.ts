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
import { User } from "../users/models/user.model";
import { CommentsService } from "./comments.service";
import { Comment } from "./models/comment.model";
import { CreateCommentInput } from "./models/create-comment.input";
import { CreateCommentPayload } from "./models/create-comment.payload";
import { UpdateCommentInput } from "./models/update-comment.input";
import { UpdateCommentPayload } from "./models/update-comment.payload";

@Resolver()
export class CommentsResolver {
  constructor(private commentsService: CommentsService) {}

  @ResolveField(() => User)
  async user(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { userId }: Comment
  ) {
    return loaders.usersLoader.load(userId);
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
