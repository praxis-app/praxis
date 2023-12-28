import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import {
  Between,
  FindOptionsWhere,
  In,
  LessThan,
  MoreThan,
  Repository,
} from 'typeorm';
import { DEFAULT_PAGE_SIZE } from '../common/common.constants';
import { paginate, sanitizeText } from '../common/common.utils';
import { GroupPrivacy } from '../groups/group-configs/group-configs.constants';
import { ImageTypes } from '../images/image.constants';
import { saveImage } from '../images/image.utils';
import { ImagesService } from '../images/images.service';
import { Image } from '../images/models/image.model';
import { PostsService } from '../posts/posts.service';
import { EventAttendeesService } from './event-attendees/event-attendees.service';
import {
  EventAttendee,
  EventAttendeeStatus,
} from './event-attendees/models/event-attendee.model';
import { CreateEventInput } from './models/create-event.input';
import { Event } from './models/event.model';
import { EventsInput, EventTimeFrame } from './models/events.input';
import { UpdateEventInput } from './models/update-event.input';

type EventWithInterestedCount = Event & { interestedCount: number };
type EventWithGoingCount = Event & { goingCount: number };

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,

    @InjectRepository(EventAttendee)
    private eventAttendeeRepository: Repository<EventAttendee>,

    @Inject(forwardRef(() => EventAttendeesService))
    private eventAttendeesService: EventAttendeesService,

    @Inject(forwardRef(() => ImagesService))
    private imagesService: ImagesService,

    @Inject(forwardRef(() => PostsService))
    private postsService: PostsService,
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
    return sortedEvents.slice(0, DEFAULT_PAGE_SIZE);
  }

  async getPublicEvents(input: EventsInput) {
    return this.getFilteredEvents(input, {
      group: {
        config: { privacy: GroupPrivacy.Public },
      },
    });
  }

  async getAttendingStatus(id: number, userId: number) {
    const eventAttendee = await this.eventAttendeesService.getEventAttendee({
      eventId: id,
      userId,
    });
    return eventAttendee?.status || null;
  }

  async getEventHost(id: number) {
    const eventAttendee = await this.eventAttendeesService.getEventAttendee(
      { status: EventAttendeeStatus.Host, eventId: id },
      ['user'],
    );
    if (!eventAttendee) {
      throw new Error(`Could not find host for event: ${id}`);
    }
    return eventAttendee.user;
  }

  async getEventPosts(id: number, first = DEFAULT_PAGE_SIZE, after?: Date) {
    const posts = await this.postsService.getPosts({ event: { id } });
    return paginate(posts, first, after);
  }

  async isPublicEventImage(imageId: number) {
    const image = await this.imagesService.getImage({ id: imageId }, [
      'proposalActionEvent.proposalAction.proposal.group.config',
      'event.group.config',
    ]);
    const group =
      image?.proposalActionEvent?.proposalAction?.proposal?.group ||
      image?.event?.group;
    return group?.config.privacy === GroupPrivacy.Public;
  }

  async getEventsBatch(eventIds: number[]) {
    const events = await this.getEvents({
      id: In(eventIds),
    });
    return eventIds.map(
      (id) =>
        events.find((event: Event) => event.id === id) ||
        new Error(`Could not load event: ${id}`),
    );
  }

  async getCoverPhotosBatch(eventIds: number[]) {
    const coverPhotos = await this.imagesService.getImages({
      eventId: In(eventIds),
      imageType: ImageTypes.CoverPhoto,
    });
    const mappedCoverPhotos = eventIds.map(
      (id) =>
        coverPhotos.find((coverPhoto: Image) => coverPhoto.eventId === id) ||
        new Error(`Could not load cover photo for event: ${id}`),
    );
    return mappedCoverPhotos;
  }

  async getInterestedCountBatch(eventIds: number[]) {
    const events = (await this.eventRepository
      .createQueryBuilder('event')
      .loadRelationCountAndMap(
        'event.interestedCount',
        'event.attendees',
        'eventAttendee',
        (qb) =>
          qb.where('eventAttendee.status = :status', {
            status: EventAttendeeStatus.Interested,
          }),
      )
      .select(['event.id'])
      .whereInIds(eventIds)
      .getMany()) as EventWithInterestedCount[];

    return eventIds.map((id) => {
      const event = events.find((event: Event) => event.id === id);
      if (!event) {
        return new Error(`Could not load interested count for event: ${id}`);
      }
      return event.interestedCount;
    });
  }

  async getGoingCountBatch(eventIds: number[]) {
    const events = (await this.eventRepository
      .createQueryBuilder('event')
      .loadRelationCountAndMap(
        'event.goingCount',
        'event.attendees',
        'eventAttendee',
        (qb) =>
          qb.where('eventAttendee.status = :status', {
            status: EventAttendeeStatus.Going,
          }),
      )
      .select(['event.id'])
      .whereInIds(eventIds)
      .getMany()) as EventWithGoingCount[];

    return eventIds.map((id) => {
      const event = events.find((event: Event) => event.id === id);
      if (!event) {
        return new Error(`Could not load going count for event: ${id}`);
      }
      return event.goingCount;
    });
  }

  async createEvent({
    coverPhoto,
    description,
    externalLink,
    hostId,
    ...eventData
  }: CreateEventInput) {
    const sanitizedDescription = sanitizeText(description.trim());
    const event = await this.eventRepository.save({
      externalLink: externalLink?.trim().toLowerCase(),
      description: sanitizedDescription,
      ...eventData,
    });
    await this.eventAttendeeRepository.save({
      status: EventAttendeeStatus.Host,
      eventId: event.id,
      userId: hostId,
    });

    if (coverPhoto) {
      await this.saveCoverPhoto(event.id, coverPhoto);
    } else {
      await this.imagesService.saveDefaultCoverPhoto({ eventId: event.id });
    }

    return { event };
  }

  async updateEvent({
    id,
    coverPhoto,
    description,
    externalLink,
    hostId,
    ...eventData
  }: UpdateEventInput) {
    const sanitizedDescription = description
      ? sanitizeText(description.trim())
      : undefined;
    await this.eventRepository.update(id, {
      externalLink: externalLink?.trim().toLowerCase(),
      description: sanitizedDescription,
      ...eventData,
    });

    if (coverPhoto) {
      await this.saveCoverPhoto(id, coverPhoto);
    }

    console.log('TODO: Add update logic for hostId', hostId);

    const event = await this.getEvent({ id });
    return { event };
  }

  async saveCoverPhoto(eventId: number, coverPhoto: Promise<FileUpload>) {
    const filename = await saveImage(coverPhoto);
    await this.deleteCoverPhoto(eventId);

    return this.imagesService.createImage({
      imageType: ImageTypes.CoverPhoto,
      filename,
      eventId,
    });
  }

  async deleteCoverPhoto(id: number) {
    await this.imagesService.deleteImage({
      imageType: ImageTypes.CoverPhoto,
      event: { id },
    });
  }

  async deleteEvent(id: number) {
    await this.eventRepository.delete(id);
    return true;
  }
}
