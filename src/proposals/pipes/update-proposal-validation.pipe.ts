import { ValidationError } from '@nestjs/apollo';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageTypes } from '../../images/image.constants';
import { Vote } from '../../votes/models/vote.model';
import { UpdateProposalInput } from '../models/update-proposal.input';
import { ProposalActionType } from '../proposals.constants';
import { ProposalsService } from '../proposals.service';

@Injectable()
export class UpdateProposalValidationPipe implements PipeTransform {
  constructor(
    private proposalsService: ProposalsService,

    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
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
    if (actionType === ProposalActionType.CHANGE_GROUP_NAME && !groupName) {
      throw new ValidationError(
        'Proposals to change group name must include a name field',
      );
    }
    if (
      actionType === ProposalActionType.CHANGE_GROUP_DESCRIPTION &&
      !groupDescription
    ) {
      throw new ValidationError(
        'Proposals to change group description must include a description field',
      );
    }
    if (
      actionType === ProposalActionType.CHANGE_GROUP_COVER_PHOTO &&
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
    const votesCount = await this.voteRepository.count({
      where: { proposalId: value.id },
    });
    if (votesCount) {
      throw new ValidationError(
        'Proposals cannot be updated after receiving votes',
      );
    }
  }
}
