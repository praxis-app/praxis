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
    return this.questionsService.getQuestionnaireTickets();
  }

  @ResolveField(() => String, { nullable: true })
  async prompt() {
    return this.questionsService.getQuestionnairePrompt();
  }

  @ResolveField(() => [Question])
  async questions(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestions(id);
  }

  @ResolveField(() => Int)
  async questionCount(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestionCount(id);
  }

  @ResolveField(() => Int)
  async answerCount(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketAnswerCount(id);
  }

  @ResolveField(() => [Vote])
  async votes(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketVotes(id);
  }

  @ResolveField(() => Int)
  async voteCount(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketVoteCount({
      questionnaireTicketId: id,
    });
  }

  @ResolveField(() => Int)
  async agreementVoteCount(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getQuestionnaireTicketVoteCount({
      questionnaireTicketId: id,
      voteType: VoteTypes.Agreement,
    });
  }

  @ResolveField(() => Int)
  async votesNeededToVerify(@Parent() { id }: QuestionnaireTicket) {
    return this.questionsService.getVotesNeededToVerify(id);
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
