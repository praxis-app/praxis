import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { Comment } from '../comments/models/comment.model';
import { sanitizeText } from '../common/common.utils';
import { Like } from '../likes/models/like.model';
import { ServerConfigsService } from '../server-configs/server-configs.service';
import { User } from '../users/models/user.model';
import { Vote } from '../votes/models/vote.model';
import { AnswerQuestionsInput } from './models/answer-questions.input';
import { Answer } from './models/answer.model';
import { CreateQuestionInput } from './models/create-question.input';
import { Question } from './models/question.model';
import { QuestionnaireTicketConfig } from './models/questionnaire-ticket-config.model';
import {
  QuestionnaireTicket,
  QuestionnaireTicketStatus,
} from './models/questionnaire-ticket.model';
import { UpdateQuestionInput } from './models/update-question.input';
import { UpdateQuestionsPriorityInput } from './models/update-questions-priority.input';
import { QuestionnaireTicketQuestion } from './models/questionnaire-ticket-question.model';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(QuestionnaireTicket)
    private questionnaireTicketRepository: Repository<QuestionnaireTicket>,

    @InjectRepository(QuestionnaireTicketQuestion)
    private questionnaireTicketQuestionRepository: Repository<QuestionnaireTicketQuestion>,

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

    @InjectRepository(QuestionnaireTicketConfig)
    private questionnaireTicketConfigRepository: Repository<QuestionnaireTicketConfig>,

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

  async getAnswerLikes(answerId: number) {
    return this.likeRepository.find({
      where: { answerId },
    });
  }

  async getAnswerLikeCount(answerId: number) {
    return this.likeRepository.count({
      where: { answerId },
    });
  }

  async getAnswerComments(answerId: number) {
    return this.commentRepository.find({
      where: { answerId },
    });
  }

  async getAnswerCommentCount(answerId: number) {
    return this.commentRepository.count({
      where: { answerId },
    });
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

  async getQuestionnaireTicket(questionnaireTicketId: number) {
    return this.questionnaireTicketRepository.findOneOrFail({
      where: { id: questionnaireTicketId },
    });
  }

  async getServerQuestionnaireTickets() {
    return this.questionnaireTicketRepository.find({
      where: { groupId: IsNull() },
      order: { createdAt: 'DESC' },
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

  async getQuestionnaireTicketQuestion(questionnaireTicketId: number) {
    return this.questionnaireTicketQuestionRepository.findOne({
      where: { questionnaireTicketId },
    });
  }

  async getQuestionnaireTicketQuestions(groupId?: number) {
    if (groupId) {
      return this.questionRepository.find({
        where: { groupId },
        order: { priority: 'ASC' },
      });
    }
    return this.getServerQuestions();
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

  async getQuestionnaireTicketVoteCount(questionnaireTicketId: number) {
    return this.votesRepository.count({
      where: { questionnaireTicketId },
    });
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
