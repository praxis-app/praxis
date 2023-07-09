import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { CreateEventAttendeeInput } from "./models/create-event-attendee.input";
import {
  EventAttendee,
  EventAttendeeStatus,
} from "./models/event-attendee.model";
import { UpdateEventAttendeeInput } from "./models/update-event-attendee.input";

@Injectable()
export class EventAttendeesService {
  constructor(
    @InjectRepository(EventAttendee)
    private eventAttendeeRepository: Repository<EventAttendee>
  ) {}

  async getEventAttendee(
    where: FindOptionsWhere<EventAttendee>,
    relations?: string[]
  ) {
    return this.eventAttendeeRepository.findOneOrFail({ where, relations });
  }

  async getEventAttendees(
    where?: FindOptionsWhere<EventAttendee>,
    relations?: string[]
  ) {
    return this.eventAttendeeRepository.find({
      order: { updatedAt: "DESC" },
      relations,
      where,
    });
  }

  async createEventAttendee(
    eventAttendeeData: CreateEventAttendeeInput,
    userId: number
  ) {
    const eventAttendee = await this.eventAttendeeRepository.save({
      ...eventAttendeeData,
      status: EventAttendeeStatus.Host,
      userId,
    });
    return { eventAttendee };
  }

  // TODO: Add update event attqendee payload type
  async updateEventAttendee({ id, ...eventData }: UpdateEventAttendeeInput) {
    await this.eventAttendeeRepository.update(id, eventData);
    const eventAttendee = await this.getEventAttendee({ id });
    return { eventAttendee };
  }

  async deleteEventAttendee(id: number) {
    await this.eventAttendeeRepository.delete(id);
    return true;
  }
}
