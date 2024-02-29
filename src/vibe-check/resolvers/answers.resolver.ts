import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { Answer } from '../models/answer.model';
import { Question } from '../models/question.model';
import { VibeCheckService } from '../vibe-check.service';

@Resolver(() => Answer)
export class AnswersResolver {
  constructor(private vibeCheckService: VibeCheckService) {}

  @ResolveField(() => Question)
  async question(@Parent() { questionId }: Answer) {
    return this.vibeCheckService.getQuestion(questionId);
  }

  @ResolveField(() => User)
  async user(@Parent() { id }: Answer) {
    return this.vibeCheckService.getAnswerUser(id);
  }
}
