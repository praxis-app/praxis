import { Injectable } from "@nestjs/common";
import { EventsService } from "../../events/events.service";
import { CreateEventInput } from "../../events/models/create-event.input";
import { UpdateEventInput } from "../../events/models/update-event.input";

@Injectable()
export class ShieldService {
  constructor(private eventsService: EventsService) {}

  async getGroupIdFromEventArgs(
    eventArgs:
      | { eventData: CreateEventInput | UpdateEventInput }
      | { id: number }
  ) {
    let groupId: number | undefined;

    if ("eventData" in eventArgs) {
      if ("groupId" in eventArgs.eventData) {
        groupId = eventArgs.eventData.groupId;
      }
      if ("id" in eventArgs.eventData) {
        const event = await this.eventsService.getEvent({
          id: eventArgs.eventData.id,
        });
        groupId = event.groupId;
      }
    } else {
      const event = await this.eventsService.getEvent({ id: eventArgs.id });
      groupId = event.groupId;
    }

    return groupId;
  }
}
