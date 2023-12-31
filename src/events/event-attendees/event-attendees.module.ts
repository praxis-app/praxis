import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../models/event.model';
import { EventAttendeesResolver } from './event-attendees.resolver';
import { EventAttendeesService } from './event-attendees.service';
import { EventAttendee } from './models/event-attendee.model';

@Module({
  imports: [TypeOrmModule.forFeature([EventAttendee, Event])],
  providers: [EventAttendeesService, EventAttendeesResolver],
  exports: [EventAttendeesService, TypeOrmModule],
})
export class EventAttendeesModule {}
