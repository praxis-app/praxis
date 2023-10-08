import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesController } from './images.controller';
import { ImagesResolver } from './images.resolver';
import { ImagesService } from './images.service';
import { Image } from './models/image.model';

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  providers: [ImagesService, ImagesResolver],
  controllers: [ImagesController],
  exports: [ImagesService],
})
export class ImagesModule {}
