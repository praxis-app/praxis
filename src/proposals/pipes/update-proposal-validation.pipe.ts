import { ValidationError } from '@nestjs/apollo';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ImageTypes } from '../../images/images.service';
import { VotesService } from '../../votes/votes.service';
import { UpdateProposalInput } from '../models/update-proposal.input';
import { ProposalActionType } from '../proposals.constants';
import { ProposalsService } from '../proposals.service';

@Injectable()
export class UpdateProposalValidationPipe implements PipeTransform {
  constructor(
    private proposalsService: ProposalsService,
    private votesService: VotesService,
  ) {}

  async transform(value: UpdateProposalInput, metadata: ArgumentMetadata) {
    if (metadata.metatype?.name === UpdateProposalInput.name) {
      await this.validateProposalAction(value);
      await this.validateVotesReceived(value);
    }
    return value;
  }

  async validateProposalAction({
    id,
    action: { actionType, groupName, groupDescription, groupCoverPhoto },
  }: UpdateProposalInput) {
    if (actionType === ProposalActionType.ChangeGroupName && !groupName) {
      throw new ValidationError(
        'Proposals to change group name must include a name field',
      );
    }
    if (
      actionType === ProposalActionType.ChangeGroupDescription &&
      !groupDescription
    ) {
      throw new ValidationError(
        'Proposals to change group description must include a description field',
      );
    }
    if (
      actionType === ProposalActionType.ChangeGroupCoverPhoto &&
      !groupCoverPhoto
    ) {
      const proposal = await this.proposalsService.getProposal(id, [
        'action.images',
      ]);
      const alreadyExisting = proposal.images.some(
        (image) => image.imageType === ImageTypes.CoverPhoto,
      );
      if (alreadyExisting) {
        return;
      }
      throw new ValidationError(
        'Proposals to change group cover photo must include an image',
      );
    }
  }

  async validateVotesReceived(value: UpdateProposalInput) {
    const votes = await this.votesService.getVotes({
      proposalId: value.id,
    });
    if (votes.length) {
      throw new ValidationError(
        'Proposals cannot be updated after receiving votes',
      );
    }
  }
}
