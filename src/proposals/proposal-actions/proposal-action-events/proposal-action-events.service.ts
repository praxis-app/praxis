import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { ImagesService, ImageTypes } from "../../../images/images.service";
import { ProposalActionEvent } from "./models/proposal-action-event.model";

@Injectable()
export class ProposalActionEventsService {
  constructor(
    @InjectRepository(ProposalActionEvent)
    private proposalActionEventRepository: Repository<ProposalActionEvent>,

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

  async getProposalActionEventCoverPhoto(proposalActionEventId: number) {
    return this.imagesService.getImage({
      imageType: ImageTypes.CoverPhoto,
      proposalActionEventId,
    });
  }
}
