import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { Answer } from '../models/answer.model';
import { Question } from '../models/question.model';
import { QuestionsService } from '../questions.service';

@Resolver(() => Answer)
export class AnswersResolver {
  constructor(private questionsService: QuestionsService) {}

  // TODO: Remove if no longer needed
  @Query(() => Answer)
  async answer(@Args('id', { type: () => Int }) id: number) {
    return this.questionsService.getAnswer({ id });
  }

  @ResolveField(() => Question)
  async question(@Parent() { questionId }: Answer) {
    return this.questionsService.getQuestion(questionId);
  }

  @ResolveField(() => User)
  async user(@Parent() { id }: Answer) {
    return this.questionsService.getAnswerUser(id);
  }
}
