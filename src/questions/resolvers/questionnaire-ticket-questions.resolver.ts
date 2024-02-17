import {
  Args,
  Int,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Comment } from '../../comments/models/comment.model';
import { Like } from '../../likes/models/like.model';
import { User } from '../../users/models/user.model';
import { AnswerQuestionsInput } from '../models/answer-questions.input';
import { AnswerQuestionsPayload } from '../models/answer-questions.payload';
import { Answer } from '../models/answer.model';
import { QuestionnaireTicketQuestion } from '../models/questionnaire-ticket-question.model';
import { QuestionnaireTicket } from '../models/questionnaire-ticket.model';
import { QuestionsService } from '../questions.service';

@Resolver(() => QuestionnaireTicketQuestion)
export class QuestionnnaireTicketQuestionsResolver {
  constructor(private questionsService: QuestionsService) {}

  @ResolveField(() => Answer, { nullable: true })
  async answer(@Parent() { id }: QuestionnaireTicketQuestion) {
    return this.questionsService.getAnswer({
      questionnaireTicketQuestionId: id,
    });
  }

  @ResolveField(() => QuestionnaireTicket)
  async questionnaireTicket(
    @Parent() { questionnaireTicketId }: QuestionnaireTicketQuestion,
  ) {
    return this.questionsService.getQuestionnaireTicket(questionnaireTicketId);
  }

  @ResolveField(() => [Like])
  async likes(@Parent() { id }: QuestionnaireTicketQuestion) {
    return this.questionsService.getQuestionnaireTicketQuestionLikes(id);
  }

  @ResolveField(() => Int)
  async likeCount(@Parent() { id }: QuestionnaireTicketQuestion) {
    return this.questionsService.getQuestionnaireTicketQuestionLikeCount(id);
  }

  @ResolveField(() => [Comment])
  async comments(@Parent() { id }: QuestionnaireTicketQuestion) {
    return this.questionsService.getQuestionnaireTicketQuestionComments(id);
  }

  @ResolveField(() => Int)
  async commentCount(@Parent() { id }: QuestionnaireTicketQuestion) {
    return this.questionsService.getQuestionnaireTicketQuestionCommentCount(id);
  }

  @Mutation(() => AnswerQuestionsPayload)
  async answerQuestions(
    @Args('answersData') answersData: AnswerQuestionsInput,
    @CurrentUser() user: User,
  ) {
    return this.questionsService.answerQuestions(answersData, user);
  }
}
