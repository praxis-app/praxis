import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { sanitizeText } from '../common/common.utils';
import { ServerConfigsService } from '../server-configs/server-configs.service';
import { User } from '../users/models/user.model';
import { Vote } from '../votes/models/vote.model';
import { AnswerQuestionsInput } from './models/answer-questions.input';
import { Answer } from './models/answer.model';
import { CreateQuestionInput } from './models/create-question.input';
import { Question } from './models/question.model';
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

    @InjectRepository(Question)
    private questionRepository: Repository<Question>,

    @InjectRepository(Answer)
    private anwersRepository: Repository<Answer>,

    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,

    private serverConfigsService: ServerConfigsService,
  ) {}

  async getServerQuestions() {
    return this.questionRepository.find({
      where: { groupId: IsNull() },
      order: { priority: 'ASC' },
    });
  }

  async getQuestionnaireTicket(questionnaireTicketId: number) {
    return this.questionnaireTicketRepository.findOneOrFail({
      where: { id: questionnaireTicketId },
    });
  }

  async getServerQuestionnaireTickets() {
    return this.questionnaireTicketRepository.find({
      where: { groupId: IsNull() },
    });
  }

  async getAnswer(where?: FindOptionsWhere<Answer>) {
    return this.anwersRepository.findOne({ where });
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

  async getQuestionnaireTicketQuestions(groupId?: number) {
    if (groupId) {
      return this.questionRepository.find({
        where: { groupId },
        order: { priority: 'ASC' },
      });
    }
    return this.getServerQuestions();
  }

  async getQuestionnaireTicketAnswers(questionnaireTicketId: number) {
    return this.anwersRepository.find({
      where: { questionnaireTicketId },
    });
  }

  async getQuestionnaireTicketVotes(questionnaireTicketId: number) {
    return this.votesRepository.find({
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

  async getQuestionnaireTicketGroup(questionnaireTicketId: number) {
    const { group } = await this.questionnaireTicketRepository.findOneOrFail({
      where: { id: questionnaireTicketId },
      relations: ['group'],
    });
    return group;
  }

  async createQuestion(questionData: CreateQuestionInput) {
    const [lowestPriorityQuestion] = await this.questionRepository.find({
      where: { groupId: questionData.groupId || IsNull() },
      order: { priority: 'DESC' },
      take: 1,
    });
    const priority = lowestPriorityQuestion
      ? lowestPriorityQuestion.priority + 1
      : 0;
    const question = await this.questionRepository.save({
      ...questionData,
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
      where: { questionnaireTicketId },
    });
    const newAnswers = answers.map((answer) => {
      const existingAnswer = existingAnswers.find(
        (a) => a.questionId === answer.questionId,
      );
      return {
        questionnaireTicketId,
        id: existingAnswer?.id,
        questionId: answer.questionId,
        text: sanitizeText(answer.text),
        userId: user.id,
      };
    });
    await this.anwersRepository.save(newAnswers);

    // Mark as submitted if all questions have been answered
    const questionCount = await this.questionRepository.count({
      where: { groupId: IsNull() },
    });
    const answerCount = await this.anwersRepository.count({
      where: { questionnaireTicketId, text: Not('') },
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
}
