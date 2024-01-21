import { Query, Resolver } from '@nestjs/graphql';
import { QuestionsService } from './questions.service';
import { Question } from './models/question.model';

@Resolver()
export class QuestionsResolver {
  constructor(private questionsService: QuestionsService) {}

  @Query(() => [Question])
  async serverQuestions() {
    return this.questionsService.getServerQuestions();
  }
}
