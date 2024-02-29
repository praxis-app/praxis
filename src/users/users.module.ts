import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from '../images/models/image.model';
import { NotificationsModule } from '../notifications/notifications.module';
import { Post } from '../posts/models/post.model';
import { PostsModule } from '../posts/posts.module';
import { Proposal } from '../proposals/models/proposal.model';
import { ServerQuestion } from '../vibe-check/models/server-question.model';
import { QuestionnaireTicket } from '../vibe-check/models/questionnaire-ticket.model';
import { ServerConfigsModule } from '../server-configs/server-configs.module';
import { ServerRolesModule } from '../server-roles/server-roles.module';
import { User } from './models/user.model';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Image,
      Post,
      Proposal,
      ServerQuestion,
      QuestionnaireTicket,
      User,
    ]),
    NotificationsModule,
    ServerRolesModule,
    ServerConfigsModule,
    PostsModule,
  ],
  providers: [UsersService, UsersResolver],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
