import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FileUpload } from "graphql-upload";
import { FindOptionsWhere, Repository } from "typeorm";
import { EventAttendeeStatus } from "../../../events/event-attendees/models/event-attendee.model";
import { saveImage } from "../../../images/image.utils";
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
      hosts: [
        {
          status: EventAttendeeStatus.Host,
          userId: hostUserId,
        },
      ],
    });
    if (coverPhoto) {
      await this.saveCoverPhoto(proposalActionEvent.id, coverPhoto);
    }
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

  async deleteCoverPhoto(id: number) {
    await this.imagesService.deleteImage({
      imageType: ImageTypes.CoverPhoto,
      event: { id },
    });
  }
}
