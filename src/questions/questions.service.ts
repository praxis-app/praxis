import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { Comment } from '../comments/models/comment.model';
import { sanitizeText } from '../common/common.utils';
import { ImageTypes } from '../images/image.constants';
import { Image } from '../images/models/image.model';
import { Like } from '../likes/models/like.model';
import { NotificationType } from '../notifications/notifications.constants';
import { NotificationsService } from '../notifications/notifications.service';
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
import {
  QuestionnaireTicket,
  QuestionnaireTicketStatus,
} from './models/questionnaire-ticket.model';
import { ServerQuestion } from './models/server-question.model';
import { UpdateQuestionInput } from './models/update-question.input';
import { UpdateQuestionsPriorityInput } from './models/update-questions-priority.input';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(QuestionnaireTicket)
    private questionnaireTicketRepository: Repository<QuestionnaireTicket>,

    @InjectRepository(Question)
    private questionRepository: Repository<Question>,

    @InjectRepository(QuestionnaireTicketConfig)
    private questionnaireTicketConfigRepository: Repository<QuestionnaireTicketConfig>,

    @InjectRepository(ServerQuestion)
    private serverQuestionRepository: Repository<ServerQuestion>,

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

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

    private serverConfigsService: ServerConfigsService,
    private notificationsService: NotificationsService,
  ) {}

  async getServerQuestions() {
    return this.serverQuestionRepository.find({
      order: { priority: 'ASC' },
    });
  }

  async getAnswer(where?: FindOptionsWhere<Answer>) {
    return this.anwersRepository.findOne({ where });
  }

  async getAnswerUser(answerId: number) {
    const {
      question: { questionnaireTicket },
    } = await this.anwersRepository.findOneOrFail({
      where: { id: answerId },
      relations: ['question.questionnaireTicket.user'],
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

  async getQuestionnaireTickets() {
    return this.questionnaireTicketRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async getQuestionnairePrompt() {
    const { serverQuestionsPrompt } =
      await this.serverConfigsService.getServerConfig();

    return serverQuestionsPrompt;
  }

  async getQuestion(questionId: number) {
    return this.questionRepository.findOneOrFail({
      where: { id: questionId },
    });
  }

  async getQuestions(questionnaireTicketId: number) {
    return this.questionRepository.find({
      where: { questionnaireTicketId },
    });
  }

  async getQuestionCount(questionnaireTicketId: number) {
    return this.questionRepository.count({
      where: { questionnaireTicketId },
    });
  }

  async getQuestionLikes(questionId: number) {
    return this.likeRepository.find({
      where: { questionId },
    });
  }

  async getQuestionLikeCount(questionId: number) {
    return this.likeRepository.count({
      where: { questionId },
    });
  }

  async getQuestionComments(questionId: number) {
    return this.commentRepository.find({
      where: { questionId },
    });
  }

  async getQuestionCommentCount(questionId: number) {
    return this.commentRepository.count({
      where: { questionId },
    });
  }

  async getQuestionnaireTicketAnswerCount(questionnaireTicketId: number) {
    return this.anwersRepository.count({
      where: {
        question: { questionnaireTicketId },
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

  async isOwnQuestionnaireTicket(
    questionnaireTicketId: number,
    userId: number,
  ) {
    const count = await this.questionnaireTicketRepository.count({
      where: { id: questionnaireTicketId, userId },
    });
    return count > 0;
  }

  async isOwnQuestionnaireTicketComment(commentId: number, userId: number) {
    const count = await this.questionnaireTicketRepository.count({
      where: { userId, comments: { id: commentId } },
    });
    return count > 0;
  }

  async isOwnQuestionnaireTicketReviewer(userId: number, reviewerId: number) {
    const ticketCount = await this.questionnaireTicketRepository.count({
      where: {
        id: userId,
        user: { id: userId, verified: false },
      },
    });
    const userCount = await this.userRepository.count({
      where: {
        id: reviewerId,
        serverRoles: {
          permission: { manageQuestionnaireTickets: true },
        },
      },
    });
    return ticketCount > 0 && userCount > 0;
  }

  async isOwnQuestionnaireTicketReviewerAvatar(
    userId: number,
    reviewerAvatarId: number,
  ) {
    const ticketCount = await this.questionnaireTicketRepository.count({
      where: {
        user: { id: userId, verified: false },
      },
    });
    const userCount = await this.imageRepository.count({
      where: {
        id: reviewerAvatarId,
        imageType: ImageTypes.ProfilePicture,
        user: {
          serverRoles: {
            permission: { manageQuestionnaireTickets: true },
          },
        },
      },
    });
    return ticketCount > 0 && userCount > 0;
  }

  async isOwnQuestion(questionId: number, userId: number) {
    const count = await this.questionRepository.count({
      where: { id: questionId, questionnaireTicket: { userId } },
    });
    return count > 0;
  }

  async isOwnAnswer(answerId: number, userId: number) {
    const count = await this.anwersRepository.count({
      where: {
        id: answerId,
        question: {
          questionnaireTicket: { userId },
        },
      },
    });
    return count > 0;
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

  async verifyQuestionnaireTicketUser(
    questionnaireTicketId: number,
    otherUserId: number,
  ) {
    const questionnaireTicket = await this.getQuestionnaireTicket(
      questionnaireTicketId,
      ['user'],
    );
    await this.userRepository.update(questionnaireTicket.user.id, {
      verified: true,
    });
    await this.notificationsService.createNotification({
      notificationType: NotificationType.VerifyUser,
      userId: questionnaireTicket.user.id,
      otherUserId,
    });
  }

  async createQuestion({ text }: CreateQuestionInput) {
    const [lowestPriorityQuestion] = await this.serverQuestionRepository.find({
      order: { priority: 'DESC' },
      take: 1,
    });
    const priority = lowestPriorityQuestion
      ? lowestPriorityQuestion.priority + 1
      : 0;
    const question = await this.serverQuestionRepository.save({
      text: sanitizeText(text.trim()),
      priority,
    });
    return { question };
  }

  async updateQuestion({ id, text }: UpdateQuestionInput) {
    const sanitizedText = sanitizeText(text?.trim());
    await this.serverQuestionRepository.update(id, {
      text: sanitizedText,
    });
    const question = await this.serverQuestionRepository.findOneOrFail({
      where: { id },
    });
    return { question };
  }

  async updateQuestionsPriority({ questions }: UpdateQuestionsPriorityInput) {
    await this.serverQuestionRepository.save(
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
        question: {
          questionnaireTicketId,
        },
      },
    });
    const newAnswers = answers.map((answer) => {
      const existingAnswer = existingAnswers.find(
        (a) => a.questionId === answer.questionId,
      );
      return {
        id: existingAnswer?.id,
        questionId: answer.questionId,
        text: sanitizeText(answer.text),
      };
    });
    await this.anwersRepository.save(newAnswers);

    // Mark as submitted if all questions have been answered
    const questionCount = await this.serverQuestionRepository.count();
    const answerCount = await this.anwersRepository.count({
      where: {
        question: { questionnaireTicketId },
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
    const question = await this.serverQuestionRepository.findOneOrFail({
      where: { id: questionId },
      select: ['priority'],
    });

    await this.serverQuestionRepository.delete({
      id: questionId,
    });
    await this.serverQuestionRepository
      .createQueryBuilder()
      .update(ServerQuestion)
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
