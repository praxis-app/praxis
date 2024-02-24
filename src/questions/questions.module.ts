import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../comments/models/comment.model';
import { Image } from '../images/models/image.model';
import { Like } from '../likes/models/like.model';
import { NotificationsModule } from '../notifications/notifications.module';
import { ServerConfigsModule } from '../server-configs/server-configs.module';
import { User } from '../users/models/user.model';
import { Vote } from '../votes/models/vote.model';
import { Answer } from './models/answer.model';
import { Question } from './models/question.model';
import { QuestionnaireTicketConfig } from './models/questionnaire-ticket-config.model';
import { QuestionnaireTicket } from './models/questionnaire-ticket.model';
import { ServerQuestion } from './models/server-question.model';
import { QuestionsService } from './questions.service';
import { AnswersResolver } from './resolvers/answers.resolver';
import { QuestionnaireTicketsResolver } from './resolvers/questionnaire-tickets.resolver';
import { QuestionsResolver } from './resolvers/questions.resolver';
import { ServerQuestionsResolver } from './resolvers/server-questions.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Answer,
      Comment,
      Image,
      Like,
      Question,
      QuestionnaireTicket,
      QuestionnaireTicketConfig,
      ServerQuestion,
      User,
      Vote,
    ]),
    NotificationsModule,
    ServerConfigsModule,
  ],
  providers: [
    AnswersResolver,
    QuestionnaireTicketsResolver,
    QuestionsResolver,
    QuestionsService,
    ServerQuestionsResolver,
  ],
  exports: [QuestionsService],
})
export class QuestionsModule {}
