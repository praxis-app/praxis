// TODO: Determine whether this should be moved to shield or service level

import { ValidationError } from '@nestjs/apollo';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ProposalStage } from '../../proposals/proposals.constants';
import { ProposalsService } from '../../proposals/proposals.service';
import { CreateVoteInput } from '../models/create-vote.input';

@Injectable()
export class CreateVoteValidationPipe implements PipeTransform {
  constructor(private proposalsService: ProposalsService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.metatype?.name === CreateVoteInput.name && value.proposalId) {
      await this.validateProposalStage(value.proposalId);
    }
    return value;
  }

  async validateProposalStage(proposalId: number) {
    const proposal = await this.proposalsService.getProposal(proposalId);
    if (proposal.stage === ProposalStage.Ratified) {
      throw new ValidationError(
        'Proposal has been ratified and can no longer be voted on',
      );
    }
  }
}
