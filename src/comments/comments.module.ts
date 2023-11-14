import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { PostsModule } from '../posts/posts.module';
import { ProposalsModule } from '../proposals/proposals.module';
import { CommentsResolver } from './comments.resolver';
import { CommentsService } from './comments.service';
import { Comment } from './models/comment.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    forwardRef(() => ImagesModule),
    forwardRef(() => PostsModule),
    forwardRef(() => ProposalsModule),
  ],
  providers: [CommentsService, CommentsResolver],
  exports: [CommentsService],
})
export class CommentsModule {}
