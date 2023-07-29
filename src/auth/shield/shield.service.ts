import { Injectable } from "@nestjs/common";
import { EventsService } from "../../events/events.service";
import { CreateEventInput } from "../../events/models/create-event.input";
import { UpdateEventInput } from "../../events/models/update-event.input";

@Injectable()
export class ShieldService {
  constructor(private eventsService: EventsService) {}

  async getGroupIdFromArgs(
    args: { eventData: CreateEventInput | UpdateEventInput } | { id: number }
  ) {
    let groupId: number | undefined;

    if ("eventData" in args) {
      if ("groupId" in args.eventData) {
        groupId = args.eventData.groupId;
      }
      if ("id" in args.eventData) {
        const event = await this.eventsService.getEvent({
          id: args.eventData.id,
        });
        groupId = event.groupId;
      }
    } else {
      const event = await this.eventsService.getEvent({ id: args.id });
      groupId = event.groupId;
    }

    return groupId;
  }
}
