import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../comments/models/comment.model';
import { Like } from '../likes/models/like.model';
import { ServerConfigsModule } from '../server-configs/server-configs.module';
import { Vote } from '../votes/models/vote.model';
import { Answer } from './models/answer.model';
import { Question } from './models/question.model';
import { QuestionnaireTicketConfig } from './models/questionnaire-ticket-config.model';
import { QuestionnaireTicket } from './models/questionnaire-ticket.model';
import { QuestionsService } from './questions.service';
import { AnswersResolver } from './resolvers/answers.resolver';
import { QuestionnnaireTicketQuestionsResolver } from './resolvers/questionnaire-ticket-questions.resolver';
import { QuestionnaireTicketsResolver } from './resolvers/questionnaire-tickets.resolver';
import { QuestionsResolver } from './resolvers/questions.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionnaireTicket,
      QuestionnaireTicketConfig,
      Question,
      Answer,
      Comment,
      Like,
      Vote,
    ]),
    ServerConfigsModule,
  ],
  providers: [
    AnswersResolver,
    QuestionnaireTicketsResolver,
    QuestionnnaireTicketQuestionsResolver,
    QuestionsResolver,
    QuestionsService,
  ],
  exports: [QuestionsService],
})
export class QuestionsModule {}
