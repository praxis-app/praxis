import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from '../events.module';
import { EventAttendeesResolver } from './event-attendees.resolver';
import { EventAttendeesService } from './event-attendees.service';
import { EventAttendee } from './models/event-attendee.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventAttendee]),
    forwardRef(() => EventsModule),
  ],
  providers: [EventAttendeesService, EventAttendeesResolver],
  exports: [EventAttendeesService, TypeOrmModule],
})
export class EventAttendeesModule {}
