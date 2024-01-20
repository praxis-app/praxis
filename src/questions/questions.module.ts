import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Answer } from './models/answer.model';
import { Question } from './models/question.model';
import { QuestionsResolver } from './questions.resolver';
import { QuestionsService } from './questions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Answer])],
  providers: [QuestionsService, QuestionsResolver],
})
export class QuestionsModule {}
