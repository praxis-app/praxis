import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { CreateEventInput } from "./models/create-event.input";
import {
  EventAttendee,
  EventAttendeeStatus,
} from "./models/event-attendee.model";
import { Event } from "./models/event.model";

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,

    @InjectRepository(EventAttendee)
    private eventAttendeeRepository: Repository<EventAttendee>
  ) {}

  async getEvent(where: FindOptionsWhere<Event>, relations?: string[]) {
    return this.eventRepository.findOneOrFail({ where, relations });
  }

  async getEvents(where?: FindOptionsWhere<Event>, relations?: string[]) {
    return this.eventRepository.find({
      order: { updatedAt: "DESC" },
      relations,
      where,
    });
  }

  async createEvent(eventData: CreateEventInput, userId: number) {
    const event = await this.eventRepository.save(eventData);
    await this.eventAttendeeRepository.save({
      status: EventAttendeeStatus.Host,
      eventId: event.id,
      userId,
    });
    return { event };
  }
}
