import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../comments/models/comment.model';
import { Image } from '../images/models/image.model';
import { NotificationsModule } from '../notifications/notifications.module';
import { Proposal } from '../proposals/models/proposal.model';
import { Post } from './models/post.model';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Image, Comment, Proposal]),
    NotificationsModule,
  ],
  providers: [PostsService, PostsResolver],
  exports: [PostsService],
})
export class PostsModule {}
