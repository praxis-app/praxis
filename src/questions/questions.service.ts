import { Injectable } from '@nestjs/common';
import { Question } from './models/question.model';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async getServerQuestions() {
    return await this.questionRepository.find({
      where: { groupId: IsNull() },
    });
  }
}
