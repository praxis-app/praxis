import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../comments/models/comment.model';
import { Like } from '../likes/models/like.model';
import { ServerConfigsModule } from '../server-configs/server-configs.module';
import { User } from '../users/models/user.model';
import { Vote } from '../votes/models/vote.model';
import { Answer } from './models/answer.model';
import { ServerQuestion } from './models/question.model';
import { QuestionnaireTicketConfig } from './models/questionnaire-ticket-config.model';
import { QuestionnaireTicketQuestion } from './models/questionnaire-ticket-question.model';
import { QuestionnaireTicket } from './models/questionnaire-ticket.model';
import { QuestionsService } from './questions.service';
import { AnswersResolver } from './resolvers/answers.resolver';
import { QuestionnnaireTicketQuestionsResolver } from './resolvers/questionnaire-ticket-questions.resolver';
import { QuestionnaireTicketsResolver } from './resolvers/questionnaire-tickets.resolver';
import { ServerQuestionsResolver } from './resolvers/server-questions.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Answer,
      Comment,
      Like,
      ServerQuestion,
      QuestionnaireTicket,
      QuestionnaireTicketConfig,
      QuestionnaireTicketQuestion,
      User,
      Vote,
    ]),
    ServerConfigsModule,
  ],
  providers: [
    AnswersResolver,
    ServerQuestionsResolver,
    QuestionnaireTicketsResolver,
    QuestionnnaireTicketQuestionsResolver,
    QuestionsService,
  ],
  exports: [QuestionsService],
})
export class QuestionsModule {}
