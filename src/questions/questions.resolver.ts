import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateQuestionInput } from './models/create-question.input';
import { CreateQuestionPayload } from './models/create-question.payload';
import { Question } from './models/question.model';
import { UpdateQuestionInput } from './models/update-question.input';
import { UpdateQuestionPayload } from './models/update-question.payload';
import { UpdateQuestionsPriorityInput } from './models/update-questions-priority.input';
import { QuestionsService } from './questions.service';

@Resolver()
export class QuestionsResolver {
  constructor(private questionsService: QuestionsService) {}

  @Query(() => [Question])
  async serverQuestions() {
    return this.questionsService.getServerQuestions();
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
  async deleteQuestion(@Args('id', { type: () => Int }) id: number) {
    return this.questionsService.deleteQuestion(id);
  }
}
