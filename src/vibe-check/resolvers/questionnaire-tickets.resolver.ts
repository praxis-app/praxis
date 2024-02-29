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
import { Vote } from '../../votes/models/vote.model';
import { VoteTypes } from '../../votes/votes.constants';
import { Question } from '../models/question.model';
import { QuestionnaireTicketConfig } from '../models/questionnaire-ticket-config.model';
import { QuestionnaireTicket } from '../models/questionnaire-ticket.model';
import { VibeCheckService } from '../vibe-check.service';

@Resolver(() => QuestionnaireTicket)
export class QuestionnaireTicketsResolver {
  constructor(private vibeCheckService: VibeCheckService) {}

  @Query(() => QuestionnaireTicket)
  async questionnaireTicket(@Args('id', { type: () => Int }) id: number) {
    return this.vibeCheckService.getQuestionnaireTicket(id);
  }

  @Query(() => [QuestionnaireTicket])
  async serverQuestionnaireTickets() {
    return this.vibeCheckService.getQuestionnaireTickets();
  }

  @ResolveField(() => String, { nullable: true })
  async prompt() {
    return this.vibeCheckService.getQuestionnairePrompt();
  }

  @ResolveField(() => [Question])
  async questions(@Parent() { id }: QuestionnaireTicket) {
    return this.vibeCheckService.getQuestions(id);
  }

  @ResolveField(() => Int)
  async questionCount(@Parent() { id }: QuestionnaireTicket) {
    return this.vibeCheckService.getQuestionCount(id);
  }

  @ResolveField(() => Int)
  async answerCount(@Parent() { id }: QuestionnaireTicket) {
    return this.vibeCheckService.getQuestionnaireTicketAnswerCount(id);
  }

  @ResolveField(() => [Vote])
  async votes(@Parent() { id }: QuestionnaireTicket) {
    return this.vibeCheckService.getQuestionnaireTicketVotes(id);
  }

  @ResolveField(() => Int)
  async voteCount(@Parent() { id }: QuestionnaireTicket) {
    return this.vibeCheckService.getQuestionnaireTicketVoteCount({
      questionnaireTicketId: id,
    });
  }

  @ResolveField(() => Int)
  async agreementVoteCount(@Parent() { id }: QuestionnaireTicket) {
    return this.vibeCheckService.getQuestionnaireTicketVoteCount({
      questionnaireTicketId: id,
      voteType: VoteTypes.Agreement,
    });
  }

  @ResolveField(() => Int)
  async votesNeededToVerify(@Parent() { id }: QuestionnaireTicket) {
    return this.vibeCheckService.getVotesNeededToVerify(id);
  }

  @ResolveField(() => Vote, { nullable: true })
  async myVote(
    @Parent() { id }: QuestionnaireTicket,
    @CurrentUser() user: User,
  ) {
    return this.vibeCheckService.getQuestionnaireTicketVote(id, user.id);
  }

  @ResolveField(() => [Comment])
  async comments(@Parent() { id }: QuestionnaireTicket) {
    return this.vibeCheckService.getQuestionnaireTicketComments(id);
  }

  @ResolveField(() => Int)
  async commentCount(@Parent() { id }: QuestionnaireTicket) {
    return this.vibeCheckService.getQuestionnaireTicketCommentCount(id);
  }

  @ResolveField(() => User)
  async user(@Parent() { id }: QuestionnaireTicket) {
    return this.vibeCheckService.getQuestionnaireTicketUser(id);
  }

  @ResolveField(() => QuestionnaireTicketConfig)
  async settings(@Parent() { id }: QuestionnaireTicket) {
    return this.vibeCheckService.getQuestionnaireTicketConfig(id);
  }

  @Mutation(() => Boolean)
  async deleteQuestionnnaireTicket(
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.vibeCheckService.deleteQuestionnaireTicket(id);
  }
}
