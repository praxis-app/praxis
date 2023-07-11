import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as fs from "fs";
import { FileUpload } from "graphql-upload";
import { FindOptionsWhere, In, LessThan, MoreThan, Repository } from "typeorm";
import { randomDefaultImagePath, saveImage } from "../images/image.utils";
import { ImagesService, ImageTypes } from "../images/images.service";
import { Image } from "../images/models/image.model";
import { CreateEventInput } from "./models/create-event.input";
import {
  EventAttendee,
  EventAttendeeStatus,
} from "./event-attendees/models/event-attendee.model";
import { Event } from "./models/event.model";
import { UpdateEventInput } from "./models/update-event.input";
import { EventAttendeesService } from "./event-attendees/event-attendees.service";
import { EventsInput, EventTimeFrame } from "./models/events.input";

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

  // TODO: Add logic for filtering by this-week
  async getEvents({ timeFrame, online }: EventsInput) {
    let where: FindOptionsWhere<Event> = { online };

    if (timeFrame === EventTimeFrame.Past) {
      where = { ...where, startsAt: LessThan(new Date()) };
    }
    if (timeFrame === EventTimeFrame.Future) {
      where = { ...where, startsAt: MoreThan(new Date()) };
    }

    return this.eventRepository.find({
      order: { updatedAt: "DESC" },
      where,
    });
  }

  async getAttendingStatus(id: number, userId: number) {
    const eventAttendee = await this.eventAttendeesService.getEventAttendee({
      eventId: id,
      userId,
    });
    return eventAttendee?.status || null;
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

  async updateEvent({ id, ...eventData }: UpdateEventInput) {
    await this.eventRepository.update(id, eventData);
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
