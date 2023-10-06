import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from '../comments/comments.module';
import { ImagesModule } from '../images/images.module';
import { LikesModule } from '../likes/likes.module';
import { Post } from './models/post.model';
import { PostsResolver } from './posts.resolver';
import { PostsService } from './posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    forwardRef(() => CommentsModule),
    forwardRef(() => LikesModule),
    ImagesModule,
  ],
  providers: [PostsService, PostsResolver],
  exports: [PostsService],
})
export class PostsModule {}
