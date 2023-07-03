import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventsResolver } from "./events.resolver";
import { EventsService } from "./events.service";
import { Event } from "./models/event.model";

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  providers: [EventsService, EventsResolver],
})
export class EventsModule {}
