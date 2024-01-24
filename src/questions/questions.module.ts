import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from '../votes/models/vote.model';
import { Answer } from './models/answer.model';
import { Question } from './models/question.model';
import { QuestionnaireTicket } from './models/questionnaire-ticket.model';
import { QuestionsService } from './questions.service';
import { QuestionnaireTicketsResolver } from './resolvers/questionnaire-tickets.resolver';
import { QuestionsResolver } from './resolvers/questions.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestionnaireTicket, Question, Answer, Vote]),
  ],
  providers: [
    QuestionnaireTicketsResolver,
    QuestionsResolver,
    QuestionsService,
  ],
})
export class QuestionsModule {}
