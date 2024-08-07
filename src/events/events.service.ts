import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import {
  Between,
  FindOptionsWhere,
  LessThan,
  MoreThan,
  Repository,
} from 'typeorm';
import { PageSize } from '../common/common.constants';
import { normalizeText, paginate, sanitizeText } from '../common/common.utils';
import { GroupPrivacy } from '../groups/groups.constants';
import { ImageTypes } from '../images/image.constants';
import {
  deleteImageFile,
  saveDefaultImage,
  saveImage,
} from '../images/image.utils';
import { Image } from '../images/models/image.model';
import { Post } from '../posts/models/post.model';
import { CreateEventAttendeeInput } from './models/create-event-attendee.input';
import { CreateEventInput } from './models/create-event.input';
import {
  EventAttendee,
  EventAttendeeStatus,
} from './models/event-attendee.model';
import { Event } from './models/event.model';
import { EventTimeFrame, EventsInput } from './models/events.input';
import { UpdateEventAttendeeInput } from './models/update-event-attendee.input';
import { UpdateEventInput } from './models/update-event.input';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,

    @InjectRepository(EventAttendee)
    private eventAttendeeRepository: Repository<EventAttendee>,

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async getEvent(where: FindOptionsWhere<Event>, relations?: string[]) {
    return this.eventRepository.findOneOrFail({ where, relations });
  }

  async getEvents(where?: FindOptionsWhere<Event>, relations?: string[]) {
    return this.eventRepository.find({
      order: { updatedAt: 'DESC' },
      relations,
      where,
    });
  }

  async getFilteredEvents(
    { timeFrame, online }: EventsInput,
    inputOverride?: FindOptionsWhere<Event>,
  ) {
    const where: FindOptionsWhere<Event> = { online, ...inputOverride };
    const now = new Date();

    if (timeFrame === EventTimeFrame.Past) {
      where.startsAt = LessThan(now);
    }
    if (timeFrame === EventTimeFrame.Future) {
      where.startsAt = MoreThan(now);
    }
    if (timeFrame === EventTimeFrame.ThisWeek) {
      const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      where.startsAt = Between(now, oneWeekFromNow);
    }

    const events = await this.eventRepository.find({
      order: { updatedAt: 'DESC' },
      where,
    });
    const sortedEvents = events.sort(
      (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
    );
    return sortedEvents.slice(0, PageSize.Default);
  }

  async getPublicEvents(input: EventsInput) {
    return this.getFilteredEvents(input, {
      group: {
        config: { privacy: GroupPrivacy.Public },
      },
    });
  }

  async getAttendingStatus(id: number, userId: number) {
    const eventAttendee = await this.getEventAttendee({
      eventId: id,
      userId,
    });
    return eventAttendee?.status || null;
  }

  async getEventHost(id: number) {
    const eventAttendee = await this.getEventAttendee(
      { status: EventAttendeeStatus.Host, eventId: id },
      ['user'],
    );
    return eventAttendee?.user;
  }

  async getEventPosts(id: number, offset?: number, limit?: number) {
    const posts = await this.postRepository.find({ where: { event: { id } } });
    if (offset !== undefined) {
      return paginate(posts, offset, limit);
    }
    return posts;
  }

  async getEventPostsCount(id: number) {
    return this.postRepository.count({ where: { event: { id } } });
  }

  async isPublicEventImage(imageId: number) {
    const image = await this.imageRepository.findOneOrFail({
      where: { id: imageId },
      relations: [
        'proposalActionEvent.proposalAction.proposal.group.config',
        'event.group.config',
      ],
    });
    const group =
      image.proposalActionEvent?.proposalAction?.proposal?.group ||
      image.event?.group;
    return group?.config.privacy === GroupPrivacy.Public;
  }

  async createEvent({
    name,
    coverPhoto,
    description,
    location,
    externalLink,
    hostId,
    ...eventData
  }: CreateEventInput) {
    const sanitizedName = sanitizeText(name);
    const sanitizedDescription = sanitizeText(description);
    const sanitizedLocation = sanitizeText(location);
    const normalizedExternalLink = normalizeText(externalLink);

    if (sanitizedName.length < 5) {
      throw new Error('Event name must be at least 5 characters');
    }
    if (sanitizedName.length > 25) {
      throw new Error('Event name cannot exceed 25 characters');
    }
    if (!sanitizedDescription) {
      throw new Error('Event description is required');
    }
    if (sanitizedDescription.length > 1000) {
      throw new Error('Event description cannot exceed 1000 characters');
    }
    if (normalizedExternalLink.length > 2048) {
      throw new Error('Event external link cannot exceed 2048 characters');
    }
    if (sanitizedLocation.length > 255) {
      throw new Error('Event location cannot exceed 255 characters');
    }

    const event = await this.eventRepository.save({
      externalLink: normalizedExternalLink,
      description: sanitizedDescription,
      location: sanitizedLocation,
      name: sanitizedName,
      ...eventData,
    });
    await this.eventAttendeeRepository.save({
      status: EventAttendeeStatus.Host,
      eventId: event.id,
      userId: hostId,
    });

    if (coverPhoto) {
      await this.saveEventCoverPhoto(event.id, coverPhoto);
    } else {
      await this.saveDefaultEventCoverPhoto(event.id);
    }

    return { event };
  }

  async updateEvent({
    id,
    name,
    coverPhoto,
    description,
    externalLink,
    location,
    hostId,
    ...eventData
  }: UpdateEventInput) {
    const sanitizedName = sanitizeText(name);
    const sanitizedDescription = sanitizeText(description);
    const sanitizedLocation = sanitizeText(location);
    const normalizedExternalLink = normalizeText(externalLink);

    if (name && sanitizedName.length < 5) {
      throw new Error('Event name must be at least 5 characters');
    }
    if (sanitizedName.length > 25) {
      throw new Error('Event name cannot exceed 25 characters');
    }
    if (typeof description !== 'undefined' && !sanitizedDescription) {
      throw new Error('Event description is required');
    }
    if (sanitizedDescription.length > 1000) {
      throw new Error('Event description cannot exceed 1000 characters');
    }
    if (normalizedExternalLink.length > 2048) {
      throw new Error('Event external link cannot exceed 2048 characters');
    }
    if (sanitizedLocation.length > 255) {
      throw new Error('Event location cannot exceed 255 characters');
    }

    await this.eventRepository.update(id, {
      externalLink: normalizedExternalLink,
      description: sanitizedDescription,
      location: sanitizedLocation,
      name: sanitizedName,
      ...eventData,
    });

    if (coverPhoto) {
      await this.saveEventCoverPhoto(id, coverPhoto);
    }

    console.log('TODO: Add update logic for hostId', hostId);

    const event = await this.getEvent({ id });
    return { event };
  }

  async saveEventCoverPhoto(eventId: number, coverPhoto: Promise<FileUpload>) {
    const filename = await saveImage(coverPhoto);
    await this.deleteEventCoverPhoto(eventId);

    return this.imageRepository.save({
      imageType: ImageTypes.CoverPhoto,
      filename,
      eventId,
    });
  }

  async saveDefaultEventCoverPhoto(eventId: number) {
    const filename = await saveDefaultImage();
    return this.imageRepository.save({
      imageType: ImageTypes.CoverPhoto,
      filename,
      eventId,
    });
  }

  async deleteEventCoverPhoto(eventId: number) {
    const image = await this.imageRepository.findOne({
      where: { imageType: ImageTypes.CoverPhoto, eventId },
    });
    if (!image) {
      return;
    }
    await deleteImageFile(image.filename);
    this.imageRepository.delete({ imageType: ImageTypes.CoverPhoto, eventId });
    return true;
  }

  async deleteEvent(id: number) {
    await this.eventRepository.delete(id);
    return true;
  }

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
