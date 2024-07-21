import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { GroupsService } from '../../groups/groups.service';
import { CreateProposalInput } from '../models/create-proposal.input';
import { ProposalActionType } from '../proposals.constants';

const VALID_SERVER_ACTIONS = [
  ProposalActionType.CreateRole,
  ProposalActionType.ChangeRole,
  ProposalActionType.Test,
];

@Injectable()
export class CreateProposalValidationPipe implements PipeTransform {
  constructor(private groupsService: GroupsService) {}

  async transform(value: CreateProposalInput, metadata: ArgumentMetadata) {
    if (metadata.metatype?.name === CreateProposalInput.name) {
      await this.validateProposalAction(value);
      await this.validateClosingAt(value);
    }
    return value;
  }

  async validateProposalAction({ action, groupId }: CreateProposalInput) {
    if (!action) {
      throw new Error('Proposals must include an action');
    }
    const { actionType, groupCoverPhoto, groupDescription, groupName, role } =
      action;

    // Validate that the action type is valid for proposal scope
    if (!groupId && !VALID_SERVER_ACTIONS.includes(actionType)) {
      throw new Error(`Invalid action type for server proposal: ${actionType}`);
    }

    // Validate that required fields are present for all actions
    if (actionType === ProposalActionType.ChangeName && !groupName) {
      throw new Error(
        'Proposals to change group name must include a name field',
      );
    }
    if (
      actionType === ProposalActionType.ChangeDescription &&
      !groupDescription
    ) {
      throw new Error(
        'Proposals to change group description must include a description field',
      );
    }
    if (
      actionType === ProposalActionType.ChangeCoverPhoto &&
      !groupCoverPhoto
    ) {
      throw new Error(
        'Proposals to change group cover photo must include an image',
      );
    }
    if (
      !role &&
      (actionType === ProposalActionType.CreateRole ||
        actionType === ProposalActionType.ChangeRole)
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
}
