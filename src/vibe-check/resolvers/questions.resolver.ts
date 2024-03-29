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
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Comment } from '../../comments/models/comment.model';
import { Dataloaders } from '../../dataloader/dataloader.types';
import { Like } from '../../likes/models/like.model';
import { User } from '../../users/models/user.model';
import { AnswerQuestionsInput } from '../models/answer-questions.input';
import { AnswerQuestionsPayload } from '../models/answer-questions.payload';
import { Answer } from '../models/answer.model';
import { Question } from '../models/question.model';
import { QuestionnaireTicket } from '../models/questionnaire-ticket.model';
import { VibeCheckService } from '../vibe-check.service';

@Resolver(() => Question)
export class QuestionsResolver {
  constructor(private vibeCheckService: VibeCheckService) {}

  @Query(() => Question)
  async question(@Args('id', { type: () => Int }) id: number) {
    return this.vibeCheckService.getQuestion(id);
  }

  @ResolveField(() => Answer, { nullable: true })
  async answer(@Parent() { id }: Question) {
    return this.vibeCheckService.getAnswer({
      questionId: id,
    });
  }

  @ResolveField(() => QuestionnaireTicket)
  async questionnaireTicket(@Parent() { questionnaireTicketId }: Question) {
    return this.vibeCheckService.getQuestionnaireTicket(questionnaireTicketId);
  }

  @ResolveField(() => [Like])
  async likes(@Parent() { id }: Question) {
    return this.vibeCheckService.getQuestionLikes(id);
  }

  @ResolveField(() => Int)
  async likeCount(@Parent() { id }: Question) {
    return this.vibeCheckService.getQuestionLikeCount(id);
  }

  @ResolveField(() => Boolean)
  async isLikedByMe(
    @Context() { loaders }: { loaders: Dataloaders },
    @CurrentUser() user: User,
    @Parent() { id }: Answer,
  ) {
    return loaders.isAnswerLikedByMeLoader.load({
      currentUserId: user.id,
      questionId: id,
    });
  }

  @ResolveField(() => [Comment])
  async comments(@Parent() { id }: Question) {
    return this.vibeCheckService.getQuestionComments(id);
  }

  @ResolveField(() => Int)
  async commentCount(@Parent() { id }: Question) {
    return this.vibeCheckService.getQuestionCommentCount(id);
  }

  @Mutation(() => AnswerQuestionsPayload)
  async answerQuestions(
    @Args('answersData') answersData: AnswerQuestionsInput,
    @CurrentUser() user: User,
  ) {
    return this.vibeCheckService.answerQuestions(answersData, user);
  }
}
