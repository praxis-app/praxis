import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { Comment } from '../comments/models/comment.model';
import { sanitizeText } from '../common/common.utils';
import { Like } from '../likes/models/like.model';
import { DecisionMakingModel } from '../proposals/proposals.constants';
import { ServerConfigsService } from '../server-configs/server-configs.service';
import { User } from '../users/models/user.model';
import { Vote } from '../votes/models/vote.model';
import {
  sortConsensusVotesByType,
  sortMajorityVotesByType,
} from '../votes/votes.utils';
import { AnswerQuestionsInput } from './models/answer-questions.input';
import { Answer } from './models/answer.model';
import { CreateQuestionInput } from './models/create-question.input';
import { Question } from './models/question.model';
import { QuestionnaireTicketConfig } from './models/questionnaire-ticket-config.model';
import { QuestionnaireTicketQuestion } from './models/questionnaire-ticket-question.model';
import {
  QuestionnaireTicket,
  QuestionnaireTicketStatus,
} from './models/questionnaire-ticket.model';
import { UpdateQuestionInput } from './models/update-question.input';
import { UpdateQuestionsPriorityInput } from './models/update-questions-priority.input';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(QuestionnaireTicket)
    private questionnaireTicketRepository: Repository<QuestionnaireTicket>,

    @InjectRepository(QuestionnaireTicketQuestion)
    private questionnaireTicketQuestionRepository: Repository<QuestionnaireTicketQuestion>,

    @InjectRepository(QuestionnaireTicketConfig)
    private questionnaireTicketConfigRepository: Repository<QuestionnaireTicketConfig>,

    @InjectRepository(Question)
    private questionRepository: Repository<Question>,

    @InjectRepository(Answer)
    private anwersRepository: Repository<Answer>,

    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,

    @InjectRepository(Like)
    private likeRepository: Repository<Like>,

    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private serverConfigsService: ServerConfigsService,
  ) {}

  async getServerQuestions() {
    return this.questionRepository.find({
      where: { groupId: IsNull() },
      order: { priority: 'ASC' },
    });
  }

  async getAnswer(where?: FindOptionsWhere<Answer>) {
    return this.anwersRepository.findOne({ where });
  }

  async getAnswerUser(answerId: number) {
    const {
      questionnaireTicketQuestion: { questionnaireTicket },
    } = await this.anwersRepository.findOneOrFail({
      where: { id: answerId },
      relations: ['questionnaireTicketQuestion.questionnaireTicket.user'],
    });
    return questionnaireTicket.user;
  }

  async getQuestionnaireTicket(
    questionnaireTicketId: number,
    relations?: string[],
  ) {
    return this.questionnaireTicketRepository.findOneOrFail({
      where: { id: questionnaireTicketId },
      relations,
    });
  }

  async getServerQuestionnaireTickets() {
    return this.questionnaireTicketRepository.find({
      where: { groupId: IsNull() },
      order: { createdAt: 'ASC' },
    });
  }

  // TODO: Add support for group questions
  async getQuestionnairePrompt(groupId?: number) {
    if (groupId) {
      throw new Error('Group questions are not supported yet');
    }
    const { serverQuestionsPrompt } =
      await this.serverConfigsService.getServerConfig();

    return serverQuestionsPrompt;
  }

  async getQuestionnaireTicketQuestion(questionnaireTicketQuestionId: number) {
    return this.questionnaireTicketQuestionRepository.findOneOrFail({
      where: { id: questionnaireTicketQuestionId },
    });
  }

  async getQuestionnaireTicketQuestions(questionnaireTicketId: number) {
    return this.questionnaireTicketQuestionRepository.find({
      where: { questionnaireTicketId },
    });
  }

  async getQuestionnaireTicketQuestionCount(questionnaireTicketId: number) {
    return this.questionnaireTicketQuestionRepository.count({
      where: { questionnaireTicketId },
    });
  }

  async getQuestionnaireTicketQuestionLikes(
    questionnaireTicketQuestionId: number,
  ) {
    return this.likeRepository.find({
      where: { questionnaireTicketQuestionId },
    });
  }

  async getQuestionnaireTicketQuestionLikeCount(
    questionnaireTicketQuestionId: number,
  ) {
    return this.likeRepository.count({
      where: { questionnaireTicketQuestionId },
    });
  }

  async getQuestionnaireTicketQuestionComments(
    questionnaireTicketQuestionId: number,
  ) {
    return this.commentRepository.find({
      where: { questionnaireTicketQuestionId },
    });
  }

  async getQuestionnaireTicketQuestionCommentCount(
    questionnaireTicketQuestionId: number,
  ) {
    return this.commentRepository.count({
      where: { questionnaireTicketQuestionId },
    });
  }

  async getQuestionnaireTicketAnswerCount(questionnaireTicketId: number) {
    return this.anwersRepository.count({
      where: {
        questionnaireTicketQuestion: { questionnaireTicketId },
        text: Not(''),
      },
    });
  }

  async getQuestionnaireTicketVote(
    questionnaireTicketId: number,
    userId: number,
  ) {
    return this.votesRepository.findOne({
      where: { questionnaireTicketId, userId },
    });
  }

  async getQuestionnaireTicketVotes(questionnaireTicketId: number) {
    return this.votesRepository.find({
      where: { questionnaireTicketId },
    });
  }

  async getQuestionnaireTicketVoteCount(where?: FindOptionsWhere<Vote>) {
    return this.votesRepository.count({ where });
  }

  async getVotesNeededToVerify(questionnaireTicketId: number) {
    const { ratificationThreshold } = await this.getQuestionnaireTicketConfig(
      questionnaireTicketId,
    );
    const usersWithAccessCount = await this.userRepository.count({
      where: {
        serverRoles: {
          permission: { manageQuestionnaireTickets: true },
        },
      },
    });
    return Math.ceil(usersWithAccessCount * (ratificationThreshold * 0.01));
  }

  async getQuestionnaireTicketComments(questionnaireTicketId: number) {
    return this.commentRepository.find({
      where: { questionnaireTicketId },
    });
  }

  async getQuestionnaireTicketCommentCount(questionnaireTicketId: number) {
    return this.commentRepository.count({
      where: { questionnaireTicketId },
    });
  }

  async getQuestionnaireTicketUser(questionnaireTicketId: number) {
    const { user } = await this.questionnaireTicketRepository.findOneOrFail({
      where: { id: questionnaireTicketId },
      relations: ['user'],
    });
    return user;
  }

  async getQuestionnaireTicketConfig(questionnaireTicketId: number) {
    const config = await this.questionnaireTicketConfigRepository.findOneOrFail(
      {
        where: { questionnaireTicketId },
      },
    );
    return config;
  }

  async getQuestionnaireTicketGroup(questionnaireTicketId: number) {
    const { group } = await this.questionnaireTicketRepository.findOneOrFail({
      where: { id: questionnaireTicketId },
      relations: ['group'],
    });
    return group;
  }

  async isServerQuestionnaireTicket(questionnaireTicketId: number) {
    const count = await this.questionnaireTicketRepository.count({
      where: {
        id: questionnaireTicketId,
        groupId: IsNull(),
      },
    });
    return count > 0;
  }

  async isQuestionnaireTicketVerifiable(questionnaireTicketId: number) {
    const { status, config, votes } = await this.getQuestionnaireTicket(
      questionnaireTicketId,
      ['config', 'votes'],
    );
    if (status !== QuestionnaireTicketStatus.Submitted) {
      return false;
    }
    const usersWithAccessCount = await this.userRepository.count({
      where: {
        serverRoles: {
          permission: { manageQuestionnaireTickets: true },
        },
      },
    });

    if (config.decisionMakingModel === DecisionMakingModel.MajorityVote) {
      return this.hasMajorityVote(votes, config, usersWithAccessCount);
    }
    if (config.decisionMakingModel === DecisionMakingModel.Consensus) {
      return this.hasConsensus(votes, config, usersWithAccessCount);
    }
    return false;
  }

  async hasConsensus(
    votes: Vote[],
    {
      ratificationThreshold,
      reservationsLimit,
      standAsidesLimit,
      closingAt,
    }: QuestionnaireTicketConfig,
    usersWithAccessCount: number,
  ) {
    if (closingAt && Date.now() < Number(closingAt)) {
      return false;
    }

    const { agreements, reservations, standAsides, blocks } =
      sortConsensusVotesByType(votes);

    return (
      agreements.length >=
        usersWithAccessCount * (ratificationThreshold * 0.01) &&
      reservations.length <= reservationsLimit &&
      standAsides.length <= standAsidesLimit &&
      blocks.length === 0
    );
  }

  async hasMajorityVote(
    votes: Vote[],
    { ratificationThreshold, closingAt }: QuestionnaireTicketConfig,
    usersWithAccessCount: number,
  ) {
    if (closingAt && Date.now() < Number(closingAt)) {
      return false;
    }
    const { agreements } = sortMajorityVotesByType(votes);

    return (
      agreements.length >= usersWithAccessCount * (ratificationThreshold * 0.01)
    );
  }

  async approveQuestionnaireTicket(questionnaireTicketId: number) {
    await this.questionnaireTicketRepository.update(questionnaireTicketId, {
      status: QuestionnaireTicketStatus.Approved,
    });
  }

  async denyQuestionnaireTicket(questionnaireTicketId: number) {
    await this.questionnaireTicketRepository.update(questionnaireTicketId, {
      status: QuestionnaireTicketStatus.Denied,
    });
  }

  async verifyQuestionnaireTicketUser(questionnaireTicketId: number) {
    const questionnaireTicket = await this.getQuestionnaireTicket(
      questionnaireTicketId,
      ['user'],
    );
    await this.userRepository.update(questionnaireTicket.user.id, {
      verified: true,
    });
  }

  async createQuestion({ text, groupId }: CreateQuestionInput) {
    const [lowestPriorityQuestion] = await this.questionRepository.find({
      where: { groupId: groupId || IsNull() },
      order: { priority: 'DESC' },
      take: 1,
    });
    const priority = lowestPriorityQuestion
      ? lowestPriorityQuestion.priority + 1
      : 0;
    const question = await this.questionRepository.save({
      text: sanitizeText(text.trim()),
      priority,
    });
    return { question };
  }

  async updateQuestion({ id, text }: UpdateQuestionInput) {
    const sanitizedText = sanitizeText(text?.trim());
    await this.questionRepository.update(id, {
      text: sanitizedText,
    });
    const question = await this.questionRepository.findOneOrFail({
      where: { id },
    });
    return { question };
  }

  async updateQuestionsPriority({ questions }: UpdateQuestionsPriorityInput) {
    await this.questionRepository.save(
      questions.map(({ id, priority }) => ({ id, priority })),
    );
    return true;
  }

  async answerQuestions(
    { questionnaireTicketId, answers, isSubmitting }: AnswerQuestionsInput,
    user: User,
  ) {
    const hasEmptyAnswers = answers.some((answer) => !answer.text.trim());
    if (isSubmitting && hasEmptyAnswers) {
      throw new Error('Empty answers are not allowed');
    }

    const count = await this.questionnaireTicketRepository.count({
      where: { id: questionnaireTicketId, userId: user.id },
    });
    if (!count) {
      throw new Error('Questionnaire ticket not found');
    }

    const existingAnswers = await this.anwersRepository.find({
      where: {
        questionnaireTicketQuestion: {
          questionnaireTicketId,
        },
      },
    });
    const newAnswers = answers.map((answer) => {
      const existingAnswer = existingAnswers.find(
        (a) =>
          a.questionnaireTicketQuestionId ===
          answer.questionnaireTicketQuestionId,
      );
      return {
        id: existingAnswer?.id,
        questionnaireTicketQuestionId: answer.questionnaireTicketQuestionId,
        text: sanitizeText(answer.text),
      };
    });
    await this.anwersRepository.save(newAnswers);

    // Mark as submitted if all questions have been answered
    const questionCount = await this.questionRepository.count({
      where: { groupId: IsNull() },
    });
    const answerCount = await this.anwersRepository.count({
      where: {
        questionnaireTicketQuestion: { questionnaireTicketId },
        text: Not(''),
      },
    });
    if (questionCount === answerCount && isSubmitting) {
      await this.questionnaireTicketRepository.update(questionnaireTicketId, {
        status: QuestionnaireTicketStatus.Submitted,
      });
    }

    const questionnaireTicket =
      await this.questionnaireTicketRepository.findOneOrFail({
        where: { id: questionnaireTicketId },
      });

    return { questionnaireTicket };
  }

  // TODO: Add support for group questions
  async deleteQuestion(questionId: number) {
    const question = await this.questionRepository.findOneOrFail({
      where: { id: questionId },
      select: ['priority'],
    });

    await this.questionRepository.delete({
      id: questionId,
    });
    await this.questionRepository
      .createQueryBuilder()
      .update(Question)
      .set({ priority: () => 'priority - 1' })
      .where('priority > :priority', { priority: question.priority })
      .execute();

    return true;
  }

  async deleteQuestionnaireTicket(questionnaireTicketId: number) {
    await this.questionnaireTicketRepository.delete({
      id: questionnaireTicketId,
    });
    return true;
  }
}
