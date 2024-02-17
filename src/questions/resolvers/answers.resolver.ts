import {
  Args,
  Context,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Dataloaders } from '../../dataloader/dataloader.types';
import { User } from '../../users/models/user.model';
import { Answer } from '../models/answer.model';
import { QuestionnaireTicketQuestion } from '../models/questionnaire-ticket-question.model';
import { QuestionsService } from '../questions.service';

@Resolver(() => Answer)
export class AnswersResolver {
  constructor(private questionsService: QuestionsService) {}

  @Query(() => Answer)
  async answer(@Args('id', { type: () => Int }) id: number) {
    return this.questionsService.getAnswer({ id });
  }

  @ResolveField(() => QuestionnaireTicketQuestion)
  async question(@Parent() { questionnaireTicketQuestionId }: Answer) {
    return this.questionsService.getQuestionnaireTicketQuestion(
      questionnaireTicketQuestionId,
    );
  }

  @ResolveField(() => User)
  async user(@Parent() { id }: Answer) {
    return this.questionsService.getAnswerUser(id);
  }

  @ResolveField(() => Boolean)
  async isLikedByMe(
    @Context() { loaders }: { loaders: Dataloaders },
    @CurrentUser() user: User,
    @Parent() { id }: Answer,
  ) {
    return loaders.isAnswerLikedByMeLoader.load({
      currentUserId: user.id,
      questionnaireTicketQuestionId: id,
    });
  }
}
