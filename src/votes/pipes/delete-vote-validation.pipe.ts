import { ValidationError } from '@nestjs/apollo';
import { Injectable, PipeTransform } from '@nestjs/common';
import { ProposalStage } from '../../proposals/proposals.constants';
import { QuestionnaireTicketStatus } from '../../vibe-check/models/questionnaire-ticket.model';
import { VotesService } from '../votes.service';

@Injectable()
export class DeleteVoteValidationPipe implements PipeTransform {
  constructor(private votesService: VotesService) {}

  async transform(value: any) {
    if (typeof value !== 'number') {
      throw new ValidationError('Vote ID must be a number');
    }
    const { proposal, questionnaireTicket } = await this.votesService.getVote(
      value,
      ['proposal', 'questionnaireTicket'],
    );

    if (proposal && proposal.stage === ProposalStage.Ratified) {
      throw new ValidationError(
        'Proposal has been ratified and can no longer be voted on',
      );
    }

    if (questionnaireTicket) {
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

    return value;
  }
}
