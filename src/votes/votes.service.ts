import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ProposalsService } from '../proposals/proposals.service';
import { CreateVoteInput } from './models/create-vote.input';
import { UpdateVoteInput } from './models/update-vote.input';
import { Vote } from './models/vote.model';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private repository: Repository<Vote>,

    private proposalsService: ProposalsService,
  ) {}

  async getVote(id: number, relations?: string[]) {
    return this.repository.findOneOrFail({ where: { id }, relations });
  }

  async getVotes(where?: FindOptionsWhere<Vote>) {
    return this.repository.find({ where });
  }

  async createVote(voteData: CreateVoteInput, userId: number) {
    const vote = await this.repository.save({
      ...voteData,
      userId,
    });
    const isProposalRatifiable =
      await this.proposalsService.isProposalRatifiable(vote.proposalId);
    if (isProposalRatifiable) {
      await this.proposalsService.ratifyProposal(vote.proposalId);
      await this.proposalsService.implementProposal(vote.proposalId);
    }
    return { vote };
  }

  async updateVote({ id, ...data }: UpdateVoteInput) {
    await this.repository.update(id, data);
    const vote = await this.getVote(id);
    return { vote };
  }

  async deleteVote(voteId: number) {
    await this.repository.delete(voteId);
    return true;
  }
}
