import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/models/user.model';
import { AnswerQuestionsInput } from '../models/answer-questions.input';
import { Answer } from '../models/answer.model';
import { CreateQuestionInput } from '../models/create-question.input';
import { CreateQuestionPayload } from '../models/create-question.payload';
import { Question } from '../models/question.model';
import { UpdateQuestionInput } from '../models/update-question.input';
import { UpdateQuestionPayload } from '../models/update-question.payload';
import { UpdateQuestionsPriorityInput } from '../models/update-questions-priority.input';
import { QuestionsService } from '../questions.service';

@Resolver(() => Question)
export class QuestionsResolver {
  constructor(private questionsService: QuestionsService) {}

  @Query(() => [Question])
  async serverQuestions() {
    return this.questionsService.getServerQuestions();
  }

  @ResolveField(() => Answer, { nullable: true })
  async answer(
    @Args('questionnaireTicketId', { type: () => Int })
    questionnaireTicketId: number,
    @Parent() { id }: Question,
  ) {
    return this.questionsService.getAnswer({
      questionnaireTicketId,
      questionId: id,
    });
  }

  @ResolveField(() => Answer, { nullable: true })
  async myAnswer(
    @Parent() { id, groupId }: Question,
    @CurrentUser() user: User,
  ) {
    return this.questionsService.getAnswer({
      questionnaireTicket: { userId: user.id, groupId },
      questionId: id,
    });
  }

  @Mutation(() => CreateQuestionPayload)
  async createQuestion(
    @Args('questionData') questionData: CreateQuestionInput,
  ) {
    return this.questionsService.createQuestion(questionData);
  }

  @Mutation(() => UpdateQuestionPayload)
  async updateQuestion(
    @Args('questionData') questionData: UpdateQuestionInput,
  ) {
    return this.questionsService.updateQuestion(questionData);
  }

  @Mutation(() => Boolean)
  async updateQuestionsPriority(
    @Args('questionsData') questionsData: UpdateQuestionsPriorityInput,
  ) {
    return this.questionsService.updateQuestionsPriority(questionsData);
  }

  @Mutation(() => Boolean)
  async answerQuestions(
    @Args('answersData') answersData: AnswerQuestionsInput,
    @CurrentUser() user: User,
  ) {
    return this.questionsService.answerQuestions(answersData, user);
  }

  @Mutation(() => Boolean)
  async deleteQuestion(@Args('id', { type: () => Int }) id: number) {
    return this.questionsService.deleteQuestion(id);
  }
}
