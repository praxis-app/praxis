import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { NotificationType } from '../notifications/notifications.constants';
import { NotificationsService } from '../notifications/notifications.service';
import { ProposalsService } from '../proposals/proposals.service';
import { CreateVoteInput } from './models/create-vote.input';
import { UpdateVoteInput } from './models/update-vote.input';
import { Vote } from './models/vote.model';
import { VoteTypes } from './votes.constants';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private repository: Repository<Vote>,

    private proposalsService: ProposalsService,

    private notificationsService: NotificationsService,
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

    const proposal = await this.proposalsService.getProposal(vote.proposalId);

    if (vote.userId !== proposal.userId) {
      const voteNotificationType = this.getVoteNotificationType(vote.voteType);
      await this.notificationsService.createNotification({
        notificationType: voteNotificationType,
        otherUserId: vote.userId,
        userId: proposal.userId,
        proposalId: proposal.id,
        voteId: vote.id,
      });
    }

    return { vote };
  }

  getVoteNotificationType(voteType: string) {
    if (voteType === VoteTypes.Reservations) {
      return NotificationType.ProposalVoteReservations;
    }
    if (voteType === VoteTypes.StandAside) {
      return NotificationType.ProposalVoteStandAside;
    }
    if (voteType === VoteTypes.Block) {
      return NotificationType.ProposalVoteBlock;
    }
    return NotificationType.ProposalVoteAgreement;
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
