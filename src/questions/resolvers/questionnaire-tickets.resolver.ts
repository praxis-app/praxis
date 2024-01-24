import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Answer } from '../models/answer.model';
import { QuestionnaireTicket } from '../models/questionnaire-ticket.model';
import { QuestionsService } from '../questions.service';
import { Vote } from '../../votes/models/vote.model';
import { User } from '../../users/models/user.model';
import { Group } from '../../groups/models/group.model';

@Resolver(() => QuestionnaireTicket)
export class QuestionnaireTicketsResolver {
  constructor(private questionsService: QuestionsService) {}

  @ResolveField(() => [Answer])
  async answers(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketAnswers(id);
  }

  @ResolveField(() => [Vote])
  async votes(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketVotes(id);
  }

  @ResolveField(() => User)
  async user(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketUser(id);
  }

  @ResolveField(() => Group, { nullable: true })
  async group(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketGroup(id);
  }
}
