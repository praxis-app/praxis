import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Dataloaders } from '../dataloader/dataloader.types';
import { Like } from '../likes/models/like.model';
import { Post } from '../posts/models/post.model';
import { PostsService } from '../posts/posts.service';
import { Proposal } from '../proposals/models/proposal.model';
import { ProposalsService } from '../proposals/proposals.service';
import { Answer } from '../questions/models/answer.model';
import { QuestionnaireTicket } from '../questions/models/questionnaire-ticket.model';
import { User } from '../users/models/user.model';
import { CommentsService } from './comments.service';
import { Comment } from './models/comment.model';
import { CreateCommentInput } from './models/create-comment.input';
import { CreateCommentPayload } from './models/create-comment.payload';
import { UpdateCommentInput } from './models/update-comment.input';
import { UpdateCommentPayload } from './models/update-comment.payload';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(
    private commentsService: CommentsService,
    private postsService: PostsService,
    private proposalsService: ProposalsService,
  ) {}

  @ResolveField(() => User)
  async user(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { userId }: Comment,
  ) {
    return loaders.usersLoader.load(userId);
  }

  @ResolveField(() => Post, { nullable: true })
  async post(@Parent() { postId }: Comment) {
    return postId ? this.postsService.getPost(postId) : null;
  }

  @ResolveField(() => Proposal, { nullable: true })
  async proposal(@Parent() { proposalId }: Comment) {
    return proposalId ? this.proposalsService.getProposal(proposalId) : null;
  }

  @ResolveField(() => Answer, { nullable: true })
  async answer(@Parent() { answerId }: Comment) {
    return answerId ? this.commentsService.getCommentedAnswer(answerId) : null;
  }

  @ResolveField(() => QuestionnaireTicket, { nullable: true })
  async questionnaireTicket(@Parent() { questionnaireTicketId }: Comment) {
    if (!questionnaireTicketId) {
      return null;
    }
    return this.commentsService.getCommentedQuestionnaireTicket(
      questionnaireTicketId,
    );
  }

  @ResolveField(() => [Image])
  async images(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Comment,
  ) {
    return loaders.commentImagesLoader.load(id);
  }

  @ResolveField(() => [Like])
  async likes(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Like,
  ) {
    return loaders.commentLikesLoader.load(id);
  }

  @ResolveField(() => Int)
  async likeCount(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Post,
  ) {
    return loaders.commentLikeCountLoader.load(id);
  }

  @ResolveField(() => Boolean)
  async isLikedByMe(
    @Context() { loaders }: { loaders: Dataloaders },
    @CurrentUser() user: User,
    @Parent() { id }: Comment,
  ) {
    return loaders.isCommentLikedByMeLoader.load({
      currentUserId: user.id,
      commentId: id,
    });
  }

  @Mutation(() => CreateCommentPayload)
  async createComment(
    @Args('commentData') commentData: CreateCommentInput,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.createComment(commentData, user);
  }

  @Mutation(() => UpdateCommentPayload)
  async updateComment(@Args('commentData') commentData: UpdateCommentInput) {
    return this.commentsService.updateComment(commentData);
  }

  @Mutation(() => Boolean)
  async deleteComment(@Args('id', { type: () => Int }) id: number) {
    return this.commentsService.deleteComment(id);
  }
}
