import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from '../comments/comments.module';
import { Image } from '../images/models/image.model';
import { Like } from '../likes/models/like.model';
import { Post } from './models/post.model';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Image, Like]),
    forwardRef(() => CommentsModule),
  ],
  providers: [PostsService, PostsResolver],
  exports: [PostsService],
})
export class PostsModule {}
