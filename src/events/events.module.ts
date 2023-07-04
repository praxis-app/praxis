import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImagesModule } from "../images/images.module";
import { EventsResolver } from "./events.resolver";
import { EventsService } from "./events.service";
import { EventAttendee } from "./models/event-attendee.model";
import { Event } from "./models/event.model";

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventAttendee]), ImagesModule],
  providers: [EventsService, EventsResolver],
})
export class EventsModule {}
