import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Group } from '../../groups/models/group.model';
import { User } from '../../users/models/user.model';
import { Vote } from '../../votes/models/vote.model';
import { Answer } from '../models/answer.model';
import { Question } from '../models/question.model';
import { QuestionnaireTicket } from '../models/questionnaire-ticket.model';
import { QuestionsService } from '../questions.service';

@Resolver(() => QuestionnaireTicket)
export class QuestionnaireTicketsResolver {
  constructor(private questionsService: QuestionsService) {}

  @ResolveField(() => [Question])
  async questions(@Parent() { groupId }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketQuestions(groupId);
  }

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
