import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as fs from "fs";
import { FileUpload } from "graphql-upload";
import {
  Between,
  FindOptionsWhere,
  In,
  LessThan,
  MoreThan,
  Repository,
} from "typeorm";
import { DEFAULT_PAGE_SIZE } from "../common/common.constants";
import { GroupPrivacy } from "../groups/group-configs/models/group-config.model";
import { randomDefaultImagePath, saveImage } from "../images/image.utils";
import { ImagesService, ImageTypes } from "../images/images.service";
import { Image } from "../images/models/image.model";
import { EventAttendeesService } from "./event-attendees/event-attendees.service";
import {
  EventAttendee,
  EventAttendeeStatus,
} from "./event-attendees/models/event-attendee.model";
import { CreateEventInput } from "./models/create-event.input";
import { Event } from "./models/event.model";
import { EventsInput, EventTimeFrame } from "./models/events.input";
import { UpdateEventInput } from "./models/update-event.input";

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,

    @InjectRepository(EventAttendee)
    private eventAttendeeRepository: Repository<EventAttendee>,

    @Inject(forwardRef(() => EventAttendeesService))
    private eventAttendeesService: EventAttendeesService,

    private imagesService: ImagesService
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

  async getFilteredEvents(
    { timeFrame, online }: EventsInput,
    inputOverride?: FindOptionsWhere<Event>
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
      order: { updatedAt: "DESC" },
      where,
    });
    const sortedEvents = events.sort(
      (a, b) => a.startsAt.getTime() - b.startsAt.getTime()
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

  async getEventsBatch(eventIds: number[]) {
    const events = await this.getEvents({
      id: In(eventIds),
    });
    return eventIds.map(
      (id) =>
        events.find((event: Event) => event.id === id) ||
        new Error(`Could not load event: ${id}`)
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
        new Error(`Could not load cover photo for event: ${id}`)
    );
    return mappedCoverPhotos;
  }

  async createEvent(
    { coverPhoto, ...eventData }: CreateEventInput,
    userId: number
  ) {
    const event = await this.eventRepository.save(eventData);
    await this.eventAttendeeRepository.save({
      status: EventAttendeeStatus.Host,
      eventId: event.id,
      userId,
    });
    if (coverPhoto) {
      await this.saveCoverPhoto(event.id, coverPhoto);
    } else {
      await this.saveDefaultCoverPhoto(event.id);
    }
    return { event };
  }

  async updateEvent({ id, coverPhoto, ...eventData }: UpdateEventInput) {
    await this.eventRepository.update(id, eventData);
    const event = await this.getEvent({ id });

    if (coverPhoto) {
      await this.saveCoverPhoto(id, coverPhoto);
    }
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

  async saveDefaultCoverPhoto(eventId: number) {
    const sourcePath = randomDefaultImagePath();
    const filename = `${Date.now()}.jpeg`;
    const copyPath = `./uploads/${filename}`;

    fs.copyFile(sourcePath, copyPath, (err) => {
      if (err) {
        throw new Error(`Failed to save default cover photo: ${err}`);
      }
    });
    const image = await this.imagesService.createImage({
      imageType: ImageTypes.CoverPhoto,
      filename,
      eventId,
    });
    return image;
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
