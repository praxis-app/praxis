import { Module } from "@nestjs/common";
import { EventsResolver } from "./events.resolver";
import { EventsService } from "./events.service";

@Module({
  providers: [EventsService, EventsResolver],
})
export class EventsModule {}
