import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as fs from "fs";
import { FileUpload } from "graphql-upload";
import { FindOptionsWhere, Repository } from "typeorm";
import {
  EventAttendee,
  EventAttendeeStatus,
} from "../../../events/event-attendees/models/event-attendee.model";
import { Event } from "../../../events/models/event.model";
import { randomDefaultImagePath, saveImage } from "../../../images/image.utils";
import { ImagesService, ImageTypes } from "../../../images/images.service";
import { ProposalActionEventHost } from "./models/proposal-action-event-host.model";
import { ProposalActionEventInput } from "./models/proposal-action-event.input";
import { ProposalActionEvent } from "./models/proposal-action-event.model";

@Injectable()
export class ProposalActionEventsService {
  constructor(
    @InjectRepository(ProposalActionEvent)
    private proposalActionEventRepository: Repository<ProposalActionEvent>,

    @InjectRepository(ProposalActionEventHost)
    private proposalActionEventHostRepository: Repository<ProposalActionEventHost>,

    @InjectRepository(Event)
    private eventRepository: Repository<Event>,

    @InjectRepository(EventAttendee)
    private eventAttendeeRepository: Repository<EventAttendee>,

    private imagesService: ImagesService
  ) {}

  async getProposalActionEvent(
    where: FindOptionsWhere<ProposalActionEvent>,
    relations?: string[]
  ) {
    return this.proposalActionEventRepository.findOne({
      where,
      relations,
    });
  }

  async getProposalActionEventHost(proposalActionEventId: number) {
    return this.proposalActionEventHostRepository.findOne({
      where: { proposalActionEventId, status: EventAttendeeStatus.Host },
    });
  }

  async getProposalActionEventCoverPhoto(proposalActionEventId: number) {
    return this.imagesService.getImage({
      imageType: ImageTypes.CoverPhoto,
      proposalActionEventId,
    });
  }

  async createProposalActionEvent(
    proposalActionId: number,
    {
      coverPhoto,
      hostUserId,
      ...proposalActionEventData
    }: Partial<ProposalActionEventInput>
  ) {
    const proposalActionEvent = await this.proposalActionEventRepository.save({
      ...proposalActionEventData,
      proposalActionId,
    });
    await this.proposalActionEventHostRepository.save({
      proposalActionEventId: proposalActionEvent.id,
      status: EventAttendeeStatus.Host,
      userId: hostUserId,
    });
    if (coverPhoto) {
      await this.saveCoverPhoto(proposalActionEvent.id, coverPhoto);
    } else {
      await this.saveDefaultCoverPhoto(proposalActionEvent.id);
    }
  }

  async createEventFromProposalAction(
    { images, ...eventData }: ProposalActionEvent,
    hostId: number
  ) {
    const event = await this.eventRepository.save(eventData);
    const coverPhoto = images.find(
      ({ imageType }) => imageType === ImageTypes.CoverPhoto
    );
    await this.eventAttendeeRepository.save({
      status: EventAttendeeStatus.Host,
      eventId: event.id,
      hostId,
    });
    await this.imagesService.createImage({
      ...coverPhoto,
      eventId: event.id,
    });
  }

  async saveCoverPhoto(
    proposalActionEventId: number,
    coverPhoto: Promise<FileUpload>
  ) {
    const filename = await saveImage(coverPhoto);
    await this.deleteCoverPhoto(proposalActionEventId);

    return this.imagesService.createImage({
      imageType: ImageTypes.CoverPhoto,
      proposalActionEventId,
      filename,
    });
  }

  // TODO: Move to images service to be used for all cover photos
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
}
