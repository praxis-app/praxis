import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../comments/models/comment.model';
import { Image } from '../images/models/image.model';
import { Like } from '../likes/models/like.model';
import { Post } from './models/post.model';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Image, Like, Comment])],
  providers: [PostsService, PostsResolver],
  exports: [PostsService],
})
export class PostsModule {}
