import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from '../images/models/image.model';
import { Post } from '../posts/models/post.model';
import { EventsService } from './events.service';
import { EventAttendee } from './models/event-attendee.model';
import { Event } from './models/event.model';
import { EventAttendeesResolver } from './resolvers/event-attendees.resolver';
import { EventsResolver } from './resolvers/events.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventAttendee, Image, Post])],
  providers: [EventsService, EventsResolver, EventAttendeesResolver],
  exports: [EventsService, TypeOrmModule],
})
export class EventsModule {}
