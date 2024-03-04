import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../comments/models/comment.model';
import { NotificationsModule } from '../notifications/notifications.module';
import { Post } from '../posts/models/post.model';
import { Question } from '../vibe-check/models/question.model';
import { LikesResolver } from './likes.resolver';
import { LikesService } from './likes.service';
import { Like } from './models/like.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Comment, Like, Post]),
    NotificationsModule,
  ],
  providers: [LikesService, LikesResolver],
  exports: [LikesService],
})
export class LikesModule {}
