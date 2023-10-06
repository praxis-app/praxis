import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from '../posts/posts.module';
import { LikesResolver } from './likes.resolver';
import { LikesService } from './likes.service';
import { Like } from './models/like.model';

@Module({
  imports: [TypeOrmModule.forFeature([Like]), forwardRef(() => PostsModule)],
  providers: [LikesService, LikesResolver],
  exports: [LikesService],
})
export class LikesModule {}
