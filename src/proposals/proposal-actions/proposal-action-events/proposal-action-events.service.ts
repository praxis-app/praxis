import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { EventAttendeeStatus } from "../../../events/event-attendees/models/event-attendee.model";
import { ImagesService, ImageTypes } from "../../../images/images.service";
import { ProposalActionEventHost } from "./models/proposal-action-event-host.model";
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
}
