import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { GroupsService } from '../../groups/groups.service';
import { CreateProposalInput } from '../models/create-proposal.input';
import { ProposalActionType } from '../proposals.constants';

@Injectable()
export class CreateProposalValidationPipe implements PipeTransform {
  constructor(private groupsService: GroupsService) {}

  async transform(value: CreateProposalInput, metadata: ArgumentMetadata) {
    if (metadata.metatype?.name === CreateProposalInput.name) {
      await this.validateProposalAction(value);
      await this.validateClosingAt(value);
      await this.validateGroupId(value);
    }
    return value;
  }

  async validateProposalAction({ action }: CreateProposalInput) {
    if (!action) {
      throw new Error('Proposals must include an action');
    }
    const { actionType, groupCoverPhoto, groupDescription, groupName, role } =
      action;
    if (actionType === ProposalActionType.ChangeGroupName && !groupName) {
      throw new Error(
        'Proposals to change group name must include a name field',
      );
    }
    if (
      actionType === ProposalActionType.ChangeGroupDescription &&
      !groupDescription
    ) {
      throw new Error(
        'Proposals to change group description must include a description field',
      );
    }
    if (
      actionType === ProposalActionType.ChangeGroupCoverPhoto &&
      !groupCoverPhoto
    ) {
      throw new Error(
        'Proposals to change group cover photo must include an image',
      );
    }
    if (
      !role &&
      (actionType === ProposalActionType.CreateGroupRole ||
        actionType === ProposalActionType.ChangeGroupRole)
    ) {
      throw new Error(
        'Proposals to change or add group roles must include a role',
      );
    }
  }

  async validateClosingAt({ closingAt, ...proposalData }: CreateProposalInput) {
    if (!closingAt) {
      return;
    }

    const { config } = await this.groupsService.getGroup(
      { id: proposalData.groupId },
      ['config'],
    );

    const groupClosingAt = config.votingTimeLimit
      ? new Date(Date.now() + config.votingTimeLimit * 60 * 1000)
      : undefined;

    if (closingAt < new Date()) {
      throw new Error('Closing time must be in the future');
    }
    if (groupClosingAt && closingAt < groupClosingAt) {
      throw new Error('Voting time limit must not be shorter than group limit');
    }
  }

  // TODO: Remove once support for server proposals has been added
  async validateGroupId({ groupId }: CreateProposalInput) {
    if (!groupId) {
      throw new Error('Only group proposals are supported at this time');
    }
  }
}
