import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Event } from '../models/event.model';
import { CreateEventAttendeeInput } from './models/create-event-attendee.input';
import { EventAttendee } from './models/event-attendee.model';
import { UpdateEventAttendeeInput } from './models/update-event-attendee.input';

@Injectable()
export class EventAttendeesService {
  constructor(
    @InjectRepository(EventAttendee)
    private eventAttendeeRepository: Repository<EventAttendee>,

    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async getEventAttendee(
    where: FindOptionsWhere<EventAttendee>,
    relations?: string[],
  ) {
    return this.eventAttendeeRepository.findOne({ where, relations });
  }

  async getEventAttendees(
    where?: FindOptionsWhere<EventAttendee>,
    relations?: string[],
  ) {
    return this.eventAttendeeRepository.find({
      order: { updatedAt: 'DESC' },
      relations,
      where,
    });
  }

  async createEventAttendee(
    eventAttendeeData: CreateEventAttendeeInput,
    userId: number,
  ) {
    const eventAttendee = await this.eventAttendeeRepository.save({
      ...eventAttendeeData,
      userId,
    });
    const event = await this.eventRepository.findOne({
      where: { id: eventAttendee.eventId },
    });
    return { event };
  }

  async updateEventAttendee(
    { eventId, ...eventData }: UpdateEventAttendeeInput,
    userId: number,
  ) {
    await this.eventAttendeeRepository.update({ eventId, userId }, eventData);
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    return { event };
  }

  async deleteEventAttendee(eventId: number, userId: number) {
    await this.eventAttendeeRepository.delete({ eventId, userId });
    return true;
  }
}
