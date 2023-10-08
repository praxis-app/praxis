import { ValidationError } from '@nestjs/apollo';
import { Injectable, PipeTransform } from '@nestjs/common';
import { VotesService } from '../../votes/votes.service';

@Injectable()
export class DeleteProposalValidationPipe implements PipeTransform {
  constructor(private votesService: VotesService) {}

  async transform(value: number) {
    await this.validateVotesReceived(value);
    return value;
  }

  async validateVotesReceived(value: number) {
    const votes = await this.votesService.getVotes({ proposalId: value });
    if (votes.length) {
      throw new ValidationError(
        'Proposals cannot be deleted after receiving votes',
      );
    }
  }
}
