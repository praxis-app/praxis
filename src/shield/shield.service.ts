import { Injectable } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { CreateEventInput } from '../events/models/create-event.input';
import { UpdateEventInput } from '../events/models/update-event.input';

@Injectable()
export class ShieldService {
  constructor(private eventsService: EventsService) {}

  async getGroupIdFromEventArgs(
    eventArgs:
      | { eventData: CreateEventInput | UpdateEventInput }
      | { id: number },
  ) {
    if ('id' in eventArgs) {
      const event = await this.eventsService.getEvent({ id: eventArgs.id });
      return event.groupId;
    }
    if ('id' in eventArgs.eventData) {
      const event = await this.eventsService.getEvent({
        id: eventArgs.eventData.id,
      });
      return event.groupId;
    }
    return eventArgs.eventData.groupId;
  }
}
