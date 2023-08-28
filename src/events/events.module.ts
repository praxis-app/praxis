import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImagesModule } from "../images/images.module";
import { EventsResolver } from "./events.resolver";
import { EventsService } from "./events.service";
import { EventAttendee } from "./event-attendees/models/event-attendee.model";
import { Event } from "./models/event.model";
import { EventAttendeesModule } from "./event-attendees/event-attendees.module";
import { PostsModule } from "../posts/posts.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventAttendee]),
    forwardRef(() => EventAttendeesModule),
    forwardRef(() => PostsModule),
    ImagesModule,
  ],
  providers: [EventsService, EventsResolver],
  exports: [EventsService],
})
export class EventsModule {}
