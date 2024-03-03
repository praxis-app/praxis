import { ValidationError } from '@nestjs/apollo';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ProposalStage } from '../../proposals/proposals.constants';
import { QuestionnaireTicketStatus } from '../../vibe-check/models/questionnaire-ticket.model';
import { UpdateVoteInput } from '../models/update-vote.input';
import { VotesService } from '../votes.service';

@Injectable()
export class UpdateVoteValidationPipe implements PipeTransform {
  constructor(private votesService: VotesService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.metatype?.name === UpdateVoteInput.name && value.id) {
      const { proposal, questionnaireTicket } = await this.votesService.getVote(
        value.id,
        ['proposal', 'questionnaireTicket'],
      );

      if (proposal && proposal.stage === ProposalStage.Ratified) {
        throw new ValidationError(
          'Proposal has been ratified and can no longer be voted on',
        );
      }

      if (questionnaireTicket) {
        if (
          questionnaireTicket.status === QuestionnaireTicketStatus.InProgress
        ) {
          throw new ValidationError(
            'Questionnaire ticket has not been submitted yet',
          );
        }
        if (
          questionnaireTicket.status !== QuestionnaireTicketStatus.Submitted
        ) {
          throw new ValidationError(
            'Questionnaire ticket can no longer be voted on',
          );
        }
      }
    }

    return value;
  }
}
