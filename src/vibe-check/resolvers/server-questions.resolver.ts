import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateQuestionInput } from '../models/create-question.input';
import { CreateQuestionPayload } from '../models/create-question.payload';
import { ServerQuestion } from '../models/server-question.model';
import { UpdateQuestionInput } from '../models/update-question.input';
import { UpdateQuestionPayload } from '../models/update-question.payload';
import { UpdateQuestionsPriorityInput } from '../models/update-questions-priority.input';
import { VibeCheckService } from '../vibe-check.service';

@Resolver(() => ServerQuestion)
export class ServerQuestionsResolver {
  constructor(private vibeCheckService: VibeCheckService) {}

  @Query(() => [ServerQuestion])
  async serverQuestions() {
    return this.vibeCheckService.getServerQuestions();
  }

  @Mutation(() => CreateQuestionPayload)
  async createQuestion(
    @Args('questionData') questionData: CreateQuestionInput,
  ) {
    return this.vibeCheckService.createQuestion(questionData);
  }

  @Mutation(() => UpdateQuestionPayload)
  async updateQuestion(
    @Args('questionData') questionData: UpdateQuestionInput,
  ) {
    return this.vibeCheckService.updateQuestion(questionData);
  }

  @Mutation(() => Boolean)
  async updateQuestionsPriority(
    @Args('questionsData') questionsData: UpdateQuestionsPriorityInput,
  ) {
    return this.vibeCheckService.updateQuestionsPriority(questionsData);
  }

  @Mutation(() => Boolean)
  async deleteQuestion(@Args('id', { type: () => Int }) id: number) {
    return this.vibeCheckService.deleteQuestion(id);
  }
}
