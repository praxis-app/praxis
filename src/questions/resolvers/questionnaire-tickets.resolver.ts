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
import { Group } from '../../groups/models/group.model';
import { User } from '../../users/models/user.model';
import { Vote } from '../../votes/models/vote.model';
import { Question } from '../models/question.model';
import { QuestionnaireTicketConfig } from '../models/questionnaire-ticket-config.model';
import { QuestionnaireTicket } from '../models/questionnaire-ticket.model';
import { QuestionsService } from '../questions.service';

@Resolver(() => QuestionnaireTicket)
export class QuestionnaireTicketsResolver {
  constructor(private questionsService: QuestionsService) {}

  @Query(() => QuestionnaireTicket)
  async questionnaireTicket(@Args('id', { type: () => Int }) id: number) {
    return this.questionsService.getQuestionnaireTicket(id);
  }

  @Query(() => [QuestionnaireTicket])
  async serverQuestionnaireTickets() {
    return this.questionsService.getServerQuestionnaireTickets();
  }

  @ResolveField(() => String, { nullable: true })
  async prompt(@Parent() { groupId }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnairePrompt(groupId);
  }

  @ResolveField(() => [Question])
  async questions(@Parent() { groupId }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketQuestions(groupId);
  }

  @ResolveField(() => [Vote])
  async votes(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketVotes(id);
  }

  @ResolveField(() => Int)
  async voteCount(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketVoteCount(id);
  }

  @ResolveField(() => Vote, { nullable: true })
  async myVote(
    @Parent() { id }: QuestionnaireTicket,
    @CurrentUser() user: User,
  ) {
    return this.questionsService.getQuestionnaireTicketVote(id, user.id);
  }

  @ResolveField(() => [Comment])
  async comments(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketComments(id);
  }

  @ResolveField(() => Int)
  async commentCount(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketCommentCount(id);
  }

  @ResolveField(() => User)
  async user(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketUser(id);
  }

  @ResolveField(() => Group, { nullable: true })
  async group(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketGroup(id);
  }

  @ResolveField(() => QuestionnaireTicketConfig)
  async settings(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketConfig(id);
  }

  @Mutation(() => Boolean)
  async deleteQuestionnnaireTicket(
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.questionsService.deleteQuestionnaireTicket(id);
  }
}
