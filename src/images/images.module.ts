import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { ImagesController } from './images.controller';
import { ImagesResolver } from './images.resolver';
import { ImagesService } from './images.service';
import { Image } from './models/image.model';
import { ProposalsModule } from '../proposals/proposals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Image]),
    forwardRef(() => PostsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    ProposalsModule,
  ],
  providers: [ImagesService, ImagesResolver],
  controllers: [ImagesController],
  exports: [ImagesService],
})
export class ImagesModule {}
