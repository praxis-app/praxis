import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { EventsService } from '../events.service';
import { CreateEventAttendeeInput } from './models/create-event-attendee.input';
import { EventAttendee } from './models/event-attendee.model';
import { UpdateEventAttendeeInput } from './models/update-event-attendee.input';

@Injectable()
export class EventAttendeesService {
  constructor(
    @InjectRepository(EventAttendee)
    private eventAttendeeRepository: Repository<EventAttendee>,

    @Inject(forwardRef(() => EventsService))
    private eventService: EventsService,
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
    const event = await this.eventService.getEvent({
      id: eventAttendee.eventId,
    });
    return { event };
  }

  async updateEventAttendee(
    { eventId, ...eventData }: UpdateEventAttendeeInput,
    userId: number,
  ) {
    await this.eventAttendeeRepository.update({ eventId, userId }, eventData);
    const event = await this.eventService.getEvent({ id: eventId });
    return { event };
  }

  async deleteEventAttendee(eventId: number, userId: number) {
    await this.eventAttendeeRepository.delete({ eventId, userId });
    return true;
  }
}
