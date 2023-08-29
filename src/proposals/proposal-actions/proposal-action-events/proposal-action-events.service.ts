import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { ProposalActionEvent } from "./models/proposal-action-event.model";

@Injectable()
export class ProposalActionEventsService {
  constructor(
    @InjectRepository(ProposalActionEvent)
    private proposalActionEventRepository: Repository<ProposalActionEvent>
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
}
