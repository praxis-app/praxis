import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from '../comments/comments.module';
import { LikesModule } from '../likes/likes.module';
import { Post } from './models/post.model';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';
import { Image } from '../images/models/image.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Image]),
    forwardRef(() => CommentsModule),
    forwardRef(() => LikesModule),
  ],
  providers: [PostsService, PostsResolver],
  exports: [PostsService],
})
export class PostsModule {}
