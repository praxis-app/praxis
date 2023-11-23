import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ProposalActionGroupConfigInput } from './models/proposal-action-group-config.input';
import { ProposalActionGroupConfig } from './models/proposal-action-group-config.model';

@Injectable()
export class ProposalActionGroupConfigsService {
  constructor(
    @InjectRepository(ProposalActionGroupConfig)
    private repository: Repository<ProposalActionGroupConfig>,
  ) {}

  async getProposalActionGroupConfig(
    where: FindOptionsWhere<ProposalActionGroupConfig>,
    relations?: string[],
  ) {
    return this.repository.findOne({ where, relations });
  }

  async createProposalActionGroupConfig(
    proposalActionId: number,
    proposalActionGroupConfigData: ProposalActionGroupConfigInput,
  ) {
    const proposalActionGroupConfig = await this.repository.save({
      ...proposalActionGroupConfigData,
      proposalActionId,
    });
    return proposalActionGroupConfig;
  }
}
