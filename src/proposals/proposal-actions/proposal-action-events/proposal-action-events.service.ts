import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  EventAttendee,
  EventAttendeeStatus,
} from '../../../events/event-attendees/models/event-attendee.model';
import { Event } from '../../../events/models/event.model';
import { copyImage, saveImage } from '../../../images/image.utils';
import { ImagesService, ImageTypes } from '../../../images/images.service';
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

    @InjectRepository(EventAttendee)
    private eventAttendeeRepository: Repository<EventAttendee>,

    private imagesService: ImagesService,
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
    return this.imagesService.getImage({
      imageType: ImageTypes.CoverPhoto,
      proposalActionEventId,
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
      await this.imagesService.saveDefaultCoverPhoto({
        proposalActionEventId: proposalActionEvent.id,
      });
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
      await this.imagesService.createImage({
        eventId: event.id,
        filename: imageFilename,
        imageType: coverPhoto?.imageType,
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
    return this.imagesService.createImage({
      imageType: ImageTypes.CoverPhoto,
      proposalActionEventId,
      filename,
    });
  }

  async deleteCoverPhoto(id: number) {
    await this.imagesService.deleteImage({
      imageType: ImageTypes.CoverPhoto,
      event: { id },
    });
  }
}
