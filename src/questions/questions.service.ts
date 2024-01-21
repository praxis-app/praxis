import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { sanitizeText } from '../common/common.utils';
import { Question } from './models/question.model';
import { UpdateQuestionsPriorityInput } from './models/update-questions-priority.input';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async getServerQuestions() {
    return await this.questionRepository.find({
      where: { groupId: IsNull() },
      order: { priority: 'ASC' },
    });
  }

  async createQuestion(questionData: any) {
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

  async updateQuestion({ id, text }: any) {
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
