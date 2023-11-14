import { Module, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';
import { ImagesController } from './images.controller';
import { ImagesResolver } from './images.resolver';
import { ImagesService } from './images.service';
import { Image } from './models/image.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Image]),
    forwardRef(() => PostsModule),
    forwardRef(() => UsersModule),
  ],
  providers: [ImagesService, ImagesResolver, JwtService],
  controllers: [ImagesController],
  exports: [ImagesService],
})
export class ImagesModule {}
