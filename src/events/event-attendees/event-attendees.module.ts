/**
 * TODO: Determine whether this module is necessary or whether
 * it can be merged with the events module
 */

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventAttendeesResolver } from "./event-attendees.resolver";
import { EventAttendeesService } from "./event-attendees.service";
import { EventAttendee } from "./models/event-attendee.model";

@Module({
  imports: [TypeOrmModule.forFeature([EventAttendee])],
  providers: [EventAttendeesService, EventAttendeesResolver],
})
export class EventAttendeesModule {}
