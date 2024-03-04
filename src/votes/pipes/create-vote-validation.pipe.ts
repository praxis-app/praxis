// TODO: Determine whether this should be moved to service

import { ValidationError } from '@nestjs/apollo';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ProposalStage } from '../../proposals/proposals.constants';
import { ProposalsService } from '../../proposals/proposals.service';
import { QuestionnaireTicketStatus } from '../../vibe-check/models/questionnaire-ticket.model';
import { VibeCheckService } from '../../vibe-check/vibe-check.service';
import { CreateVoteInput } from '../models/create-vote.input';

@Injectable()
export class CreateVoteValidationPipe implements PipeTransform {
  constructor(
    private proposalsService: ProposalsService,
    private vibeCheckService: VibeCheckService,
  ) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.metatype?.name === CreateVoteInput.name && value.proposalId) {
      await this.validateProposalStage(value.proposalId);
    }
    if (
      metadata.metatype?.name === CreateVoteInput.name &&
      value.questionnaireTicketId
    ) {
      await this.validateQuestionnaireTicketStatus(value.questionnaireTicketId);
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

  async validateQuestionnaireTicketStatus(questionnaireTicketId: number) {
    const questionnaireTicket =
      await this.vibeCheckService.getQuestionnaireTicket(questionnaireTicketId);
    if (questionnaireTicket.status === QuestionnaireTicketStatus.InProgress) {
      throw new ValidationError(
        'Questionnaire ticket has not been submitted yet',
      );
    }
    if (questionnaireTicket.status !== QuestionnaireTicketStatus.Submitted) {
      throw new ValidationError(
        'Questionnaire ticket can no longer be voted on',
      );
    }
  }
}
