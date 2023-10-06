import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesModule } from '../images/images.module';
import { PostsModule } from '../posts/posts.module';
import { EventAttendeesModule } from './event-attendees/event-attendees.module';
import { EventsResolver } from './events.resolver';
import { EventsService } from './events.service';
import { Event } from './models/event.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    forwardRef(() => EventAttendeesModule),
    forwardRef(() => PostsModule),
    ImagesModule,
  ],
  providers: [EventsService, EventsResolver],
  exports: [EventsService, TypeOrmModule],
})
export class EventsModule {}
