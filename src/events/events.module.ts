import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from '../images/models/image.model';
import { Post } from '../posts/models/post.model';
import { EventAttendeesModule } from './event-attendees/event-attendees.module';
import { EventsResolver } from './events.resolver';
import { EventsService } from './events.service';
import { Event } from './models/event.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Image, Post]),
    EventAttendeesModule,
  ],
  providers: [EventsService, EventsResolver],
  exports: [EventsService, TypeOrmModule],
})
export class EventsModule {}
