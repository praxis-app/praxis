import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  EventAttendee,
  EventAttendeeStatus,
} from '../../../events/event-attendees/models/event-attendee.model';
import { Event } from '../../../events/models/event.model';
import { ImageTypes } from '../../../images/image.constants';
import {
  copyImage,
  saveDefaultImage,
  saveImage,
} from '../../../images/image.utils';
import { Image } from '../../../images/models/image.model';
import { ProposalActionEventHost } from './models/proposal-action-event-host.model';
import { ProposalActionEventInput } from './models/proposal-action-event.input';
import { ProposalActionEvent } from './models/proposal-action-event.model';

@Injectable()
export class ProposalActionEventsService {
  constructor(
    @InjectRepository(ProposalActionEvent)
    private proposalActionEventRepository: Repository<ProposalActionEvent>,

    @InjectRepository(ProposalActionEventHost)
    private proposalActionEventHostRepository: Repository<ProposalActionEventHost>,

    @InjectRepository(Event)
    private eventRepository: Repository<Event>,

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

    @InjectRepository(EventAttendee)
    private eventAttendeeRepository: Repository<EventAttendee>,
  ) {}

  async getProposalActionEvent(
    where: FindOptionsWhere<ProposalActionEvent>,
    relations?: string[],
  ) {
    return this.proposalActionEventRepository.findOne({
      where,
      relations,
    });
  }

  async getProposalActionEventHost(proposalActionEventId: number) {
    const host = await this.proposalActionEventHostRepository.findOne({
      where: { proposalActionEventId, status: EventAttendeeStatus.Host },
      relations: ['user'],
    });
    if (!host) {
      throw new Error('Could not find host for proposal action event');
    }
    return host.user;
  }

  async getProposalActionEventCoverPhoto(proposalActionEventId: number) {
    return this.imageRepository.findOne({
      where: { proposalActionEventId, imageType: ImageTypes.CoverPhoto },
    });
  }

  async createProposalActionEvent(
    proposalActionId: number,
    {
      hostId,
      coverPhoto,
      ...proposalActionEventData
    }: Partial<ProposalActionEventInput>,
  ) {
    const proposalActionEvent = await this.proposalActionEventRepository.save({
      ...proposalActionEventData,
      proposalActionId,
    });
    await this.proposalActionEventHostRepository.save({
      proposalActionEventId: proposalActionEvent.id,
      status: EventAttendeeStatus.Host,
      userId: hostId,
    });
    if (coverPhoto) {
      await this.saveCoverPhoto(proposalActionEvent.id, coverPhoto);
    } else {
      await this.saveDefaultCoverPhoto(proposalActionEvent.id);
    }
  }

  async createEventFromProposalAction(
    { images, ...eventData }: ProposalActionEvent,
    groupId: number,
    hostId: number,
  ) {
    const event = await this.eventRepository.save({ ...eventData, groupId });
    try {
      await this.eventAttendeeRepository.save({
        status: EventAttendeeStatus.Host,
        eventId: event.id,
        userId: hostId,
      });
      const coverPhoto = images.find(
        ({ imageType }) => imageType === ImageTypes.CoverPhoto,
      );
      if (!coverPhoto) {
        throw new Error();
      }
      const imageFilename = copyImage(coverPhoto.filename);
      await this.imageRepository.save({
        eventId: event.id,
        filename: imageFilename,
        imageType: coverPhoto.imageType,
      });
    } catch {
      await this.eventRepository.delete(event.id);
      throw new Error('Failed to create event from proposal action');
    }
  }

  async saveCoverPhoto(
    proposalActionEventId: number,
    coverPhoto: Promise<FileUpload>,
  ) {
    const filename = await saveImage(coverPhoto);
    return this.imageRepository.save({
      imageType: ImageTypes.CoverPhoto,
      proposalActionEventId,
      filename,
    });
  }

  async saveDefaultCoverPhoto(proposalActionEventId: number) {
    const filename = await saveDefaultImage();
    return this.imageRepository.save({
      imageType: ImageTypes.CoverPhoto,
      proposalActionEventId,
      filename,
    });
  }

  // TODO: Ensure image file is deleted
  async deleteCoverPhoto(id: number) {
    await this.imageRepository.delete({
      imageType: ImageTypes.CoverPhoto,
      event: { id },
    });
  }
}
